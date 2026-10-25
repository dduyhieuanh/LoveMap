import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axiosClient from './api/axiosClient';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LocationModal from './components/LocationModal';
import LocationDetailModal from './components/LocationDetailModal';
import ProfileModal from './components/ProfileModal';
import ExplorePage from './pages/ExplorePage';
import MyCollectionPage from './pages/MyCollectionPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App = () => {
  const { user, updateSavedLocationsList } = useAuth();
  const navigate = useNavigate();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedDetailLocation, setSelectedDetailLocation] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadedLocations, setLoadedLocations] = useState([]);

  const handleOpenAddModal = () => {
    setEditingLocation(null);
    setIsLocationModalOpen(true);
  };

  const handleOpenEditModal = (location) => {
    setEditingLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocationForm = async (payload) => {
    if (editingLocation) {
      await axiosClient.put(`/locations/${editingLocation._id}`, payload);
    } else {
      await axiosClient.post('/locations', payload);
    }
    setRefreshKey((k) => k + 1);
  };

  const handleToggleSaveFromModal = async (locationId) => {
    if (!user) {
      setSelectedDetailLocation(null);
      navigate('/login');
      return;
    }
    const { data } = await axiosClient.post(`/locations/${locationId}/save`);
    updateSavedLocationsList(data.savedLocations);
    setSelectedDetailLocation((prev) =>
      prev && String(prev._id) === String(locationId)
        ? { ...prev, savesCount: data.savesCount }
        : prev
    );
    setRefreshKey((k) => k + 1);
  };

  // Tính năng "Hôm nay đi đâu?" chọn ngẫu nhiên 1 quán và mở modal chi tiết để nhấn Đi ngay trên Google Maps
  const handleRandomPick = () => {
    if (!loadedLocations || loadedLocations.length === 0) return;
    const randomIndex = Math.floor(Math.random() * loadedLocations.length);
    setSelectedDetailLocation(loadedLocations[randomIndex]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onRandomPick={loadedLocations.length > 0 ? handleRandomPick : null}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          <Route
            path="/"
            element={
              <ExplorePage
                refreshKey={refreshKey}
                onOpenAddModal={handleOpenAddModal}
                onEditLocation={handleOpenEditModal}
                onSelectDetail={setSelectedDetailLocation}
                onLocationsLoaded={setLoadedLocations}
              />
            }
          />
          <Route
            path="/my-collection"
            element={
              <MyCollectionPage
                refreshKey={refreshKey}
                onOpenAddModal={handleOpenAddModal}
                onEditLocation={handleOpenEditModal}
                onSelectDetail={setSelectedDetailLocation}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminPage
                refreshKey={refreshKey}
                onEditLocation={handleOpenEditModal}
                onSelectDetail={setSelectedDetailLocation}
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© 2026 DateSpot — Nền tảng lưu trữ & chia sẻ địa điểm ăn uống, hẹn hò.</p>
          <p>Tích hợp dẫn đường trực tiếp qua Google Maps.</p>
        </div>
      </footer>

      {/* Modal Thêm / Chỉnh sửa Địa điểm */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSubmit={handleSaveLocationForm}
        initialData={editingLocation}
      />

      {/* Modal Xem chi tiết & Chỉ đường Google Maps */}
      <LocationDetailModal
        location={selectedDetailLocation}
        onClose={() => setSelectedDetailLocation(null)}
        currentUser={user}
        onToggleSave={handleToggleSaveFromModal}
      />

      {/* Modal Quản lý Hồ sơ cá nhân */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default App;
