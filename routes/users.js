const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { getAllUsers, getActiveUsers, updateUserStatus } = require('../controllers/userController');

const router = express.Router();

// All routes require auth
router.use(protect);

// Active user list — for assignee dropdown, any authenticated user
router.get('/active', getActiveUsers);

// Admin-only routes
router.get('/', adminOnly, getAllUsers);
router.patch('/:id/status', adminOnly, updateUserStatus);

module.exports = router;
