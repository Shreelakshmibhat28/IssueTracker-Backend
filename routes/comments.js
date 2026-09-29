const express = require('express');
const { protect } = require('../middleware/auth');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');

const router = express.Router();

router.use(protect);

router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
