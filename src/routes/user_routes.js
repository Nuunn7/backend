const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

router.get('/profile', protect, (req, res) => {
  res.json({ success: true, data: req.user });
});

router.get('/', protect, authorize('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'User list - TODO' });
});

module.exports = router;