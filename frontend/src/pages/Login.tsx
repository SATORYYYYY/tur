import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import type { RootState } from '../store';
import { login } from '../store/slices/authSlice';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await dispatch(login({ username, password }) as any);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Вход в аккаунт</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Добро пожаловать в TravelAgency</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-lg mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Логин</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Введите логин"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Ещё нет аккаунта?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Зарегистрироваться
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 text-center mb-2">Демо-аккаунты:</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('admin'); }}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
              >
                admin
              </button>
              <button
                type="button"
                onClick={() => { setUsername('manager'); setPassword('manager'); }}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
              >
                manager
              </button>
              <button
                type="button"
                onClick={() => { setUsername('client'); setPassword('client'); }}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
              >
                client
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
