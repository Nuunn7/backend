const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity_controller');
const { protect, authorize } = require('../middlewares/auth');
const {
  validateActivity,
  validateActivityUpdate,
  validateVerify,
  validateListQuery,
} = require('../validators/activity_validator');

// public routes
router.get('/', validateListQuery, activityController.getAll);
router.get('/:id', activityController.getById);

// protected routes
router.post(
  '/',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  validateActivity,
  activityController.create
);

router.put(
  '/:id',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  validateActivityUpdate,
  activityController.update
);

router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  activityController.remove
);

router.post('/:id/join', protect, activityController.join);

router.post(
  '/:id/verify/:userId',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  validateVerify,
  activityController.verifyParticipation
);

router.get(
  '/:id/participations',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  activityController.getParticipations
);

router.patch(
  '/:id/cancel',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  activityController.cancelActivity
);

module.exports = router;