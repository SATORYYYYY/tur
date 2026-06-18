import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Users,
  Plane,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Shield,
  Trash2,
  Edit,
  Plus,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { RootState } from '../store';
import { fetchBookings, cancelBooking, payBooking } from '../store/slices/bookingsSlice';
import { fetchTours, createTour, updateTour, deleteTour } from '../store/slices/toursSlice';
import { statsApi, usersApi } from '../services/api';
import type { DashboardStats, User, Tour } from '../types';
// @ts-ignore
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
// @ts-ignore
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const { tours } = useSelector((state: RootState) => state.tours);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [countries, setCountries] = useState<{id: number; name: string}[]>([]);
  const [categories, setCategories] = useState<{id: number; name: string}[]>([]);
  const [tab, setTab] = useState<'overview' | 'tours' | 'bookings' | 'users'>('overview');
  const [showTourModal, setShowTourModal] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [tourForm, setTourForm] = useState<Partial<Tour>>({});

  useEffect(() => {
    dispatch(fetchBookings() as any);
    dispatch(fetchTours() as any);
    statsApi.get().then(setStats);
    usersApi.getAll().then(setUsers);
  }, [dispatch]);

  useEffect(() => {
    if (showTourModal) {
      fetch('http://localhost:8000/api/countries/')
        .then(r => r.json())
        .then(data => setCountries(Array.isArray(data) ? data : data.results || []))
        .catch(() => {});
      fetch('http://localhost:8000/api/categories/')
        .then(r => r.json())
        .then(data => setCategories(Array.isArray(data) ? data : data.results || []))
        .catch(() => {});
    }
  }, [showTourModal]);

  const handleDeleteTour = async (id: number) => {
    if (!confirm('Удалить тур?')) return;
    await dispatch(deleteTour(id) as any);
  };

  const handleSaveTour = async () => {
    const data: any = { ...tourForm };
    // Send country and category as IDs
    if (tourForm.country?.id) {
      data.country = tourForm.country.id;
    }
    if (tourForm.category?.id) {
      data.category = tourForm.category.id;
    }
    if (editingTour) {
      await dispatch(updateTour({ id: editingTour.id, data }) as any);
    } else {
      await dispatch(createTour(data) as any);
    }
    setShowTourModal(false);
    setEditingTour(null);
    setTourForm({});
  };

  const openEditTour = (tour: Tour) => {
    // Extract IDs from backend response for form
    setEditingTour(tour);
    setTourForm({
      ...tour,
      country: { id: (tour.country as any).id || tour.country, name: (tour.country as any).name || '' },
      category: { id: (tour.category as any).id || tour.category, name: (tour.category as any).name || '' },
    } as any);
    setShowTourModal(true);
  };

  const openCreateTour = () => {
    setEditingTour(null);
    setTourForm({});
    setShowTourModal(true);
  };

  const handleRoleChange = async (userId: number, role: string) => {
    await usersApi.updateRole(userId, role);
    usersApi.getAll().then(setUsers);
  };

  const revenueChart = stats
    ? {
        labels: stats.revenue_by_month.map((r) => r.month),
        datasets: [
          {
            label: 'Выручка',
            data: stats.revenue_by_month.map((r) => r.revenue),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: '#3b82f6',
            borderWidth: 2,
          },
        ],
      }
    : null;

  const statusChart = stats
    ? {
        labels: stats.bookings_by_status.map((s) => s.status),
        datasets: [
          {
            data: stats.bookings_by_status.map((s) => s.count),
            backgroundColor: ['#fbbf24', '#22c55e', '#ef4444'],
          },
        ],
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Панель управления</h1>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Обзор', icon: TrendingUp },
          { id: 'tours', label: 'Туры', icon: Plane },
          { id: 'bookings', label: 'Брони', icon: CalendarCheck },
          { id: 'users', label: 'Пользователи', icon: Users },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Пользователей', value: stats.total_users, icon: Users, color: 'bg-blue-500' },
              { label: 'Туров', value: stats.total_tours, icon: Plane, color: 'bg-green-500' },
              { label: 'Броней', value: stats.total_bookings, icon: CalendarCheck, color: 'bg-purple-500' },
              { label: 'Выручка', value: `${(stats.total_revenue / 1000).toFixed(0)}k ₽`, icon: DollarSign, color: 'bg-orange-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Выручка по месяцам</h3>
              {revenueChart && <Bar data={revenueChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Статусы броней</h3>
              {statusChart && <Pie data={statusChart} options={{ responsive: true }} />}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'tours' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Управление турами</h2>
            <button
              onClick={openCreateTour}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить тур
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Тур</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Страна</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Цена</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Статус</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tours.map((tour) => (
                    <tr key={tour.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={tour.main_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-medium text-gray-900 dark:text-white">{tour.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{tour.country.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{tour.price.toLocaleString()} ₽</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            tour.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tour.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEditTour(tour)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteTour(tour.id)} className="p-1 text-red-600 hover:bg-red-50 rounded ml-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'bookings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Все брони</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Тур</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Клиент</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Дата</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Сумма</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Статус</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-gray-600">#{b.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.tour.title}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{b.user.username}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{b.start_date}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{b.total_price.toLocaleString()} ₽</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            b.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : b.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {b.status === 'pending' && (
                          <button
                            onClick={() => dispatch(payBooking(b.id) as any)}
                            className="text-green-600 hover:bg-green-50 p-1 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => dispatch(cancelBooking(b.id) as any)}
                            className="text-red-600 hover:bg-red-50 p-1 rounded ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Пользователи</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Пользователь</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Телефон</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Бонусы</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Роль</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs">
                            {u.first_name?.[0] || u.username[0]}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.phone}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.bonus_points}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700"
                        >
                          <option value="client">client</option>
                          <option value="manager">manager</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tour Modal */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTour ? 'Редактировать тур' : 'Новый тур'}
              </h3>
              <button onClick={() => setShowTourModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Название"
                value={tourForm.title || ''}
                onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Описание"
                value={tourForm.description || ''}
                onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={tourForm.country?.id || ''}
                  onChange={(e) => setTourForm({ ...tourForm, country: { id: Number(e.target.value), name: countries.find(c => c.id === Number(e.target.value))?.name || '' } } as any)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Страна</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select
                  value={tourForm.category?.id || ''}
                  onChange={(e) => setTourForm({ ...tourForm, category: { id: Number(e.target.value), name: categories.find(c => c.id === Number(e.target.value))?.name || '' } } as any)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Категория</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Цена"
                  value={tourForm.price || ''}
                  onChange={(e) => setTourForm({ ...tourForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Скидка %"
                  value={tourForm.discount || ''}
                  onChange={(e) => setTourForm({ ...tourForm, discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Дней"
                  value={tourForm.duration_days || ''}
                  onChange={(e) => setTourForm({ ...tourForm, duration_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Макс. участников"
                  value={tourForm.max_participants || ''}
                  onChange={(e) => setTourForm({ ...tourForm, max_participants: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                placeholder="URL изображения"
                value={tourForm.main_image || ''}
                onChange={(e) => setTourForm({ ...tourForm, main_image: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tourForm.is_active ?? true}
                  onChange={(e) => setTourForm({ ...tourForm, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Активен</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveTour} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                Сохранить
              </button>
              <button onClick={() => setShowTourModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 py-2 rounded-lg transition-colors">
                Отмена
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
