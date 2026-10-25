import React from 'react';
import { Search, SlidersHorizontal, Tag, X } from 'lucide-react';

export const CATEGORIES = [
  'All',
  'Cafe',
  'Nhà hàng',
  'Pub & Bar',
  'Bánh ngọt & Trà',
  'Ăn vặt / Vỉa hè',
  'Khác',
];

export const POPULAR_TAGS = [
  'Lãng mạn',
  'First Date',
  'Rooftop',
  'Yên tĩnh',
  'Kỷ niệm',
  'Acoustic',
  'View ban công',
  'Đà Lạt',
];

const FilterBar = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Hàng 1: Ô tìm kiếm + Sắp xếp */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên quán, đường, quận, món ăn hoặc ghi chú..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none text-sm transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:border-rose-500 outline-none"
          >
            <option value="newest">Mới chia sẻ nhất</option>
            <option value="popular">Được lưu nhiều nhất</option>
            <option value="rating">Điểm đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* Hàng 2: Lọc theo Thể loại (Categories) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                active
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat === 'All' ? 'Tất cả thể loại' : cat}
            </button>
          );
        })}
      </div>

      {/* Hàng 3: Thẻ gợi ý nhanh (Tags) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1 text-xs font-medium text-slate-400 mr-1">
          <Tag className="w-3.5 h-3.5" />
          Tag phổ biến:
        </span>
        {POPULAR_TAGS.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onTagChange(isSelected ? '' : tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                isSelected
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              #{tag}
            </button>
          );
        })}
        {selectedTag && (
          <button
            type="button"
            onClick={() => onTagChange('')}
            className="text-xs text-rose-600 hover:underline ml-1 font-medium"
          >
            Xoá lọc tag
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;

