const Issue = require('../models/Issue');

// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';

    // Admin: system-wide counts. User: counts for their visible issues only.
    const baseFilter = isAdmin
      ? {}
      : { $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] };

    const [total, open, inProgress, closed] = await Promise.all([
      Issue.countDocuments(baseFilter),
      Issue.countDocuments({ ...baseFilter, status: 'Open' }),
      Issue.countDocuments({ ...baseFilter, status: 'In Progress' }),
      Issue.countDocuments({ ...baseFilter, status: 'Closed' }),
    ]);

    res.json({ total, open, inProgress, closed });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
