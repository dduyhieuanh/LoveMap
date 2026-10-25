const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getAllUsers,
  adminUpdateUser,
  adminDeleteUser,
} = require('../controllers/auth.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Routes dành riêng cho Quản trị viên (Admin)
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, adminUpdateUser);
router.delete('/users/:id', protect, adminOnly, adminDeleteUser);

module.exports = router;
