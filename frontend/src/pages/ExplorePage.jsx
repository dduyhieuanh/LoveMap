import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, PlusCircle, Compass } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';
import LocationCard from '../components/LocationCard';

const ExplorePage = ({
  refreshKey,
  onOpenAddModal,
  onEditLocation,
  onSelectDetail,
  onLocationsLoaded,
}) => {
  const { user, updateSavedLocationsList } = useAuth();
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchPublicLocations = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedTag) params.tag = selectedTag;
      if (sortBy !== 'newest') params.sort = sortBy;

      const { data } = await axiosClient.get('/locations/public', { params });
      setLocations(data);
      if (onLocationsLoaded) onLocationsLoaded(data);
    } catch (error) {
      console.error('Lỗi tải danh sách địa điểm:', error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedTag, sortBy, onLocationsLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPublicLocations();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchPublicLocations, refreshKey]);

  const handleToggleSave = async (locationId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await axiosClient.post(`/locations/${locationId}/save`);
      updateSavedLocationsList(data.savedLocations);
      setLocations((prev) =>
        prev.map((loc) =>
          String(loc._id) === String(locationId)
            ? { ...loc, savesCount: data.savesCount }
            : loc
        )
      );
    } catch (error) {
      console.error('Lỗi lưu địa điểm:', error);
    }
  };

  const handleDelete = async (locationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá địa điểm này không?')) return;
    try {
      await axiosClient.delete(`/locations/${locationId}`);
      setLocations((prev) => prev.filter((l) => String(l._id) !== String(locationId)));
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xoá địa điểm');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Cộng đồng chia sẻ địa điểm ăn uống & hẹn hò</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Tìm góc hẹn hò lý tưởng,{' '}
            <span className="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
              chạm là mở Google Maps đi ngay!
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Khám phá những quán cafe ấm cúng, nhà hàng lãng mạn và rooftop bar được đánh giá thực tế từ cộng đồng. Lưu lại quán yêu thích hoặc tạo bộ sưu tập riêng tư của riêng bạn.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => (user ? onOpenAddModal() : navigate('/login'))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-sm font-bold shadow-lg shadow-rose-500/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đóng góp địa điểm mới</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Nhấn vào bất kỳ địa điểm nào để dẫn đường trực tiếp trên Google Maps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc Tìm kiếm & Tag */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Kết quả */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-96 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="h-48 bg-slate-200 rounded-xl" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-9 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Không tìm thấy địa điểm nào phù hợp
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Hãy thử đổi từ khóa tìm kiếm, chọn thể loại khác hoặc là người đầu tiên chia sẻ quán này lên cộng đồng nhé!
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedTag('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Xoá bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <LocationCard
              key={loc._id}
              location={loc}
              currentUser={user}
              onToggleSave={handleToggleSave}
              onEdit={onEditLocation}
              onDelete={handleDelete}
              onSelectDetail={onSelectDetail}
              onTagClick={(tag) => setSelectedTag(tag === selectedTag ? '' : tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;

