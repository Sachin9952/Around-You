import { Link } from 'react-router-dom';
import { HiStar } from 'react-icons/hi';

const ServiceCard = ({ service }) => {
  const categoryColors = {
    plumber: 'from-blue-500 to-cyan-500',
    electrician: 'from-yellow-500 to-orange-500',
    cleaner: 'from-emerald-500 to-teal-500',
    painter: 'from-purple-500 to-pink-500',
    carpenter: 'from-amber-600 to-yellow-600',
    mechanic: 'from-red-500 to-rose-500',
    tutor: 'from-indigo-500 to-violet-500',
    other: 'from-gray-500 to-slate-500',
  };

  const gradient = categoryColors[service.category] || categoryColors.other;

  return (
    <Link to={`/services/${service._id}`} className="group">
      <div className="card-glow overflow-hidden">
        {/* Category gradient banner */}
        <div className={`h-2 -mt-6 -mx-6 mb-4 bg-gradient-to-r ${gradient}`}></div>

        {/* Category badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`badge bg-gradient-to-r ${gradient} text-white text-xs`}>
            {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
          </span>
          {service.averageRating > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <HiStar className="w-4 h-4" />
              <span className="text-sm font-medium">{service.averageRating.toFixed(1)}</span>
              <span className="text-xs text-dark-200">({service.totalReviews})</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors mb-2 line-clamp-1">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-dark-100 mb-4 line-clamp-2">{service.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-500">
          <div>
            <span className="text-xl font-bold text-primary-400">₹{service.price}</span>
            <span className="text-xs text-dark-200 ml-1">
              /{service.priceType === 'hourly' ? 'hr' : 'job'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-dark-200 text-xs">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {service.location}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
