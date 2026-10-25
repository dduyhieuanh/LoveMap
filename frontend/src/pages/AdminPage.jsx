import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  MapPin,
  Edit3,
  Trash2,
  Search,
  Globe,
  Lock,
  X,
  Star,
  ExternalLink,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { openLocationInGoogleMaps } from '../utils/maps';

const AdminPage = ({ refreshKey, onEditLocation, onSelectDetail }) => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'locations'
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // State cho Modal chỉnh sửa tài khoản người dùng
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'user',
    bio: '',
    password: '',
  });
  const [savingUser, setSavingUser] = useState(false);

  const fetchAdminData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      const [usersRes, locationsRes] = await Promise.all([
        axiosClient.get('/auth/users'),
        axiosClient.get('/locations/admin-all'),
      ]);
      setUsers(usersRes.data || []);
      setLocations(locationsRes.data || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu quản trị:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData, refreshKey]);

  if (!authLoading && (!user || user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  // Mở modal chỉnh sửa người dùng
  const handleOpenEditUser = (targetUser) => {
    setEditingUser(targetUser);
    setUserForm({
      name: targetUser.name || '',
      email: targetUser.email || '',
      role: targetUser.role || 'user',
      bio: targetUser.bio || '',
      password: '',
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        bio: userForm.bio,
      };
      if (userForm.password.trim()) {
        payload.password = userForm.password.trim();
      }
      await axiosClient.put(`/auth/users/${editingUser._id}`, payload);
      setEditingUser(null);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi cập nhật tài khoản');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (String(targetUser._id) === String(user._id)) {
      alert('Bạn không thể tự xoá tài khoản Admin đang đăng nhập!');
      return;
    }
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn XOÁ tài khoản "${targetUser.name}" (${targetUser.email}) và toàn bộ địa điểm do người này tạo không?`
      )
    ) {
      return;
    }
    try {
      await axiosClient.delete(`/auth/users/${targetUser._id}`);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xoá tài khoản');
    }
  };

  const handleDeleteLocation = async (loc) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xoá địa điểm "${loc.name}" của "${loc.createdBy?.name || 'Thành viên'}" không?`
      )
    ) {
      return;
    }
    try {
      await axiosClient.delete(`/locations/${loc._id}`);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xoá địa điểm');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const filteredLocations = locations.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.name?.toLowerCase().includes(q) ||
      l.address?.toLowerCase().includes(q) ||
      l.category?.toLowerCase().includes(q) ||
      l.createdBy?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Quản trị */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Bảng điều khiển Quản trị viên (Admin Panel)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Quản lý Tài khoản & Địa điểm Hệ thống
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Toàn quyền chỉnh sửa, phân quyền hoặc xoá bất kỳ tài khoản người dùng và địa điểm nào trên DateSpot.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 px-4 py-3 rounded-2xl text-center">
            <p className="text-2xl font-extrabold text-amber-300">{users.length}</p>
            <p className="text-[11px] text-slate-300">Tài khoản</p>
          </div>
          <div className="bg-white/10 px-4 py-3 rounded-2xl text-center">
            <p className="text-2xl font-extrabold text-rose-400">{locations.length}</p>
            <p className="text-[11px] text-slate-300">Địa điểm</p>
          </div>
        </div>
      </div>

      {/* Thanh công cụ chuyển Tab & Tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản lý Tài khoản ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'locations'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Quản lý Tất cả Địa điểm ({locations.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'users'
                ? 'Tìm theo tên, email, quyền...'
                : 'Tìm theo tên quán, địa chỉ, người tạo...'
            }
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
          />
        </div>
      </div>

      {/* Nội dung từng Tab */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-sm text-slate-500">
          Đang tải dữ liệu hệ thống...
        </div>
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Người dùng</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Vai trò</th>
                  <th className="py-3.5 px-4">Số địa điểm đã tạo</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                            {u.bio}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'admin' ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-amber-300">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          Thành viên
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">
                      {u.locationsCount || 0} quán
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        {String(u._id) !== String(user._id) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xoá</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Địa điểm</th>
                  <th className="py-3.5 px-4">Thể loại & Đánh giá</th>
                  <th className="py-3.5 px-4">Chế độ</th>
                  <th className="py-3.5 px-4">Người tạo</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLocations.map((loc) => (
                  <tr key={loc._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            loc.images?.[0] ||
                            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={loc.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 cursor-pointer"
                          onClick={() => onSelectDetail && onSelectDetail(loc)}
                        />
                        <div>
                          <button
                            type="button"
                            onClick={() => onSelectDetail && onSelectDetail(loc)}
                            className="font-bold text-slate-900 hover:text-rose-600 text-left"
                          >
                            {loc.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => openLocationInGoogleMaps(loc, 'directions')}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 mt-0.5"
                          >
                            <span className="line-clamp-1 max-w-xs">{loc.address}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {loc.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 mt-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{Number(loc.rating).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {loc.isPublic ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <Globe className="w-3 h-3" />
                          Công khai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800">
                          <Lock className="w-3 h-3" />
                          Riêng tư
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 text-xs">
                        {loc.createdBy?.name || 'Thành viên'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {loc.createdBy?.email || ''}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditLocation && onEditLocation(loc)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(loc)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xoá</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa Tài khoản Người dùng */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                Chỉnh sửa tài khoản: {editingUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email đăng nhập
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phân quyền (Vai trò)
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none bg-white"
                >
                  <option value="user">Thành viên (User)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giới thiệu (Bio)
                </label>
                <textarea
                  rows={2}
                  value={userForm.bio}
                  onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đặt lại mật khẩu mới (Để trống nếu giữ nguyên)
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Nhập tối thiểu 6 ký tự nếu muốn đổi..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white transition"
                >
                  {savingUser ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

