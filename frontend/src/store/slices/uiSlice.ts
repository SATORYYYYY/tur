import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState } from '../../types';

const savedTheme = localStorage.getItem('travel_theme') as 'light' | 'dark' | null;
const initialState: UIState = {
  theme: savedTheme || 'light',
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('travel_theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
      localStorage.setItem('travel_theme', action.payload);
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
