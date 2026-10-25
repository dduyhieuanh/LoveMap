const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Location = require('../models/Location');
const { isMongoConnected } = require('../config/db');
const { readDB, writeDB, generateId } = require('../config/localStore');

// Hàm tạo JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, bio, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isMongoConnected()) {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({ message: 'Email này đã được sử dụng' });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'user',
        bio: bio || undefined,
        avatar: avatar || undefined,
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        avatar: user.avatar,
        bio: user.bio,
        savedLocations: user.savedLocations,
        token: generateToken(user._id),
      });
    }

    // Fallback Local JSON Database
    const db = readDB();
    if (db.users.some((u) => u.email === normalizedEmail)) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    const now = new Date().toISOString();
    const newUser = {
      _id: generateId(),
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: 'user',
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: bio || 'Yêu thích khám phá những góc cafe và quán ăn hẹn hò lãng mạn.',
      savedLocations: [],
      createdAt: now,
      updatedAt: now,
    };

    db.users.push(newUser);
    writeDB(db);

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      bio: newUser.bio,
      savedLocations: newUser.savedLocations,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký', error: error.message });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isMongoConnected()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        avatar: user.avatar,
        bio: user.bio,
        savedLocations: user.savedLocations,
        token: generateToken(user._id),
      });
    }

    // Fallback Local JSON Database
    const db = readDB();
    const user = db.users.find((u) => u.email === normalizedEmail);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar,
      bio: user.bio,
      savedLocations: user.savedLocations || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập', error: error.message });
  }
};

// @desc    Lấy thông tin hồ sơ hiện tại
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.user._id);
      return res.json(user);
    }
    return res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy thông tin người dùng', error: error.message });
  }
};

// @desc    Cập nhật thông tin hồ sơ cá nhân
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role || 'user',
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        savedLocations: updatedUser.savedLocations,
        token: generateToken(updatedUser._id),
      });
    }

    // Fallback Local JSON Database
    const db = readDB();
    const idx = db.users.findIndex((u) => String(u._id) === String(req.user._id));
    if (idx === -1) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const user = db.users[idx];
    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.avatar = req.body.avatar || user.avatar;
    if (req.body.password && req.body.password.length >= 6) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    user.updatedAt = new Date().toISOString();

    db.users[idx] = user;
    writeDB(db);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar,
      bio: user.bio,
      savedLocations: user.savedLocations,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật hồ sơ', error: error.message });
  }
};

// =======================================================
// QUẢN TRỊ VIÊN (ADMIN): QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG
// =======================================================

// @desc    [Admin] Lấy danh sách toàn bộ tài khoản người dùng
// @route   GET /api/auth/users
// @access  Private / Admin
const getAllUsers = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const users = await User.find().sort({ createdAt: -1 });
      const locations = await Location.find({}, 'createdBy');
      const result = users.map((u) => {
        const count = locations.filter((l) => String(l.createdBy) === String(u._id)).length;
        return {
          ...u.toObject(),
          locationsCount: count,
        };
      });
      return res.json(result);
    }

    const db = readDB();
    const result = db.users.map(({ password, ...u }) => {
      const count = db.locations.filter((l) => String(l.createdBy) === String(u._id)).length;
      return {
        ...u,
        role: u.role || 'user',
        locationsCount: count,
      };
    });
    return res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách tài khoản', error: error.message });
  }
};

// @desc    [Admin] Chỉnh sửa thông tin tài khoản bất kỳ
// @route   PUT /api/auth/users/:id
// @access  Private / Admin
const adminUpdateUser = async (req, res) => {
  try {
    const { name, email, bio, avatar, role, password } = req.body;

    if (isMongoConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản này' });
      }

      if (name !== undefined) user.name = name.trim();
      if (email !== undefined) user.email = email.trim().toLowerCase();
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;
      if (role && ['user', 'admin'].includes(role)) {
        user.role = role;
      }
      if (password && password.trim().length >= 6) {
        user.password = password.trim();
      }

      const updated = await user.save();
      return res.json(updated);
    }

    const db = readDB();
    const idx = db.users.findIndex((u) => String(u._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản này' });
    }

    const target = db.users[idx];
    if (name !== undefined) target.name = name.trim();
    if (email !== undefined) target.email = email.trim().toLowerCase();
    if (bio !== undefined) target.bio = bio;
    if (avatar !== undefined) target.avatar = avatar;
    if (role && ['user', 'admin'].includes(role)) {
      target.role = role;
    }
    if (password && password.trim().length >= 6) {
      target.password = await bcrypt.hash(password.trim(), 10);
    }
    target.updatedAt = new Date().toISOString();

    db.users[idx] = target;
    writeDB(db);

    const { password: _, ...userWithoutPassword } = target;
    return res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật tài khoản', error: error.message });
  }
};

// @desc    [Admin] Xoá tài khoản người dùng và các địa điểm của họ
// @route   DELETE /api/auth/users/:id
// @access  Private / Admin
const adminDeleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Bạn không thể tự xoá tài khoản Admin đang đăng nhập' });
    }

    if (isMongoConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản này' });
      }

      const userLocations = await Location.find({ createdBy: user._id }, '_id');
      const locIds = userLocations.map((l) => l._id);

      await Location.deleteMany({ createdBy: user._id });
      if (locIds.length > 0) {
        await User.updateMany(
          { savedLocations: { $in: locIds } },
          { $pull: { savedLocations: { $in: locIds } } }
        );
      }
      await user.deleteOne();

      return res.json({ message: 'Đã xoá tài khoản và các địa điểm liên quan', id: req.params.id });
    }

    const db = readDB();
    const idx = db.users.findIndex((u) => String(u._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản này' });
    }

    const deletedUserId = db.users[idx]._id;
    const removedLocationIds = db.locations
      .filter((l) => String(l.createdBy) === String(deletedUserId))
      .map((l) => String(l._id));

    db.locations = db.locations.filter((l) => String(l.createdBy) !== String(deletedUserId));
    db.users.splice(idx, 1);

    db.users.forEach((u) => {
      u.savedLocations = (u.savedLocations || []).filter(
        (id) => !removedLocationIds.includes(String(id))
      );
    });

    writeDB(db);
    return res.json({ message: 'Đã xoá tài khoản và các địa điểm liên quan', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xoá tài khoản', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getAllUsers,
  adminUpdateUser,
  adminDeleteUser,
};
