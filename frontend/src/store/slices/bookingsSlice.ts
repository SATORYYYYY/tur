import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { BookingsState, Booking, WishlistItem } from '../../types';
import { bookingsApi, adminBookingsApi, wishlistApi, authApi } from '../../services/api';
import { setUser } from './authSlice';

const initialState: BookingsState = {
  bookings: [],
  myBookings: [],
  wishlist: [],
  loading: false,
};

export const fetchMyBookings = createAsyncThunk('bookings/fetchMyBookings', async () => {
  return bookingsApi.getMy();
});

export const fetchBookings = createAsyncThunk('bookings/fetchBookings', async () => {
  return adminBookingsApi.getAll();
});

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (data: { tour: number; participants: number; start_date: string; bonus_used: number }, { dispatch }) => {
    const result = await bookingsApi.create(data);
    // Refresh user data to get updated bonus points
    try {
      const user = await authApi.getProfile();
      dispatch(setUser(user as any));
    } catch {}
    return result;
  }
);

export const payBooking = createAsyncThunk(
  'bookings/payBooking',
  async (id: number, { dispatch }) => {
    const result = await bookingsApi.pay(id);
    // Refresh user data to get updated bonus points
    try {
      const user = await authApi.getProfile();
      dispatch(setUser(user as any));
    } catch {}
    return result;
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (id: number, { dispatch }) => {
    const result = await bookingsApi.cancel(id);
    // Refresh user data to get updated bonus points
    try {
      const user = await authApi.getProfile();
      dispatch(setUser(user as any));
    } catch {}
    return result;
  }
);

export const fetchWishlist = createAsyncThunk('bookings/fetchWishlist', async () => {
  return wishlistApi.get();
});

export const addToWishlist = createAsyncThunk('bookings/addToWishlist', async (tourId: number) => {
  return wishlistApi.add(tourId);
});

export const removeFromWishlist = createAsyncThunk('bookings/removeFromWishlist', async (tourId: number) => {
  await wishlistApi.remove(tourId);
  return tourId;
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.myBookings = action.payload;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.bookings = action.payload;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.myBookings.push(action.payload);
      })
      .addCase(payBooking.fulfilled, (state, action: PayloadAction<any>) => {
        // Update booking status to paid
        const booking = state.myBookings.find(b => b.status === 'pending');
        if (booking) {
          booking.status = 'paid';
        }
      })
      .addCase(cancelBooking.fulfilled, (state, action: PayloadAction<any>) => {
        // Update booking status to cancelled
        state.myBookings = state.myBookings.map(b =>
          b.status !== 'paid' ? { ...b, status: 'cancelled' as const } : b
        );
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
        state.wishlist = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action: PayloadAction<WishlistItem>) => {
        state.wishlist.push(action.payload);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<number>) => {
        state.wishlist = state.wishlist.filter((w: WishlistItem) => w.tour.id !== action.payload);
      });
  },
});

export default bookingsSlice.reducer;