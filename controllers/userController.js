const User = require('../models/User');

// GET /api/users — admin: list all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/active — auth: list active users (for assignee dropdown)
const getActiveUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('_id name email role').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/status — admin: activate or deactivate a user
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Admin cannot deactivate themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean.' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getActiveUsers, updateUserStatus };
