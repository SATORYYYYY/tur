import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Shield, Heart, MessageCircle, Image, LayoutDashboard, Plane } from 'lucide-react';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Главная', icon: Plane },
    { to: '/tours', label: 'Туры', icon: Plane },
    { to: '/assistant', label: 'Помощник', icon: MessageCircle },
    { to: '/postcards', label: 'Открытки', icon: Image },
  ];

  const authLinks = isAuthenticated
    ? [
        { to: '/profile', label: 'Профиль', icon: User },
        { to: '/profile/wishlist', label: 'Избранное', icon: Heart },
        ...(user?.role === 'admin' || user?.role === 'manager'
          ? [{ to: '/admin', label: 'Админка', icon: LayoutDashboard }]
          : []),
      ]
    : [
        { to: '/login', label: 'Войти', icon: User },
        { to: '/register', label: 'Регистрация', icon: Shield },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Plane className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              TravelAgency
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs">
                    {user.first_name?.[0] || user.username[0]}
                  </div>
                  <span className="hidden lg:inline">{user.first_name || user.username}</span>
                </Link>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600"
                  >
                    Админка
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title="Выйти"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-3 space-y-1">
              {[...navLinks, ...authLinks].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
