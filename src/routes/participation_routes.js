const express = require('express');
const router = express.Router();
const participationController = require('../controllers/participation_controller');
const { protect, authorize } = require('../middlewares/auth');
const { validateListQuery } = require('../validators/participation_validator');

router.use(protect);

router.get('/', authorize('ADMIN'), validateListQuery, participationController.getAll);

router.get('/:id', participationController.getById);

router.patch(
  '/:id/reject',
  authorize('ORGANIZER', 'ADMIN'),
  participationController.reject
);

router.delete('/:id', participationController.remove);

module.exports = router;