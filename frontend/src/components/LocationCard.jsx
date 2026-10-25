import React from 'react';
import {
  MapPin,
  Star,
  Bookmark,
  Lock,
  Globe,
  Edit3,
  Trash2,
  Navigation,
  ExternalLink,
  Wallet,
} from 'lucide-react';
import { openLocationInGoogleMaps } from '../utils/maps';

const LocationCard = ({
  location,
  currentUser,
  onToggleSave,
  onEdit,
  onDelete,
  onSelectDetail,
  onTagClick,
}) => {
  const isOwner =
    currentUser &&
    String(location.createdBy?._id || location.createdBy) === String(currentUser._id);

  const isAdmin = currentUser?.role === 'admin';
  const canManage = isOwner || isAdmin;

  const isSaved =
    currentUser &&
    (currentUser.savedLocations || []).some(
      (id) => String(id?._id || id) === String(location._id)
    );

  const coverImage =
    location.images?.[0] ||
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80';

  const handleGoToMaps = (e) => {
    e.stopPropagation();
    openLocationInGoogleMaps(location, 'directions');
  };

  return (
    <div
      onClick={() => onSelectDetail && onSelectDetail(location)}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Ảnh bìa + Badges */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={location.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />

        {/* Góc trái trên: Thể loại + Quyền riêng tư */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            {location.category}
          </span>
          {location.isPublic ? (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/90 text-white backdrop-blur-sm"
              title="Công khai với cộng đồng"
            >
              <Globe className="w-3 h-3" />
              Công khai
            </span>
          ) : (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-900/90 text-amber-300 backdrop-blur-sm"
              title="Chỉ mình tôi xem được"
            >
              <Lock className="w-3 h-3" />
              Riêng tư
            </span>
          )}
        </div>

        {/* Góc phải trên: Nút Lưu (Bookmark) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave && onToggleSave(location._id);
          }}
          className={`absolute top-3 right-3 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-semibold shadow-md transition ${
            isSaved
              ? 'bg-rose-600 text-white'
              : 'bg-white/95 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
          }`}
          title={isSaved ? 'Bỏ lưu khỏi bộ sưu tập' : 'Lưu vào bộ sưu tập của tôi'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          <span>{location.savesCount || 0}</span>
        </button>

        {/* Góc dưới trên ảnh: Tên quán + Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
          <h3 className="text-lg font-bold leading-snug line-clamp-1 drop-shadow-sm">
            {location.name}
          </h3>
          <div className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{Number(location.rating).toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Nội dung thẻ */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          {/* Địa chỉ (Click để mở Google Maps ngay) */}
          <button
            type="button"
            onClick={handleGoToMaps}
            className="w-full text-left flex items-start gap-1.5 text-xs text-slate-600 hover:text-rose-600 group/addr transition"
            title="Nhấn để mở chỉ đường đến địa chỉ này trên Google Maps"
          >
            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1 font-medium underline decoration-dotted underline-offset-2">
              {location.address}
            </span>
            <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-0 group-hover/addr:opacity-100 transition" />
          </button>

          {/* Khoảng giá */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50/80 px-2.5 py-1 rounded-lg w-fit">
            <Wallet className="w-3.5 h-3.5" />
            <span>{location.priceRange || 'Đang cập nhật'}</span>
          </div>

          {/* Ghi chú cá nhân */}
          {location.personalNote && (
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 italic">
              “{location.personalNote}”
            </p>
          )}

          {/* Danh sách Tags */}
          {location.tags && location.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {location.tags.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick && onTagClick(tag);
                  }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Nút chuyển hướng sang Google Maps + Người tạo / Sửa Xoá */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          {/* Nút Chọn đi đến địa điểm (Google Maps) */}
          <button
            type="button"
            onClick={handleGoToMaps}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-semibold border border-rose-200/80 hover:border-rose-600 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Đi đến địa điểm này (Google Maps)</span>
          </button>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <img
                src={
                  location.createdBy?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={location.createdBy?.name || 'User'}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="truncate font-medium text-slate-700">
                {location.createdBy?.name || 'Thành viên'}
              </span>
            </div>

            {canManage && (
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(location)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                  title={isAdmin && !isOwner ? 'Chỉnh sửa (Quyền Admin)' : 'Chỉnh sửa địa điểm'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete && onDelete(location._id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title={isAdmin && !isOwner ? 'Xoá địa điểm (Quyền Admin)' : 'Xoá địa điểm'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
