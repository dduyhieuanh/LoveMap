const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'datespot-db.json');

const generateId = () => crypto.randomBytes(12).toString('hex');

const getAdminCredentials = () => ({
  email: (process.env.ADMIN_EMAIL || 'admin@datespot.vn').trim().toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'admin123',
});

const getInitialSeedData = () => {
  const adminCreds = getAdminCredentials();
  const adminPasswordHash = bcrypt.hashSync(adminCreds.password, 10);
  const passwordHash = bcrypt.hashSync('password123', 10);

  const adminId = '6650a1b2c3d4e5f6a7b8c900';
  const user1Id = '6650a1b2c3d4e5f6a7b8c901';
  const user2Id = '6650a1b2c3d4e5f6a7b8c902';

  const now = new Date().toISOString();

  const users = [
    {
      _id: adminId,
      name: 'Quản trị viên (Admin)',
      email: adminCreds.email,
      password: adminPasswordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      bio: 'Tài khoản Quản trị viên hệ thống DateSpot.',
      savedLocations: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: user1Id,
      name: 'Minh Anh',
      email: 'minhanh@example.com',
      password: passwordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Food blogger & người sưu tầm những góc cafe hẹn hò ấm cúng tại Sài Gòn - Hà Nội.',
      savedLocations: ['6650b1b2c3d4e5f6a7b8c912'],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: user2Id,
      name: 'Hoàng Nam',
      email: 'hoangnam@example.com',
      password: passwordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bio: 'Thích rooftop bar, speakeasy pub và những nhà hàng Âu lãng mạn.',
      savedLocations: ['6650b1b2c3d4e5f6a7b8c911'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const locations = [
    {
      _id: '6650b1b2c3d4e5f6a7b8c911',
      name: 'The Apartment Cafe Nguyễn Huệ',
      address: '42 Nguyễn Huệ, Bến Nghé, Quận 1, Hồ Chí Minh',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=42+Nguyen+Hue+Quan+1+Ho+Chi+Minh',
      images: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&auto=format&fit=crop&q=80',
      ],
      category: 'Cafe',
      tags: ['Lãng mạn', 'View ban công', 'First Date', 'Acoustic'],
      rating: 4.8,
      priceRange: '65.000đ - 120.000đ / người',
      personalNote: 'Nên đi tầm 16h30 để ngắm hoàng hôn xuống phố đi bộ từ ban công. Món Cold Brew Cam Sả rất ngon, nhạc nhẹ nhàng dễ trò chuyện.',
      isPublic: true,
      createdBy: user1Id,
      savesCount: 18,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: '6650b1b2c3d4e5f6a7b8c912',
      name: 'Pizza 4P’s Tràng Tiền',
      address: '43 Tràng Tiền, Hoàn Kiếm, Hà Nội',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pizza+4Ps+43+Trang+Tien+Ha+Noi',
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
      ],
      category: 'Nhà hàng',
      tags: ['Kỷ niệm', 'Nến & Rượu vang', 'Ẩm thực Âu', 'Sang trọng'],
      rating: 4.9,
      priceRange: '250.000đ - 500.000đ / người',
      personalNote: 'Nhớ đặt bàn trước ít nhất 2 ngày. Mì Ý cua sốt kem cà chua và Pizza phô mai Burrata là 2 món must-try cho buổi tối hẹn hò.',
      isPublic: true,
      createdBy: user2Id,
      savesCount: 31,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: '6650b1b2c3d4e5f6a7b8c913',
      name: 'Social Club Rooftop Bar',
      address: '76-78 Nguyễn Thị Minh Khai, Quận 3, Hồ Chí Minh',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Social+Club+Rooftop+Bar+76+Nguyen+Thi+Minh+Khai+Ho+Chi+Minh',
      images: [
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&auto=format&fit=crop&q=80',
      ],
      category: 'Pub & Bar',
      tags: ['Rooftop', 'Cocktail', 'Chill đêm', 'Hồ bơi vô cực'],
      rating: 4.7,
      priceRange: '220.000đ - 450.000đ / người',
      personalNote: 'Không gian tầng thượng cực thoáng nhìn toàn cảnh Sài Gòn về đêm. Phù hợp cho kỷ niệm hoặc buổi hẹn hò thứ 2 trở đi.',
      isPublic: true,
      createdBy: user2Id,
      savesCount: 24,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: '6650b1b2c3d4e5f6a7b8c914',
      name: 'Tiệm Cà Phê Túi Mơ To',
      address: 'Hẻm 31 Sào Nam, Phường 11, Đà Lạt, Lâm Đồng',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tiem+Ca+Phe+Tui+Mo+To+Da+Lat',
      images: [
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=80',
      ],
      category: 'Bánh ngọt & Trà',
      tags: ['Đà Lạt', 'Vườn cúc họa mi', 'Săn mây', 'Hoàng hôn'],
      rating: 4.9,
      priceRange: '55.000đ - 95.000đ / người',
      personalNote: 'Quán trà bánh lồng kính nhìn ra thung lũng thông và đỉnh Langbiang, buổi chiều lên đèn vàng siêu thơ mộng.',
      isPublic: true,
      createdBy: user1Id,
      savesCount: 42,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: '6650b1b2c3d4e5f6a7b8c915',
      name: 'Quán Ốc Đào Nguyễn Trãi',
      address: '212B/D79 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Hồ Chí Minh',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Oc+Dao+212B+Nguyen+Trai+Quan+1+Ho+Chi+Minh',
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80',
      ],
      category: 'Ăn vặt / Vỉa hè',
      tags: ['Hải sản', 'Vui vẻ', 'Bình dân', 'Đi cùng hội bạn'],
      rating: 4.6,
      priceRange: '120.000đ - 250.000đ / người',
      personalNote: 'Ốc hương xào bơ tỏi chấm bánh mì và răng mực nướng muối ớt siêu đỉnh. Đi buổi tối hơi đông nên gửi xe đầu hẻm.',
      isPublic: true,
      createdBy: user1Id,
      savesCount: 15,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: '6650b1b2c3d4e5f6a7b8c916',
      name: 'Góc Bí Mật Của Hai Đứa (Ghi chú riêng)',
      address: '14 Tôn Thất Đạm, Quận 1, Hồ Chí Minh',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=14+Ton+That+Dam+Quan+1+Ho+Chi+Minh',
      images: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop&q=80',
      ],
      category: 'Cafe',
      tags: ['Riêng tư', 'Yên tĩnh', 'Vintage'],
      rating: 5.0,
      priceRange: '60.000đ - 100.000đ / người',
      personalNote: 'Quán nhỏ trong chung cư cũ, chỉ lưu riêng tư cho hai đứa cuối tuần ghé đọc sách.',
      isPublic: false,
      createdBy: user1Id,
      savesCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return { users, locations };
};

const ensureAdminInData = (data) => {
  let modified = false;
  const adminCreds = getAdminCredentials();

  data.users = (data.users || []).map((u) => {
    if (!u.role) {
      modified = true;
      return { ...u, role: u.email === adminCreds.email ? 'admin' : 'user' };
    }
    return u;
  });

  const hasAdmin = data.users.some((u) => u.email === adminCreds.email || u.role === 'admin');
  if (!hasAdmin) {
    const now = new Date().toISOString();
    data.users.unshift({
      _id: '6650a1b2c3d4e5f6a7b8c900',
      name: 'Quản trị viên (Admin)',
      email: adminCreds.email,
      password: bcrypt.hashSync(adminCreds.password, 10),
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      bio: 'Tài khoản Quản trị viên hệ thống DateSpot.',
      savedLocations: [],
      createdAt: now,
      updatedAt: now,
    });
    modified = true;
  }

  return { data, modified };
};

const readDB = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    const { data, modified } = ensureAdminInData(parsed);
    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
    return data;
  } catch (err) {
    const initial = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
};

const writeDB = (data) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = {
  readDB,
  writeDB,
  generateId,
};
