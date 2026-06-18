import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '../../types';
import { authApi } from '../../services/api';

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('travel_current_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => localStorage.getItem('travel_token');

const initialState: AuthState = {
  user: getStoredUser(),
  token: getStoredToken(),
  refreshToken: localStorage.getItem('travel_refresh'),
  isAuthenticated: !!getStoredToken(),
  loading: false,
};

export const login = createAsyncThunk('auth/login', async (credentials: { username: string; password: string }) => {
  const res = await authApi.login(credentials.username, credentials.password);
  localStorage.setItem('travel_token', res.token);
  localStorage.setItem('travel_refresh', res.refresh);
  localStorage.setItem('travel_current_user', JSON.stringify(res.user));
  return res;
});

export const register = createAsyncThunk(
  'auth/register',
  async (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone: string;
  }) => {
    const res = await authApi.register(data);
    localStorage.setItem('travel_token', res.token);
    localStorage.setItem('travel_refresh', res.refresh);
    localStorage.setItem('travel_current_user', JSON.stringify(res.user));
    return res;
  }
);

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data: Partial<User>) => {
  const res = await authApi.updateProfile(data);
  localStorage.setItem('travel_current_user', JSON.stringify(res));
  return res;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('travel_token');
      localStorage.removeItem('travel_refresh');
      localStorage.removeItem('travel_current_user');
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;