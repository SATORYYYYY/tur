import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Compass } from 'lucide-react';
import type { RootState } from '../store';
import { fetchTours } from '../store/slices/toursSlice';
import TourCard from '../components/TourCard';
import MapComponent from '../components/MapComponent';
import { countries, categories } from '../mock/data';

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tours, loading } = useSelector((state: RootState) => state.tours);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    dispatch(fetchTours() as any);
  }, [dispatch]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (country) params.set('country', country);
    if (category) params.set('category', category);
    navigate(`/tours?${params.toString()}`);
  };

  const featured = tours.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Откройте мир вместе с{' '}
              <span className="text-cyan-300">TravelAgency</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Более 100 направлений, гибкие условия бронирования и бонусная программа для постоянных путешественников.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Куда едем?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="">Все страны</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="">Все категории</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Найти тур
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Популярные туры</h2>
          <button
            onClick={() => navigate('/tours')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            Все туры <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">Карта направлений</h2>
        <MapComponent tours={tours} height="500px" />
      </section>

      {/* Stats */}
      <section className="bg-blue-600 dark:bg-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Стран' },
              { value: '500+', label: 'Туров' },
              { value: '10 000+', label: 'Довольных клиентов' },
              { value: '15 лет', label: 'На рынке' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
