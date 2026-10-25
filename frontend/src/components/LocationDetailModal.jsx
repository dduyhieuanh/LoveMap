import React from 'react';
import {
  X,
  MapPin,
  Star,
  Navigation,
  Map,
  Wallet,
  Bookmark,
  Globe,
  Lock,
  Quote,
  Copy,
  Check,
} from 'lucide-react';
import { openLocationInGoogleMaps } from '../utils/maps';

const LocationDetailModal = ({
  location,
  onClose,
  currentUser,
  onToggleSave,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!location) return null;

  const isSaved =
    currentUser &&
    (currentUser.savedLocations || []).some(
      (id) => String(id?._id || id) === String(location._id)
    );

  const coverImage =
    location.images?.[0] ||
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&auto=format&fit=crop&q=80';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${location.name} - ${location.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 sm:h-72 bg-slate-100">
          <img
            src={coverImage}
            alt={location.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/95 text-slate-900 shadow">
              {location.category}
            </span>
            {location.isPublic ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500 text-white">
                <Globe className="w-3.5 h-3.5" />
                Công khai
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-900 text-amber-300">
                <Lock className="w-3.5 h-3.5" />
                Chỉ mình tôi
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-6 right-6 text-white flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold leading-tight">
                {location.name}
              </h2>
              <p className="text-xs text-slate-200 mt-1 flex items-center gap-1.5">
                <span>Chia sẻ bởi</span>
                <strong className="text-white">
                  {location.createdBy?.name || 'Thành viên'}
                </strong>
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl text-sm font-extrabold shrink-0 shadow">
              <Star className="w-4 h-4 fill-current" />
              <span>{Number(location.rating).toFixed(1)} / 5.0</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Địa chỉ + Sao chép */}
          <div className="flex items-start justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Địa chỉ quán
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {location.address}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shrink-0 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Chép địa chỉ</span>
                </>
              )}
            </button>
          </div>

          {/* Khoảng giá & Lượt lưu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Mức giá tham khảo
                </p>
                <p className="text-sm font-bold text-emerald-950">
                  {location.priceRange || '50.000đ - 150.000đ / người'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
              <div>
                <p className="text-[11px] text-rose-700 font-medium">
                  Độ yêu thích cộng đồng
                </p>
                <p className="text-sm font-bold text-rose-950">
                  {location.savesCount || 0} người đã lưu quán này
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSave && onToggleSave(location._id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSaved
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Đã lưu' : 'Lưu lại'}</span>
              </button>
            </div>
          </div>

          {/* Ghi chú trải nghiệm cá nhân */}
          {location.personalNote && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <Quote className="w-4 h-4 text-amber-600" />
                <span>Kinh nghiệm & Ghi chú đi quán</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {location.personalNote}
              </p>
            </div>
          )}

          {/* Tags */}
          {location.tags && location.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {location.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Cụm nút hành động chính: CHUYỂN HƯỚNG GOOGLE MAPS */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => openLocationInGoogleMaps(location, 'directions')}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Chọn đi đến đây (Chỉ đường Google Maps)</span>
            </button>

            <button
              type="button"
              onClick={() => openLocationInGoogleMaps(location, 'search')}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition"
            >
              <Map className="w-4 h-4" />
              <span>Xem trên Bản đồ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModal;

