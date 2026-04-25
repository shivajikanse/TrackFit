const router = require('express').Router();
const { protect, trainerOnly, memberOnly } = require('../middleware/auth');
const {
  assignDiet, aiGenerateDiet, getMyDiet, getMemberDiets, updateDiet, deleteDiet,
} = require('../controllers/dietController');

// Member routes
router.get('/my-plan', protect, memberOnly, getMyDiet);

// Trainer routes
router.post('/assign/:memberId', protect, trainerOnly, assignDiet);
router.post('/ai-generate/:memberId', protect, trainerOnly, aiGenerateDiet);
router.get('/member/:memberId', protect, trainerOnly, getMemberDiets);
router.put('/:planId', protect, trainerOnly, updateDiet);
router.delete('/:planId', protect, trainerOnly, deleteDiet);

module.exports = router;
