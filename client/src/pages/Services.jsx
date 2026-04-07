import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiSearch, HiAdjustments, HiX } from 'react-icons/hi';

const categories = ['plumber', 'electrician', 'cleaner', 'painter', 'carpenter', 'mechanic', 'tutor', 'other'];

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    sort: searchParams.get('sort') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchServices();
  }, [filters.category, filters.sort, filters.page]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.sort) params.sort = filters.sort;
      params.page = filters.page;
      params.limit = 12;

      const { data } = await API.get('/services', { params });
      setServices(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchServices();
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', location: '', sort: '', page: 1 });
    setSearchParams({});
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // Update URL params
    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  const hasActiveFilters = filters.category || filters.location || filters.sort;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Browse Services</h1>

        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field pl-10"
              placeholder="Search services..."
            />
          </div>
          <div className="relative flex-1 min-w-[140px] sm:flex-none sm:w-48">
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="input-field"
              placeholder="Location..."
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="submit" className="btn-primary !px-3" aria-label="Search">
              <HiSearch className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-primary-500 text-primary-400' : ''}`}
            >
              <HiAdjustments className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                <HiX className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${filters.category === cat
                        ? 'bg-primary-600 border-primary-500 text-white'
                        : 'bg-dark-600 border-dark-400 text-dark-100 hover:border-dark-300'
                      }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-dark-200 mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading services..." />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No services found</h3>
          <p className="text-dark-200 mb-4">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn-secondary text-sm">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page <= 1}
                className="btn-secondary text-sm !py-2 !px-3 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-dark-200 px-4">
                Page {filters.page} of {totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= totalPages}
                className="btn-secondary text-sm !py-2 !px-3 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Services;
