const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const { protect, authorize } = require('../middlewares/auth');
const {
  validateUpdateProfile,
  validateChangePassword,
  validateChangeRole,
} = require('../validators/user_validator');

router.use(protect);

router.put('/profile', validateUpdateProfile, userController.updateProfile);
router.put('/password', validateChangePassword, userController.changePassword);

router.get('/:id/participations', userController.getParticipations);
router.get('/:id/certificates', userController.getCertificates);

router.get('/', authorize('ADMIN'), userController.getAll);
router.get('/:id', authorize('ADMIN', 'ORGANIZER'), userController.getById);
router.patch('/:id/role', authorize('ADMIN'), validateChangeRole, userController.changeRole);
router.delete('/:id', authorize('ADMIN'), userController.remove);

module.exports = router;