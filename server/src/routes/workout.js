const router = require('express').Router();
const { protect, trainerOnly, memberOnly } = require('../middleware/auth');
const {
  assignWorkout, aiGenerateWorkout, getMemberWorkouts,
  getMyWorkout, getWorkoutById, updateWorkout, deleteWorkout,
} = require('../controllers/workoutController');

// Member routes
router.get('/my-plan', protect, memberOnly, getMyWorkout);

// Trainer routes
router.post('/assign/:memberId', protect, trainerOnly, assignWorkout);
router.post('/ai-generate/:memberId', protect, trainerOnly, aiGenerateWorkout);
router.get('/member/:memberId', protect, trainerOnly, getMemberWorkouts);
router.put('/:planId', protect, trainerOnly, updateWorkout);
router.delete('/:planId', protect, trainerOnly, deleteWorkout);

// Shared
router.get('/:planId', protect, getWorkoutById);

module.exports = router;
