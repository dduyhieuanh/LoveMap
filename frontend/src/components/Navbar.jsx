import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Bookmark,
  PlusCircle,
  LogOut,
  User as UserIcon,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenAddModal, onOpenProfileModal, onRandomPick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent tracking-tight">
              DateSpot
            </span>
            <p className="text-[11px] text-slate-500 hidden sm:block leading-none">
              Ăn uống & Hẹn hò lý tưởng
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
              isActive('/')
                ? 'bg-rose-50 text-rose-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Khám phá</span>
          </Link>

          {user && (
            <Link
              to="/my-collection"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                isActive('/my-collection')
                  ? 'bg-rose-50 text-rose-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Bộ sưu tập</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/admin')
                  ? 'bg-slate-900 text-amber-300 shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Quản trị</span>
            </Link>
          )}

          {onRandomPick && (
            <button
              type="button"
              onClick={onRandomPick}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
              title="Chọn ngẫu nhiên 1 quán để đi ngay hôm nay"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hôm nay đi đâu?</span>
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <button
                type="button"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm shadow-rose-500/20 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Thêm địa điểm</span>
              </button>

              <button
                type="button"
                onClick={onOpenProfileModal}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                title="Quản lý hồ sơ cá nhân"
              >
                <img
                  src={
                    user.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="text-sm font-medium text-slate-700 hidden md:inline max-w-[110px] truncate">
                  {user.name}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-900 text-amber-300">
                    ADMIN
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <UserIcon className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
