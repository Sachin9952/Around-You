import { HiStar } from 'react-icons/hi';

const StarRating = ({ rating, onRate, readonly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate && onRate(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <HiStar
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-dark-400'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
