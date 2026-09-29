const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  assignIssue,
  updateStatus,
} = require('../controllers/issueController');

const router = express.Router();

router.use(protect);

router.get('/', getIssues);
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('description').optional().trim(),
  ],
  createIssue
);

router.get('/:id', getIssue);
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('status')
      .optional()
      .isIn(['Open', 'In Progress', 'Closed'])
      .withMessage('Invalid status.'),
  ],
  updateIssue
);
router.delete('/:id', deleteIssue);

// Admin-only: reassign
router.patch('/:id/assign', adminOnly, assignIssue);

// Status update: assignee or admin
router.patch('/:id/status', updateStatus);

module.exports = router;
