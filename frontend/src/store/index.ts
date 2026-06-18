import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import toursReducer from './slices/toursSlice';
import bookingsReducer from './slices/bookingsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tours: toursReducer,
    bookings: bookingsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
