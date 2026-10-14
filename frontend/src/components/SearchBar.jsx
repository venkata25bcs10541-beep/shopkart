import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  onReset,
}) => {
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    (selectedCategory !== 'All Categories' && selectedCategory !== '') ||
    selectedSort !== '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Search Input Box */}
        <div className="relative md:col-span-6 lg:col-span-6">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown Filter */}
        <div className="relative md:col-span-3 lg:col-span-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>

        {/* Sort Dropdown (Bonus Challenge) */}
        <div className="relative md:col-span-3 lg:col-span-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <ArrowUpDown className="w-4 h-4" />
          </div>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition appearance-none cursor-pointer"
          >
            <option value="">Featured / Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Active Filter Indicator & Reset Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-medium">
            Filtering by:{' '}
            <span className="text-slate-800 font-semibold">
              {[
                searchTerm && `"${searchTerm}"`,
                selectedCategory !== 'All Categories' && selectedCategory,
                selectedSort === 'price_asc' && 'Price: Low to High',
                selectedSort === 'price_desc' && 'Price: High to Low',
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          </span>
          <button
            onClick={onReset}
            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer transition"
          >
            <X className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
