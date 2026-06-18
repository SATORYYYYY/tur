import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ToursState, Tour } from '../../types';
import { toursApi, adminToursApi } from '../../services/api';

const initialState: ToursState = {
  tours: [],
  filteredTours: [],
  categories: [],
  countries: [],
  currentTour: null,
  loading: false,
};

export const fetchTours = createAsyncThunk(
  'tours/fetchTours',
  async (filters?: { country?: number; category?: number; price_min?: number; price_max?: number; search?: string }) => {
    return toursApi.getList(filters);
  }
);

export const fetchTour = createAsyncThunk('tours/fetchTour', async (id: number) => {
  return toursApi.getById(id);
});

export const createTour = createAsyncThunk('tours/createTour', async (data: Partial<Tour>) => {
  return adminToursApi.create(data);
});

export const updateTour = createAsyncThunk(
  'tours/updateTour',
  async ({ id, data }: { id: number; data: Partial<Tour> }) => {
    return adminToursApi.update(id, data);
  }
);

export const deleteTour = createAsyncThunk('tours/deleteTour', async (id: number) => {
  await adminToursApi.delete(id);
  return id;
});

const toursSlice = createSlice({
  name: 'tours',
  initialState,
  reducers: {
    setFilteredTours(state, action: PayloadAction<Tour[]>) {
      state.filteredTours = action.payload;
    },
    clearCurrentTour(state) {
      state.currentTour = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTours.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTours.fulfilled, (state, action: PayloadAction<Tour[]>) => {
        state.loading = false;
        state.tours = action.payload;
        state.filteredTours = action.payload;
      })
      .addCase(fetchTours.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchTour.fulfilled, (state, action: PayloadAction<Tour | null>) => {
        state.currentTour = action.payload;
      })
      .addCase(createTour.fulfilled, (state, action: PayloadAction<Tour>) => {
        state.tours.push(action.payload);
      })
      .addCase(updateTour.fulfilled, (state, action: PayloadAction<Tour>) => {
        const idx = state.tours.findIndex((t: Tour) => t.id === action.payload.id);
        if (idx !== -1) state.tours[idx] = action.payload;
      })
      .addCase(deleteTour.fulfilled, (state, action: PayloadAction<number>) => {
        state.tours = state.tours.filter((t: Tour) => t.id !== action.payload);
      });
  },
});

export const { setFilteredTours, clearCurrentTour } = toursSlice.actions;
export default toursSlice.reducer;