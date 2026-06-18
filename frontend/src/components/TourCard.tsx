import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Users, Clock } from 'lucide-react';
import type { Tour } from '../types';

interface TourCardProps {
  tour: Tour;
  isWishlisted?: boolean;
  onToggleWishlist?: (tourId: number) => void;
}

export default function TourCard({ tour, isWishlisted, onToggleWishlist }: TourCardProps) {
  const discountedPrice = Math.round(tour.price * (1 - tour.discount / 100));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={tour.main_image}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {tour.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -
            {tour.discount}%
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          {tour.rating}
        </div>
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(tour.id);
            }}
            className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
            />
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <MapPin className="w-3 h-3" />
          {tour.country.name}
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{tour.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{tour.description}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tour.duration_days} дн.
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            до {tour.max_participants}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            {tour.discount > 0 && (
              <span className="text-sm text-gray-400 line-through mr-2">
                {tour.price.toLocaleString()} ₽
              </span>
            )}
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {discountedPrice.toLocaleString()} ₽
            </span>
          </div>
          <Link
            to={`/tours/${tour.id}`}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
