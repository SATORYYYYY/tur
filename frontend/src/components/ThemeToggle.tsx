import { Moon, Sun } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/slices/uiSlice';
import type { RootState } from '../store';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
    </button>
  );
}
