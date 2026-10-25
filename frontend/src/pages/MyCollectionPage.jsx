import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Bookmark,
  Lock,
  Globe,
  PlusCircle,
  FolderHeart,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import LocationCard from '../components/LocationCard';
import { openLocationInGoogleMaps } from '../utils/maps';

const MyCollectionPage = ({
  refreshKey,
  onOpenAddModal,
  onEditLocation,
  onSelectDetail,
}) => {
  const { user, loading: authLoading, updateSavedLocationsList } = useAuth();
  const [myCreated, setMyCreated] = useState([]);
  const [savedLocations, setSavedLocations] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'created' | 'private' | 'saved'
  const [loading, setLoading] = useState(true);

  const fetchCollection = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/locations/my-collection');
      setMyCreated(data.myCreated || []);
      setSavedLocations(data.savedLocations || []);
    } catch (error) {
      console.error('Lỗi tải bộ sưu tập cá nhân:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection, refreshKey]);

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const handleToggleSave = async (locationId) => {
    try {
      const { data } = await axiosClient.post(`/locations/${locationId}/save`);
      updateSavedLocationsList(data.savedLocations);
      fetchCollection();
    } catch (error) {
      console.error('Lỗi cập nhật lưu trữ:', error);
    }
  };

  const handleDelete = async (locationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá địa điểm này khỏi bộ sưu tập?')) return;
    try {
      await axiosClient.delete(`/locations/${locationId}`);
      fetchCollection();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xoá địa điểm');
    }
  };

  const privateSpots = myCreated.filter((loc) => !loc.isPublic);

  // Gộp danh sách không trùng lặp cho tab 'all'
  const allMySpots = [
    ...myCreated,
    ...savedLocations.filter(
      (s) => !myCreated.some((m) => String(m._id) === String(s._id))
    ),
  ];

  const displayedLocations =
    activeTab === 'created'
      ? myCreated
      : activeTab === 'private'
      ? privateSpots
      : activeTab === 'saved'
      ? savedLocations
      : allMySpots;

  const handlePickRandomFromMyList = () => {
    if (allMySpots.length === 0) return;
    const randomSpot = allMySpots[Math.floor(Math.random() * allMySpots.length)];
    if (
      window.confirm(
        `🎉 Gợi ý hôm nay cho bạn: "${randomSpot.name}" (${randomSpot.address}).\n\nNhấn OK để mở chỉ đường trên Google Maps ngay!`
      )
    ) {
      openLocationInGoogleMaps(randomSpot, 'directions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bộ sưu tập */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            }
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Bộ sưu tập của {user?.name}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {user?.bio || 'Nơi lưu giữ các quán quen riêng tư và những địa điểm hẹn hò yêu thích.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Đã tạo: {myCreated.length} quán
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Chỉ mình tôi: {privateSpots.length} quán
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-rose-600" />
                Đã lưu từ cộng đồng: {savedLocations.length} quán
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {allMySpots.length > 0 && (
            <button
              type="button"
              onClick={handlePickRandomFromMyList}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Bốc thăm 1 quán & Đi ngay</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm địa điểm mới</span>
          </button>
        </div>
      </div>

      {/* Tabs chuyển đổi */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `Tất cả (${allMySpots.length})` },
          { id: 'created', label: `Do tôi tạo (${myCreated.length})` },
          { id: 'private', label: `Riêng tư - Chỉ mình tôi (${privateSpots.length})` },
          { id: 'saved', label: `Đã lưu từ cộng đồng (${savedLocations.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách địa điểm */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse"
            />
          ))}
        </div>
      ) : displayedLocations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <FolderHeart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Chưa có địa điểm nào trong mục này
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Bạn có thể thêm địa điểm mới ở chế độ Riêng tư hoặc Công khai, hoặc dạo trang Khám phá để lưu những quán hay ho từ mọi người.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo địa điểm đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedLocations.map((loc) => (
            <LocationCard
              key={loc._id}
              location={loc}
              currentUser={user}
              onToggleSave={handleToggleSave}
              onEdit={onEditLocation}
              onDelete={handleDelete}
              onSelectDetail={onSelectDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCollectionPage;

