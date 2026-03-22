const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity_controller');
const { protect, authorize } = require('../middlewares/auth');
const { validateActivity } = require('../validators/activity_validator');

router.get('/', activityController.getAll);
router.get('/:id', activityController.getById);
router.post('/', protect, authorize('ORGANIZER', 'ADMIN'), validateActivity, activityController.create);
router.put('/:id', protect, authorize('ORGANIZER', 'ADMIN'), activityController.update);
router.delete('/:id', protect, authorize('ADMIN'), activityController.remove);
router.post('/:id/join', protect, activityController.join);
router.post('/:id/verify/:userId', protect, authorize('ORGANIZER', 'ADMIN'), activityController.verifyParticipation);

module.exports = router;