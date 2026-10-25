const Location = require('../models/Location');
const User = require('../models/User');
const { isMongoConnected } = require('../config/db');
const { readDB, writeDB, generateId } = require('../config/localStore');

// Tạo URL Google Maps tự động từ tên địa điểm + địa chỉ nếu người dùng không nhập link riêng
const buildGoogleMapsUrl = (name, address, customUrl) => {
  if (customUrl && customUrl.trim() !== '') {
    return customUrl.trim();
  }
  const query = encodeURIComponent(`${name || ''} ${address || ''}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

// Helper gắn thông tin người tạo cho Local JSON DB
const populateCreator = (loc, users) => {
  const creator = users.find((u) => String(u._id) === String(loc.createdBy));
  return {
    ...loc,
    googleMapsUrl: buildGoogleMapsUrl(loc.name, loc.address, loc.googleMapsUrl),
    createdBy: creator
      ? { _id: creator._id, name: creator.name, email: creator.email, avatar: creator.avatar }
      : { _id: loc.createdBy, name: 'Thành viên DateSpot', avatar: '' },
  };
};

// @desc    Lấy danh sách các địa điểm Công khai (Feed khám phá cho cộng đồng & khách)
// @route   GET /api/locations/public
// @access  Public
const getPublicLocations = async (req, res) => {
  try {
    const { search, category, tag, sort } = req.query;

    if (isMongoConnected()) {
      const query = { isPublic: true };

      if (category && category !== 'All') {
        query.category = category;
      }

      if (tag) {
        query.tags = { $in: [new RegExp(`^${tag}$`, 'i')] };
      }

      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: regex },
          { address: regex },
          { personalNote: regex },
          { tags: regex },
        ];
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'popular') sortOption = { savesCount: -1, rating: -1 };
      if (sort === 'rating') sortOption = { rating: -1, createdAt: -1 };

      const locations = await Location.find(query)
        .populate('createdBy', 'name email avatar')
        .sort(sortOption);

      return res.json(locations);
    }

    // Fallback Local JSON Database
    const db = readDB();
    let results = db.locations.filter((loc) => loc.isPublic);

    if (category && category !== 'All') {
      results = results.filter((loc) => loc.category === category);
    }

    if (tag) {
      const lowerTag = tag.toLowerCase();
      results = results.filter((loc) =>
        (loc.tags || []).some((t) => t.toLowerCase() === lowerTag)
      );
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q) ||
          (loc.personalNote || '').toLowerCase().includes(q) ||
          (loc.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'popular') {
      results.sort((a, b) => (b.savesCount || 0) - (a.savesCount || 0) || b.rating - a.rating);
    } else if (sort === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json(results.map((loc) => populateCreator(loc, db.users)));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách địa điểm công khai', error: error.message });
  }
};

// @desc    [Admin] Lấy toàn bộ địa điểm trên hệ thống (Cả công khai & riêng tư của mọi người dùng)
// @route   GET /api/locations/admin-all
// @access  Private / Admin
const getAllLocationsAdmin = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const locations = await Location.find()
        .populate('createdBy', 'name email avatar')
        .sort({ createdAt: -1 });
      return res.json(locations);
    }

    const db = readDB();
    const sorted = [...db.locations].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return res.json(sorted.map((loc) => populateCreator(loc, db.users)));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải toàn bộ địa điểm', error: error.message });
  }
};

// @desc    Lấy bộ sưu tập cá nhân (Bao gồm địa điểm tự tạo & địa điểm đã lưu từ người khác)
// @route   GET /api/locations/my-collection
// @access  Private
const getMyCollection = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const myCreated = await Location.find({ createdBy: req.user._id })
        .populate('createdBy', 'name email avatar')
        .sort({ createdAt: -1 });

      const userWithSaved = await User.findById(req.user._id).populate({
        path: 'savedLocations',
        populate: { path: 'createdBy', select: 'name email avatar' },
      });

      const savedLocations = (userWithSaved.savedLocations || []).filter(
        (loc) => loc && (loc.isPublic || String(loc.createdBy?._id) === String(req.user._id))
      );

      return res.json({
        myCreated,
        savedLocations,
      });
    }

    // Fallback Local JSON Database
    const db = readDB();
    const myCreated = db.locations
      .filter((loc) => String(loc.createdBy) === String(req.user._id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((loc) => populateCreator(loc, db.users));

    const currentUser = db.users.find((u) => String(u._id) === String(req.user._id));
    const savedIds = currentUser?.savedLocations || [];

    const savedLocations = db.locations
      .filter(
        (loc) =>
          savedIds.some((id) => String(id) === String(loc._id)) &&
          (loc.isPublic || String(loc.createdBy) === String(req.user._id))
      )
      .map((loc) => populateCreator(loc, db.users));

    return res.json({
      myCreated,
      savedLocations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải bộ sưu tập cá nhân', error: error.message });
  }
};

// @desc    Tạo mới một địa điểm ăn uống / hẹn hò
// @route   POST /api/locations
// @access  Private
const createLocation = async (req, res) => {
  try {
    const {
      name,
      address,
      googleMapsUrl,
      images,
      category,
      tags,
      rating,
      priceRange,
      personalNote,
      isPublic,
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'Tên quán và địa chỉ là bắt buộc' });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string' && tags.trim() !== ''
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const defaultImg =
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&auto=format&fit=crop&q=80';
    const parsedImages =
      Array.isArray(images) && images.filter(Boolean).length > 0
        ? images.filter(Boolean)
        : typeof images === 'string' && images.trim() !== ''
        ? [images.trim()]
        : [defaultImg];

    const finalMapsUrl = buildGoogleMapsUrl(name, address, googleMapsUrl);

    if (isMongoConnected()) {
      const location = await Location.create({
        name: name.trim(),
        address: address.trim(),
        googleMapsUrl: finalMapsUrl,
        images: parsedImages,
        category: category || 'Cafe',
        tags: parsedTags,
        rating: Number(rating) || 4.5,
        priceRange: priceRange || '50.000đ - 150.000đ / người',
        personalNote: personalNote || '',
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
        createdBy: req.user._id,
      });

      const populated = await location.populate('createdBy', 'name email avatar');
      return res.status(201).json(populated);
    }

    // Fallback Local JSON Database
    const db = readDB();
    const now = new Date().toISOString();
    const newLocation = {
      _id: generateId(),
      name: name.trim(),
      address: address.trim(),
      googleMapsUrl: finalMapsUrl,
      images: parsedImages,
      category: category || 'Cafe',
      tags: parsedTags,
      rating: Number(rating) || 4.5,
      priceRange: priceRange || '50.000đ - 150.000đ / người',
      personalNote: personalNote || '',
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      createdBy: req.user._id,
      savesCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    db.locations.unshift(newLocation);
    writeDB(db);

    return res.status(201).json(populateCreator(newLocation, db.users));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo địa điểm mới', error: error.message });
  }
};

// @desc    Cập nhật thông tin địa điểm (Người tạo HOẶC Admin có quyền sửa)
// @route   PUT /api/locations/:id
// @access  Private
const updateLocation = async (req, res) => {
  try {
    const {
      name,
      address,
      googleMapsUrl,
      images,
      category,
      tags,
      rating,
      priceRange,
      personalNote,
      isPublic,
    } = req.body;

    const isAdmin = req.user && req.user.role === 'admin';

    if (isMongoConnected()) {
      const location = await Location.findById(req.params.id);

      if (!location) {
        return res.status(404).json({ message: 'Không tìm thấy địa điểm này' });
      }

      if (!isAdmin && String(location.createdBy) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa địa điểm của người khác' });
      }

      if (name !== undefined) location.name = name;
      if (address !== undefined) location.address = address;
      if (googleMapsUrl !== undefined) {
        location.googleMapsUrl = buildGoogleMapsUrl(
          name || location.name,
          address || location.address,
          googleMapsUrl
        );
      }
      if (category !== undefined) location.category = category;
      if (rating !== undefined) location.rating = Number(rating);
      if (priceRange !== undefined) location.priceRange = priceRange;
      if (personalNote !== undefined) location.personalNote = personalNote;
      if (isPublic !== undefined) location.isPublic = Boolean(isPublic);

      if (tags !== undefined) {
        location.tags = Array.isArray(tags)
          ? tags
          : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
      }

      if (images !== undefined) {
        const validImages = Array.isArray(images)
          ? images.filter(Boolean)
          : String(images).trim() !== ''
          ? [String(images).trim()]
          : [];
        if (validImages.length > 0) {
          location.images = validImages;
        }
      }

      const updated = await location.save();
      const populated = await updated.populate('createdBy', 'name email avatar');

      return res.json(populated);
    }

    // Fallback Local JSON Database
    const db = readDB();
    const idx = db.locations.findIndex((l) => String(l._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ message: 'Không tìm thấy địa điểm này' });
    }

    const location = db.locations[idx];
    if (!isAdmin && String(location.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa địa điểm của người khác' });
    }

    if (name !== undefined) location.name = name;
    if (address !== undefined) location.address = address;
    location.googleMapsUrl = buildGoogleMapsUrl(
      location.name,
      location.address,
      googleMapsUrl !== undefined ? googleMapsUrl : location.googleMapsUrl
    );
    if (category !== undefined) location.category = category;
    if (rating !== undefined) location.rating = Number(rating);
    if (priceRange !== undefined) location.priceRange = priceRange;
    if (personalNote !== undefined) location.personalNote = personalNote;
    if (isPublic !== undefined) location.isPublic = Boolean(isPublic);

    if (tags !== undefined) {
      location.tags = Array.isArray(tags)
        ? tags
        : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
    }

    if (images !== undefined) {
      const validImages = Array.isArray(images)
        ? images.filter(Boolean)
        : String(images).trim() !== ''
        ? [String(images).trim()]
        : [];
      if (validImages.length > 0) {
        location.images = validImages;
      }
    }

    location.updatedAt = new Date().toISOString();
    db.locations[idx] = location;
    writeDB(db);

    return res.json(populateCreator(location, db.users));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật địa điểm', error: error.message });
  }
};

// @desc    Xoá địa điểm (Người tạo HOẶC Admin có quyền xoá)
// @route   DELETE /api/locations/:id
// @access  Private
const deleteLocation = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';

    if (isMongoConnected()) {
      const location = await Location.findById(req.params.id);

      if (!location) {
        return res.status(404).json({ message: 'Không tìm thấy địa điểm này' });
      }

      if (!isAdmin && String(location.createdBy) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Bạn không có quyền xoá địa điểm này' });
      }

      await location.deleteOne();
      await User.updateMany(
        { savedLocations: location._id },
        { $pull: { savedLocations: location._id } }
      );

      return res.json({ message: 'Đã xoá địa điểm thành công', id: req.params.id });
    }

    // Fallback Local JSON Database
    const db = readDB();
    const idx = db.locations.findIndex((l) => String(l._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ message: 'Không tìm thấy địa điểm này' });
    }

    if (!isAdmin && String(db.locations[idx].createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Bạn không có quyền xoá địa điểm này' });
    }

    const removedId = db.locations[idx]._id;
    db.locations.splice(idx, 1);
    db.users.forEach((u) => {
      u.savedLocations = (u.savedLocations || []).filter(
        (id) => String(id) !== String(removedId)
      );
    });
    writeDB(db);

    return res.json({ message: 'Đã xoá địa điểm thành công', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xoá địa điểm', error: error.message });
  }
};

// @desc    Lưu hoặc Bỏ lưu địa điểm của người khác vào bộ sưu tập cá nhân
// @route   POST /api/locations/:id/save
// @access  Private
const toggleSaveLocation = async (req, res) => {
  try {
    const locationId = req.params.id;

    if (isMongoConnected()) {
      const location = await Location.findById(locationId);

      if (!location || (!location.isPublic && String(location.createdBy) !== String(req.user._id))) {
        return res.status(404).json({ message: 'Không tìm thấy địa điểm hoặc địa điểm này ở chế độ riêng tư' });
      }

      const user = await User.findById(req.user._id);
      const isAlreadySaved = user.savedLocations.some(
        (id) => String(id) === String(locationId)
      );

      if (isAlreadySaved) {
        user.savedLocations = user.savedLocations.filter(
          (id) => String(id) !== String(locationId)
        );
        location.savesCount = Math.max(0, (location.savesCount || 0) - 1);
      } else {
        user.savedLocations.push(location._id);
        location.savesCount = (location.savesCount || 0) + 1;
      }

      await user.save();
      await location.save();

      return res.json({
        saved: !isAlreadySaved,
        savesCount: location.savesCount,
        savedLocations: user.savedLocations,
      });
    }

    // Fallback Local JSON Database
    const db = readDB();
    const locIdx = db.locations.findIndex((l) => String(l._id) === String(locationId));
    const userIdx = db.users.findIndex((u) => String(u._id) === String(req.user._id));

    if (locIdx === -1 || userIdx === -1) {
      return res.status(404).json({ message: 'Không tìm thấy địa điểm hoặc người dùng' });
    }

    const location = db.locations[locIdx];
    const user = db.users[userIdx];

    if (!location.isPublic && String(location.createdBy) !== String(user._id)) {
      return res.status(403).json({ message: 'Địa điểm này đang ở chế độ riêng tư' });
    }

    user.savedLocations = user.savedLocations || [];
    const isAlreadySaved = user.savedLocations.some(
      (id) => String(id) === String(locationId)
    );

    if (isAlreadySaved) {
      user.savedLocations = user.savedLocations.filter(
        (id) => String(id) !== String(locationId)
      );
      location.savesCount = Math.max(0, (location.savesCount || 0) - 1);
    } else {
      user.savedLocations.push(location._id);
      location.savesCount = (location.savesCount || 0) + 1;
    }

    db.locations[locIdx] = location;
    db.users[userIdx] = user;
    writeDB(db);

    return res.json({
      saved: !isAlreadySaved,
      savesCount: location.savesCount,
      savedLocations: user.savedLocations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lưu địa điểm', error: error.message });
  }
};

module.exports = {
  getPublicLocations,
  getAllLocationsAdmin,
  getMyCollection,
  createLocation,
  updateLocation,
  deleteLocation,
  toggleSaveLocation,
};
