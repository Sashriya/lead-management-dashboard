import { useState, useEffect } from 'react';
import { FilterOptions } from '../../types';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';

interface LeadFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onSearch: (search: string) => void;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onSearch(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, onSearch]);

  const handleReset = () => {
    setSearchTerm('');
    onFilterChange({
      status: '',
      source: '',
      search: '',
      sortBy: 'latest',
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email…"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status — lowercase values match the schema */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.status || ''}
          onChange={(e) =>
            onFilterChange({ ...filters, status: e.target.value, page: 1 })
          }
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="lost">Lost</option>
        </select>

        {/* Source — lowercase values match the schema */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.source || ''}
          onChange={(e) =>
            onFilterChange({ ...filters, source: e.target.value, page: 1 })
          }
        >
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="instagram">Instagram</option>
          <option value="referral">Referral</option>
          <option value="linkedin">LinkedIn</option>
        </select>

        {/* Sort */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.sortBy || 'latest'}
          onChange={(e) =>
            onFilterChange({ ...filters, sortBy: e.target.value as any })
          }
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default LeadFilters;