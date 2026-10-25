require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Location = require('./models/Location');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    await Location.deleteMany();
    await User.deleteMany();

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@datespot.vn').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    await User.create({
      name: 'Quản trị viên (Admin)',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      bio: 'Tài khoản Quản trị viên hệ thống DateSpot.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    });

    const user1 = await User.create({
      name: 'Minh Anh',
      email: 'minhanh@example.com',
      password: 'password123',
      role: 'user',
      bio: 'Food blogger & người sưu tầm những góc cafe hẹn hò ấm cúng tại Sài Gòn - Hà Nội.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });

    const user2 = await User.create({
      name: 'Hoàng Nam',
      email: 'hoangnam@example.com',
      password: 'password123',
      role: 'user',
      bio: 'Thích rooftop bar, speakeasy pub và những nhà hàng Âu lãng mạn.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    });

    const sampleLocations = [
      {
        name: 'The Hidden Attic Cafe',
        address: '42 Nguyễn Huệ, Quận 1, TP.HCM',
        images: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
        ],
        category: 'Cafe',
        tags: ['Lãng mạn', 'Yên tĩnh', 'View ban công', 'First Date'],
        rating: 4.8,
        priceRange: '65.000đ - 120.000đ / người',
        personalNote: 'Nên đi tầm 16h30 để ngắm hoàng hôn ở ban công. Món Cold Brew Cam Sả rất ngon, nhạc jazz nhẹ nhàng dễ trò chuyện.',
        isPublic: true,
        createdBy: user1._id,
        savesCount: 14,
      },
      {
        name: 'Sol Kitchen & Bistro',
        address: '18 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
        images: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        ],
        category: 'Nhà hàng',
        tags: ['Kỷ niệm', 'Nến & Rượu vang', 'Ẩm thực Âu', 'Sang trọng'],
        rating: 4.9,
        priceRange: '350.000đ - 700.000đ / người',
        personalNote: 'Nhớ đặt bàn trước ở khu vực sân vườn. Mì Ý nấm Truffle và Beefsteak sốt tiêu đen là 2 món must-try cho buổi tối kỷ niệm.',
        isPublic: true,
        createdBy: user2._id,
        savesCount: 23,
      },
      {
        name: 'Nocturne Speakeasy Bar',
        address: 'Tầng thượng 88 Pasteur, Quận 1, TP.HCM',
        images: [
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
        ],
        category: 'Pub & Bar',
        tags: ['Rooftop', 'Acoustic', 'Cocktail', 'Chill đêm'],
        rating: 4.7,
        priceRange: '180.000đ - 350.000đ / người',
        personalNote: 'Quán ẩn sau cánh cửa tủ sách gỗ. Bartender pha cocktail theo tâm trạng khách hàng cực kỳ tinh tế.',
        isPublic: true,
        createdBy: user2._id,
        savesCount: 19,
      },
      {
        name: 'Góc Nhỏ Của Hai Đứa (Bí mật)',
        address: 'Hẻm 112 Trần Phú, Đà Lạt',
        images: [
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
        ],
        category: 'Bánh ngọt & Trà',
        tags: ['Riêng tư', 'Đà Lạt', 'Săn mây'],
        rating: 5.0,
        priceRange: '50.000đ - 90.000đ / người',
        personalNote: 'Quán trà bánh nhỏ xíu nhìn ra thung lũng thông, lưu riêng cho chuyến đi Đà Lạt sắp tới.',
        isPublic: false,
        createdBy: user1._id,
        savesCount: 0,
      },
    ];

    await Location.insertMany(sampleLocations);
    console.log('🌱 Đã tạo dữ liệu mẫu & tài khoản Admin thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error.message);
    process.exit(1);
  }
};

seedData();
