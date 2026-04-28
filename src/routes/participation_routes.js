const express = require('express');
const router = express.Router();
const participationController = require('../controllers/participation_controller');
const { protect, authorize } = require('../middlewares/auth');
const { validateListQuery } = require('../validators/participation_validator');

router.use(protect);

// GET /participations (admin only, with filters)
router.get('/', authorize('ADMIN'), validateListQuery, participationController.getAll);

// GET /participations/:id (owner, activity organizer, or admin)
router.get('/:id', participationController.getById);

// PATCH /participations/:id/reject (organizer or admin)
router.patch(
  '/:id/reject',
  authorize('ORGANIZER', 'ADMIN'),
  participationController.reject
);

// DELETE /participations/:id (owner with PENDING status, or admin)
router.delete('/:id', participationController.remove);

module.exports = router;