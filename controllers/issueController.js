const { validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Build the visibility filter for non-admin users
const userVisibilityFilter = (userId) => ({
  $or: [{ createdBy: userId }, { assignedTo: userId }],
});

// GET /api/issues
const getIssues = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const filter = req.user.role === 'admin' ? {} : userVisibilityFilter(req.user._id);

    if (status && ['Open', 'In Progress', 'Closed'].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const issues = await Issue.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    next(err);
  }
};

// GET /api/issues/:id
const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    // Non-admin can only see issues they created or are assigned to
    if (req.user.role !== 'admin') {
      const isCreator = issue.createdBy._id.toString() === req.user._id.toString();
      const isAssignee = issue.assignedTo && issue.assignedTo._id.toString() === req.user._id.toString();
      if (!isCreator && !isAssignee) {
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    res.json(issue);
  } catch (err) {
    next(err);
  }
};

// POST /api/issues
const createIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, description, assignedTo } = req.body;

    // Validate assignee if provided
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee || !assignee.isActive) {
        return res.status(400).json({ message: 'Assignee must be an active user.' });
      }
    }

    const issue = await Issue.create({
      title,
      description,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
    });

    const populated = await issue.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// PUT /api/issues/:id
const updateIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = issue.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only edit your own issues.' });
    }

    const { title, description, status } = req.body;

    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (status !== undefined) issue.status = status;

    // Non-admin cannot change assignee; admin uses separate assign endpoint
    // (keeping edit separate from assignment per spec)

    await issue.save();

    const populated = await issue.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/issues/:id
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = issue.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only delete your own issues.' });
    }

    // Delete all comments belonging to this issue
    await Comment.deleteMany({ issue: issue._id });
    await issue.deleteOne();

    res.json({ message: 'Issue deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/issues/:id/assign — admin only
const assignIssue = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee || !assignee.isActive) {
        return res.status(400).json({ message: 'Assignee must be an active user.' });
      }
      issue.assignedTo = assignedTo;
    } else {
      issue.assignedTo = null;
    }

    await issue.save();

    const populated = await issue.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/issues/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Open', 'In Progress', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignee = issue.assignedTo && issue.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Only the assignee or admin can change status.' });
    }

    issue.status = status;
    await issue.save();

    const populated = await issue.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    res.json(populated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getIssues, getIssue, createIssue, updateIssue, deleteIssue, assignIssue, updateStatus };
