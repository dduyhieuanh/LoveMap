const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên địa điểm'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ'],
      trim: true,
    },
    googleMapsUrl: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      ],
    },
    category: {
      type: String,
      required: [true, 'Vui lòng chọn thể loại quán'],
      enum: ['Cafe', 'Nhà hàng', 'Pub & Bar', 'Ăn vặt / Vỉa hè', 'Bánh ngọt & Trà', 'Khác'],
      default: 'Cafe',
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 4.5,
    },
    priceRange: {
      type: String,
      default: '50.000đ - 150.000đ / người',
    },
    personalNote: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    savesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Tạo index hỗ trợ tìm kiếm nhanh theo tên, địa chỉ và tags
locationSchema.index({ name: 'text', address: 'text', tags: 'text' });

module.exports = mongoose.model('Location', locationSchema);

