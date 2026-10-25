const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isMongoConnected } = require('../config/db');
const { readDB } = require('../config/localStore');

// Middleware bắt buộc đăng nhập
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (isMongoConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const db = readDB();
        const found = db.users.find((u) => String(u._id) === String(decoded.id));
        if (found) {
          const { password, ...userWithoutPassword } = found;
          req.user = userWithoutPassword;
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  }

  return res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện thao tác này' });
};

// Middleware chỉ cho phép Quản trị viên (Admin)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Truy cập bị từ chối: Chỉ dành cho Quản trị viên (Admin)' });
};

module.exports = { protect, adminOnly };
