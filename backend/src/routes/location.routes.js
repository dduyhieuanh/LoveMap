const express = require('express');
const router = express.Router();
const {
  getPublicLocations,
  getAllLocationsAdmin,
  getMyCollection,
  createLocation,
  updateLocation,
  deleteLocation,
  toggleSaveLocation,
} = require('../controllers/location.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Feed công khai (ai cũng xem và lọc được)
router.get('/public', getPublicLocations);

// [Admin] Lấy toàn bộ địa điểm của mọi người dùng
router.get('/admin-all', protect, adminOnly, getAllLocationsAdmin);

// Bộ sưu tập cá nhân (đã tạo + đã lưu)
router.get('/my-collection', protect, getMyCollection);

// Tạo mới địa điểm
router.post('/', protect, createLocation);

// Cập nhật & Xoá địa điểm (Chính chủ hoặc Admin)
router.put('/:id', protect, updateLocation);
router.delete('/:id', protect, deleteLocation);

// Lưu / Bỏ lưu địa điểm của người khác
router.post('/:id/save', protect, toggleSaveLocation);

module.exports = router;
