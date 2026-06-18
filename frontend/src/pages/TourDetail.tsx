import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
  Heart,
  Share2,
  Check,
  Minus,
  Plus,
  AlertCircle,
  Gift,
  FileText,
} from 'lucide-react';
import type { RootState } from '../store';
import { fetchTour } from '../store/slices/toursSlice';
import { createBooking, addToWishlist, removeFromWishlist, fetchWishlist } from '../store/slices/bookingsSlice';
import MapComponent from '../components/MapComponent';
import { jsPDF } from 'jspdf';

export default function TourDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTour } = useSelector((state: RootState) => state.tours);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { wishlist } = useSelector((state: RootState) => state.bookings);
  const [participants, setParticipants] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [bonusUsed, setBonusUsed] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchTour(Number(id)) as any);
  }, [dispatch, id]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchWishlist() as any);
  }, [dispatch, isAuthenticated]);

  if (!currentTour) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-2xl" />
      </div>
    );
  }

  const isWishlisted = wishlist.some((w) => w.tour.id === currentTour.id);
  const discountedPrice = Math.round(currentTour.price * (1 - currentTour.discount / 100));
  const totalPrice = Math.max(discountedPrice * participants - bonusUsed, 0);
  const maxBonus = user ? Math.min(user.bonus_points, discountedPrice * participants) : 0;

  const handleBooking = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    if (!startDate) {
      alert('Выберите дату начала');
      return;
    }
    try {
      await dispatch(
        createBooking({
          tour: currentTour.id,
          participants,
          start_date: startDate,
          bonus_used: bonusUsed,
        }) as any
      );
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (e) {
      alert('Ошибка бронирования');
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isWishlisted) {
      await dispatch(removeFromWishlist(currentTour.id) as any);
    } else {
      await dispatch(addToWishlist(currentTour.id) as any);
    }
  };

  const generateVoucher = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('TravelAgency - Ваучер', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Тур: ${currentTour.title}`, 20, 40);
    doc.text(`Страна: ${currentTour.country.name}`, 20, 50);
    doc.text(`Дата начала: ${startDate || 'не указана'}`, 20, 60);
    doc.text(`Участников: ${participants}`, 20, 70);
    doc.text(`Стоимость: ${totalPrice.toLocaleString()} ₽`, 20, 80);
    doc.text(`Бонусов использовано: ${bonusUsed}`, 20, 90);
    doc.save(`voucher_${currentTour.id}.pdf`);
  };

  const images = [currentTour.main_image, ...currentTour.gallery];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[4/3]">
            <img src={images[activeImage]} alt={currentTour.title} className="w-full h-full object-cover" />
            {currentTour.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full">
                -{currentTour.discount}%
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  i === activeImage ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentTour.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                {currentTour.country.name}
                <span className="mx-2">·</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {currentTour.rating}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleWishlist}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
              </button>
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">{currentTour.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <div className="text-sm font-semibold">{currentTour.duration_days} дн.</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <div className="text-sm font-semibold">до {currentTour.max_participants}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <div className="text-sm font-semibold">{currentTour.category.name}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-end justify-between mb-4">
              <div>
                {currentTour.discount > 0 && (
                  <div className="text-lg text-gray-400 line-through">{currentTour.price.toLocaleString()} ₽</div>
                )}
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {discountedPrice.toLocaleString()} ₽
                </div>
                <div className="text-sm text-gray-500">за человека</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Дата начала</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Участников</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setParticipants(Math.max(1, participants - 1))}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold w-8 text-center">{participants}</span>
                  <button
                    onClick={() => setParticipants(Math.min(currentTour.max_participants, participants + 1))}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {isAuthenticated && user && user.bonus_points > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <Gift className="w-4 h-4 text-pink-500" />
                    Использовать бонусы (доступно: {user.bonus_points})
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxBonus}
                    value={bonusUsed}
                    onChange={(e) => setBonusUsed(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">Списано: {bonusUsed} баллов</div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Итого:</span>
                  <span className="text-2xl font-bold text-blue-600">{totalPrice.toLocaleString()} ₽</span>
                </div>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <Check className="w-5 h-5" />
                <span>Бронь успешно создана!</span>
              </div>
            ) : (
              <button
                onClick={handleBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {isAuthenticated ? 'Забронировать' : 'Войти для бронирования'}
              </button>
            )}

            <button
              onClick={generateVoucher}
              className="w-full mt-2 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium py-2"
            >
              <FileText className="w-4 h-4" />
              Скачать PDF-ваучер
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Расположение на карте</h2>
        <MapComponent tours={[currentTour]} height="350px" />
      </div>
    </div>
  );
}
