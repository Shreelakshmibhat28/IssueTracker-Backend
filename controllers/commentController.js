const Comment = require('../models/Comment');
const Issue = require('../models/Issue');

// Check if the current user can view a given issue
const canViewIssue = (issue, user) => {
  if (user.role === 'admin') return true;
  const isCreator = issue.createdBy.toString() === user._id.toString();
  const isAssignee = issue.assignedTo && issue.assignedTo.toString() === user._id.toString();
  return isCreator || isAssignee;
};

// GET /api/issues/:id/comments
const getComments = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    if (!canViewIssue(issue, req.user)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const comments = await Comment.find({ issue: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// POST /api/issues/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    if (!canViewIssue(issue, req.user)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const comment = await Comment.create({
      issue: req.params.id,
      user: req.user._id,
      content: content.trim(),
    });

    const populated = await comment.populate('user', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/issues/:id/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Verify comment belongs to this issue
    if (comment.issue.toString() !== req.params.id) {
      return res.status(400).json({ message: 'Comment does not belong to this issue.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = comment.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, addComment, deleteComment };
