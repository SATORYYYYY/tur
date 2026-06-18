export type UserRole = 'client' | 'manager' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar: string;
  bonus_points: number;
  role: UserRole;
}

export interface Country {
  id: number;
  name: string;
  code: string;
  lat: number;
  lng: number;
}

export interface TourCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Tour {
  id: number;
  title: string;
  description: string;
  country: Country;
  category: TourCategory;
  price: number;
  discount: number;
  duration_days: number;
  max_participants: number;
  main_image: string;
  gallery: string[];
  is_active: boolean;
  rating: number;
  lat: number;
  lng: number;
}

export type BookingStatus = 'pending' | 'paid' | 'cancelled';

export interface Booking {
  id: number;
  tour: Tour;
  user: User;
  participants: number;
  total_price: number;
  status: BookingStatus;
  start_date: string;
  bonus_used: number;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  user: number;
  tour: Tour;
}

export interface BonusTransaction {
  id: number;
  user: number;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Postcard {
  id: number;
  user: number;
  tour: Tour;
  image_url: string;
  message: string;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_tours: number;
  total_bookings: number;
  total_revenue: number;
  bookings_by_status: { status: string; count: number }[];
  revenue_by_month: { month: string; revenue: number }[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface ToursState {
  tours: Tour[];
  filteredTours: Tour[];
  categories: TourCategory[];
  countries: Country[];
  currentTour: Tour | null;
  loading: boolean;
}

export interface BookingsState {
  bookings: Booking[];
  myBookings: Booking[];
  wishlist: WishlistItem[];
  loading: boolean;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}
