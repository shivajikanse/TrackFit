const router = require('express').Router();
const { protect, memberOnly, trainerOnly } = require('../middleware/auth');
const {
  logProgress, getProgressHistory, getAIFeedback,
  addTrainerNotes, getProgressAnalytics,
} = require('../controllers/progressController');

// Member routes
router.post('/log', protect, memberOnly, logProgress);
router.get('/history', protect, getProgressHistory);
router.get('/analytics', protect, getProgressAnalytics);

// Trainer routes - for a specific member
router.get('/history/:memberId', protect, trainerOnly, getProgressHistory);
router.get('/analytics/:memberId', protect, trainerOnly, getProgressAnalytics);
router.put('/:progressId/trainer-notes', protect, trainerOnly, addTrainerNotes);

module.exports = router;
