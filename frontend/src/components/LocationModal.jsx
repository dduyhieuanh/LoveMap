import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Image as ImageIcon,
  Star,
  Tag,
  Globe,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { CATEGORIES } from './FilterBar';
import { getGoogleMapsSearchUrl } from '../utils/maps';

const PRESET_IMAGES = [
  {
    label: 'Cafe ấm cúng',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Nhà hàng lãng mạn',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Rooftop Bar',
    url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Trà & Bánh ngọt',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=80',
  },
];

const LocationModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    googleMapsUrl: '',
    imageUrl: PRESET_IMAGES[0].url,
    category: 'Cafe',
    rating: 4.8,
    priceRange: '60.000đ - 150.000đ / người',
    tagsInput: 'Lãng mạn, First Date, Yên tĩnh',
    personalNote: '',
    isPublic: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        googleMapsUrl: initialData.googleMapsUrl || '',
        imageUrl: initialData.images?.[0] || PRESET_IMAGES[0].url,
        category: initialData.category || 'Cafe',
        rating: initialData.rating || 4.8,
        priceRange: initialData.priceRange || '60.000đ - 150.000đ / người',
        tagsInput: (initialData.tags || []).join(', '),
        personalNote: initialData.personalNote || '',
        isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        googleMapsUrl: '',
        imageUrl: PRESET_IMAGES[0].url,
        category: 'Cafe',
        rating: 4.8,
        priceRange: '60.000đ - 150.000đ / người',
        tagsInput: 'Lãng mạn, First Date',
        personalNote: '',
        isPublic: true,
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Vui lòng nhập đầy đủ Tên quán và Địa chỉ.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        name: formData.name.trim(),
        address: formData.address.trim(),
        googleMapsUrl: formData.googleMapsUrl.trim(),
        images: [formData.imageUrl.trim() || PRESET_IMAGES[0].url],
        category: formData.category,
        rating: Number(formData.rating),
        priceRange: formData.priceRange.trim(),
        tags: formData.tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        personalNote: formData.personalNote.trim(),
        isPublic: formData.isPublic,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu địa điểm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestGoogleMaps = () => {
    const previewUrl = getGoogleMapsSearchUrl({
      name: formData.name,
      address: formData.address,
      googleMapsUrl: formData.googleMapsUrl,
    });
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {initialData ? 'Chỉnh sửa địa điểm hẹn hò' : 'Thêm địa điểm ăn uống / hẹn hò mới'}
            </h2>
            <p className="text-xs text-rose-100">
              Lưu vào kho riêng tư của bạn hoặc chia sẻ với cộng đồng DateSpot
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-600">
              {error}
            </div>
          )}

          {/* Tên quán & Thể loại */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên quán / Địa điểm *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: The Hidden Attic Cafe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thể loại *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none bg-white"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Địa chỉ & Nút kiểm tra trên Google Maps */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Địa chỉ cụ thể (Hệ thống sẽ dùng để chỉ đường trên Google Maps) *
              </label>
              {(formData.name || formData.address) && (
                <button
                  type="button"
                  onClick={handleTestGoogleMaps}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Kiểm tra thử trên Google Maps</span>
                </button>
              )}
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="VD: 42 Nguyễn Huệ, Quận 1, TP.HCM"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Điểm đánh giá & Khoảng giá */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Điểm đánh giá (1.0 - 5.0 sao)
              </label>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-current shrink-0" />
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức giá trung bình
              </label>
              <input
                type="text"
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                placeholder="VD: 60.000đ - 150.000đ / người"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Hình ảnh quán */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Hình ảnh quán
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[11px] text-slate-400">Chọn nhanh ảnh mẫu:</span>
              {PRESET_IMAGES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: item.url })}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Thẻ mô tả (Tags - phân cách bằng dấu phẩy)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.tagsInput}
                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                placeholder="Lãng mạn, Yên tĩnh, Rooftop, First Date..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Ghi chú cá nhân */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú cá nhân (Món ngon nên thử, góc ngồi đẹp, chỗ gửi xe...)
            </label>
            <textarea
              rows={3}
              value={formData.personalNote}
              onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
              placeholder="Chia sẻ trải nghiệm thực tế hoặc lưu ý riêng của bạn..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
            />
          </div>

          {/* Chế độ riêng tư (Privacy) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {formData.isPublic ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {formData.isPublic
                    ? 'Chế độ Công khai (Chia sẻ với cộng đồng)'
                    : 'Chế độ Riêng tư (Chỉ mình tôi)'}
                </p>
                <p className="text-xs text-slate-500">
                  {formData.isPublic
                    ? 'Mọi người có thể thấy địa điểm này trên trang Khám phá và lưu về bộ sưu tập.'
                    : 'Địa điểm bí mật, chỉ hiển thị trong Bộ sưu tập cá nhân của riêng bạn.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                formData.isPublic
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-900'
              }`}
            >
              Đổi sang {formData.isPublic ? 'Riêng tư' : 'Công khai'}
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-md shadow-rose-500/20 transition disabled:opacity-50"
            >
              {submitting
                ? 'Đang lưu...'
                : initialData
                ? 'Lưu thay đổi'
                : 'Tạo địa điểm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;

