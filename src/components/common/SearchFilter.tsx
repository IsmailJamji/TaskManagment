import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string>) => void;
  filterOptions?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  placeholder?: string;
}

export function SearchFilter({ onSearch, onFilter, filterOptions = [], placeholder }: SearchFilterProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={placeholder || t('search.placeholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        {filterOptions.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            {t('filter.all')}
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && filterOptions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4">
            {filterOptions.map((filter) => (
              <div key={filter.key} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                <select
                  value={activeFilters[filter.key] || 'all'}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{t('filter.all')}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
