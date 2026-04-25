const router = require('express').Router();
const { protect, trainerOnly } = require('../middleware/auth');
const {
  addMember, getMembers, getMemberDetails, removeMember,
  broadcast, getBroadcasts, getDashboard,
} = require('../controllers/trainerController');

router.use(protect, trainerOnly);

router.get('/dashboard', getDashboard);
router.post('/member', addMember);
router.get('/members', getMembers);
router.get('/members/:memberId', getMemberDetails);
router.delete('/members/:memberId', removeMember);
router.post('/broadcast', broadcast);
router.get('/broadcasts', getBroadcasts);

module.exports = router;
