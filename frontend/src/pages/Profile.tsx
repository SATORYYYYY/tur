import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  MapPin,
  CreditCard,
  Gift,
  Heart,
  Settings,
  Clock,
  Check,
  X,
  Camera,
  FileText,
  AlertCircle,
} from 'lucide-react';
import type { RootState } from '../store';
import { updateProfile, setUser } from '../store/slices/authSlice';
import { fetchMyBookings, fetchWishlist, payBooking, cancelBooking } from '../store/slices/bookingsSlice';
import CountdownTimer from '../components/CountdownTimer';
import TourCard from '../components/TourCard';
import { transactionsApi, authApi } from '../services/api';
import type { BonusTransaction } from '../types';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myBookings, wishlist } = useSelector((state: RootState) => state.bookings);
  const [tab, setTab] = useState<'bookings' | 'wishlist' | 'bonuses' | 'settings'>('bookings');
  const [transactions, setTransactions] = useState<BonusTransaction[]>([]);
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      // Refresh user data to get latest bonus points
      authApi.getProfile().then((userData) => {
        dispatch(setUser(userData as any));
      }).catch(() => {});
      dispatch(fetchMyBookings() as any);
      dispatch(fetchWishlist() as any);
      transactionsApi.get().then(setTransactions);
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    await dispatch(updateProfile(editForm) as any);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = () => {
        dispatch(updateProfile({ avatar: reader.result as string }) as any);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePay = async (bookingId: number) => {
    await dispatch(payBooking(bookingId) as any);
    if (user) dispatch(fetchMyBookings(user.id) as any);
  };

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Отменить бронь?')) return;
    await dispatch(cancelBooking(bookingId) as any);
    if (user) dispatch(fetchMyBookings(user.id) as any);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>Необходимо войти в аккаунт</p>
      </div>
    );
  }

  const upcoming = myBookings.filter((b) => b.status !== 'cancelled' && new Date(b.start_date) > new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl font-bold overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  (user.first_name?.[0] || user.username[0]).toUpperCase()
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                <Camera className="w-3 h-3" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
            <h2 className="text-center font-bold text-lg text-gray-900 dark:text-white">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-center text-sm text-gray-500">@{user.username}</p>
            <div className="mt-4 flex items-center justify-center gap-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 px-3 py-1.5 rounded-full text-sm font-medium">
              <Gift className="w-4 h-4" />
              {user.bonus_points} бонусов
            </div>
          </div>

          <nav className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {[
              { id: 'bookings', label: 'Мои брони', icon: Calendar },
              { id: 'wishlist', label: 'Избранное', icon: Heart },
              { id: 'bonuses', label: 'Бонусы', icon: Gift },
              { id: 'settings', label: 'Настройки', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  tab === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {tab === 'bookings' && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Мои брони</h2>

                {upcoming.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white mb-8">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Ближайшая поездка
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-xl font-bold">{upcoming[0].tour.title}</div>
                        <div className="text-blue-100 flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {upcoming[0].tour.country.name} · {upcoming[0].start_date}
                        </div>
                      </div>
                      <CountdownTimer targetDate={upcoming[0].start_date} />
                    </div>
                  </div>
                )}

                {myBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">У вас пока нет броней</div>
                ) : (
                  <div className="space-y-4">
                    {myBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={booking.tour.main_image}
                              alt={booking.tour.title}
                              className="w-20 h-20 rounded-xl object-cover"
                            />
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white">{booking.tour.title}</h3>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {booking.start_date} · {booking.participants} чел.
                              </div>
                              <div
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                                  booking.status === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : booking.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {booking.status === 'paid' && <Check className="w-3 h-3" />}
                                {booking.status === 'cancelled' && <X className="w-3 h-3" />}
                                {booking.status === 'pending' && 'Ожидает оплаты'}
                                {booking.status === 'paid' && 'Оплачено'}
                                {booking.status === 'cancelled' && 'Отменено'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-lg">{booking.total_price.toLocaleString()} ₽</div>
                              {booking.bonus_used > 0 && (
                                <div className="text-xs text-pink-500">Бонусов: -{booking.bonus_used}</div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handlePay(booking.id)}
                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                                  >
                                    <CreditCard className="w-3 h-3" />
                                    Оплатить
                                  </button>
                                  <button
                                    onClick={() => handleCancel(booking.id)}
                                    className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm px-3 py-2"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {booking.status === 'paid' && new Date(booking.start_date) > new Date() && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <CountdownTimer targetDate={booking.start_date} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Избранное</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Список избранного пуст</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlist.map((item) => (
                      <TourCard key={item.id} tour={item.tour} isWishlisted={true} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'bonuses' && (
              <motion.div
                key="bonuses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Бонусная программа</h2>
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white mb-8">
                  <div className="text-sm opacity-90 mb-1">Ваш баланс</div>
                  <div className="text-4xl font-bold">{user.bonus_points} баллов</div>
                  <div className="text-sm opacity-90 mt-2">1 балл = 1 ₽ скидки при оплате</div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">История операций</h3>
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{t.reason}</div>
                        <div className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString('ru-RU')}</div>
                      </div>
                      <div className={`font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.amount > 0 ? '+' : ''}
                        {t.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Настройки профиля</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя</label>
                      <input
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Фамилия</label>
                      <input
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    {saveSuccess ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Сохранено
                      </span>
                    ) : (
                      'Сохранить изменения'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
