const mongoose = require('mongoose');
const User = require('../models/User');
const { readDB } = require('./localStore');

let mongoConnected = false;

const ensureMongoAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@datespot.vn').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({
        name: 'Quản trị viên (Admin)',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        bio: 'Tài khoản Quản trị viên hệ thống DateSpot.',
      });
      console.log(`👑 Đã khởi tạo tài khoản Admin mặc định: ${adminEmail}`);
    } else if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
    }
  } catch (err) {
    console.error('Lỗi kiểm tra tài khoản Admin:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    mongoConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await ensureMongoAdmin();
  } catch (error) {
    mongoConnected = false;
    readDB(); // Khởi tạo sẵn dữ liệu mẫu local & tài khoản Admin nếu chưa có
    console.log(
      'ℹ️ Không tìm thấy MongoDB đang chạy tại máy cục bộ -> Tự động kích hoạt Local JSON Database (backend/data/datespot-db.json) với tài khoản Admin & dữ liệu mẫu!'
    );
  }
};

const isMongoConnected = () => mongoConnected;

module.exports = { connectDB, isMongoConnected };
