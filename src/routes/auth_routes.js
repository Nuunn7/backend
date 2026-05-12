const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');
const { protect } = require('../middlewares/auth');
const { validateRegister, validateLogin } = require('../validators/auth_validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;