const router = require("express").Router();
const { protect, trainerOnly } = require("../middleware/auth");
const {
  addMember,
  getMembers,
  getMemberDetails,
  removeMember,
  getDashboard,
} = require("../controllers/trainerController");

router.use(protect, trainerOnly);

router.get("/dashboard", getDashboard);
router.post("/member", addMember);
router.get("/members", getMembers);
router.get("/members/:memberId", getMemberDetails);
router.delete("/members/:memberId", removeMember);

module.exports = router;
