import type { User, Tour, Booking, WishlistItem, BonusTransaction, Postcard, DashboardStats, UserRole } from '../types';
import { toursData, countries, categories, initialUsers, initialBookings, initialWishlist, initialTransactions, initialPostcards } from './data';

const STORAGE_KEYS = {
  users: 'travel_users',
  tours: 'travel_tours',
  bookings: 'travel_bookings',
  wishlist: 'travel_wishlist',
  transactions: 'travel_transactions',
  postcards: 'travel_postcards',
  currentUser: 'travel_current_user',
  token: 'travel_token',
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    setStorage(STORAGE_KEYS.users, initialUsers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.tours)) {
    setStorage(STORAGE_KEYS.tours, toursData);
  }
  if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
    setStorage(STORAGE_KEYS.bookings, initialBookings);
  }
  if (!localStorage.getItem(STORAGE_KEYS.wishlist)) {
    setStorage(STORAGE_KEYS.wishlist, initialWishlist);
  }
  if (!localStorage.getItem(STORAGE_KEYS.transactions)) {
    setStorage(STORAGE_KEYS.transactions, initialTransactions);
  }
  if (!localStorage.getItem(STORAGE_KEYS.postcards)) {
    setStorage(STORAGE_KEYS.postcards, initialPostcards);
  }
}

initStorage();

function getUsers(): User[] {
  return getStorage<User[]>(STORAGE_KEYS.users, []);
}

function getTours(): Tour[] {
  return getStorage<Tour[]>(STORAGE_KEYS.tours, []);
}

function getBookings(): Booking[] {
  return getStorage<Booking[]>(STORAGE_KEYS.bookings, []);
}

function getWishlist(): WishlistItem[] {
  return getStorage<WishlistItem[]>(STORAGE_KEYS.wishlist, []);
}

function getTransactions(): BonusTransaction[] {
  return getStorage<BonusTransaction[]>(STORAGE_KEYS.transactions, []);
}

function getPostcards(): Postcard[] {
  return getStorage<Postcard[]>(STORAGE_KEYS.postcards, []);
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function register(data: { username: string; email: string; password: string; first_name: string; last_name: string; phone: string }): Promise<{ user: User; token: string; refresh: string }> {
  await delay();
  const users = getUsers();
  if (users.find((u) => u.username === data.username)) {
    throw new Error('Пользователь с таким логином уже существует');
  }
  if (users.find((u) => u.email === data.email)) {
    throw new Error('Пользователь с таким email уже существует');
  }
  const newUser: User = {
    id: Date.now(),
    username: data.username,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    avatar: '',
    bonus_points: 500,
    role: 'client',
  };
  users.push(newUser);
  setStorage(STORAGE_KEYS.users, users);
  const token = `mock_token_${newUser.id}`;
  const refresh = `mock_refresh_${newUser.id}`;
  setStorage(STORAGE_KEYS.currentUser, newUser);
  setStorage(STORAGE_KEYS.token, token);
  return { user: newUser, token, refresh };
}

export async function login(data: { username: string; password: string }): Promise<{ user: User; token: string; refresh: string }> {
  await delay();
  const users = getUsers();
  const user = users.find((u) => u.username === data.username);
  if (!user) {
    throw new Error('Неверный логин или пароль');
  }
  const token = `mock_token_${user.id}`;
  const refresh = `mock_refresh_${user.id}`;
  setStorage(STORAGE_KEYS.currentUser, user);
  setStorage(STORAGE_KEYS.token, token);
  return { user, token, refresh };
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  localStorage.removeItem(STORAGE_KEYS.token);
}

export function getCurrentUser(): User | null {
  return getStorage<User | null>(STORAGE_KEYS.currentUser, null);
}

export function getToken(): string | null {
  return getStorage<string | null>(STORAGE_KEYS.token, null);
}

export async function fetchTours(filters?: {
  country?: number;
  category?: number;
  price_min?: number;
  price_max?: number;
  date?: string;
  search?: string;
}): Promise<Tour[]> {
  await delay();
  let tours = getTours().filter((t) => t.is_active);
  if (filters?.country) {
    tours = tours.filter((t) => t.country.id === Number(filters.country));
  }
  if (filters?.category) {
    tours = tours.filter((t) => t.category.id === Number(filters.category));
  }
  if (filters?.price_min !== undefined) {
    tours = tours.filter((t) => t.price >= Number(filters.price_min));
  }
  if (filters?.price_max !== undefined) {
    tours = tours.filter((t) => t.price <= Number(filters.price_max));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    tours = tours.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.country.name.toLowerCase().includes(q));
  }
  return tours;
}

export async function fetchTour(id: number): Promise<Tour | null> {
  await delay();
  return getTours().find((t) => t.id === id) || null;
}

export async function createTour(data: Partial<Tour>): Promise<Tour> {
  await delay();
  const tours = getTours();
  const newTour: Tour = {
    id: Date.now(),
    title: data.title || '',
    description: data.description || '',
    country: data.country || countries[0],
    category: data.category || categories[0],
    price: data.price || 0,
    discount: data.discount || 0,
    duration_days: data.duration_days || 1,
    max_participants: data.max_participants || 10,
    main_image: data.main_image || '',
    gallery: data.gallery || [],
    is_active: data.is_active ?? true,
    rating: 0,
    lat: data.lat || 0,
    lng: data.lng || 0,
  };
  tours.push(newTour);
  setStorage(STORAGE_KEYS.tours, tours);
  return newTour;
}

export async function updateTour(id: number, data: Partial<Tour>): Promise<Tour> {
  await delay();
  const tours = getTours();
  const idx = tours.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Тур не найден');
  tours[idx] = { ...tours[idx], ...data };
  setStorage(STORAGE_KEYS.tours, tours);
  return tours[idx];
}

export async function deleteTour(id: number): Promise<void> {
  await delay();
  const tours = getTours().filter((t) => t.id !== id);
  setStorage(STORAGE_KEYS.tours, tours);
}

export async function fetchBookings(): Promise<Booking[]> {
  await delay();
  return getBookings();
}

export async function fetchMyBookings(userId: number): Promise<Booking[]> {
  await delay();
  return getBookings().filter((b) => b.user.id === userId);
}

export async function createBooking(data: {
  tour: number;
  user: number;
  participants: number;
  start_date: string;
  bonus_used: number;
}): Promise<Booking> {
  await delay();
  const tours = getTours();
  const users = getUsers();
  const tour = tours.find((t) => t.id === data.tour);
  const user = users.find((u) => u.id === data.user);
  if (!tour || !user) throw new Error('Тур или пользователь не найден');

  const discountedPrice = tour.price * (1 - tour.discount / 100);
  const total = Math.round(discountedPrice * data.participants - data.bonus_used);
  const finalTotal = Math.max(total, 0);

  const bookings = getBookings();
  const newBooking: Booking = {
    id: Date.now(),
    tour,
    user,
    participants: data.participants,
    total_price: finalTotal,
    status: 'pending',
    start_date: data.start_date,
    bonus_used: data.bonus_used,
    created_at: new Date().toISOString(),
  };
  bookings.push(newBooking);
  setStorage(STORAGE_KEYS.bookings, bookings);

  if (data.bonus_used > 0) {
    user.bonus_points -= data.bonus_used;
    setStorage(STORAGE_KEYS.users, users);
  }

  return newBooking;
}

export async function payBooking(id: number): Promise<Booking> {
  await delay();
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('Бронь не найдена');
  bookings[idx].status = 'paid';
  setStorage(STORAGE_KEYS.bookings, bookings);

  const users = getUsers();
  const userIdx = users.findIndex((u) => u.id === bookings[idx].user.id);
  if (userIdx !== -1) {
    const earned = Math.round(bookings[idx].total_price * 0.01);
    users[userIdx].bonus_points += earned;
    setStorage(STORAGE_KEYS.users, users);

    const transactions = getTransactions();
    transactions.push({
      id: Date.now(),
      user: users[userIdx].id,
      amount: earned,
      reason: `Бонус за оплату брони #${bookings[idx].id}`,
      created_at: new Date().toISOString(),
    });
    setStorage(STORAGE_KEYS.transactions, transactions);
  }

  return bookings[idx];
}

export async function cancelBooking(id: number): Promise<Booking> {
  await delay();
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('Бронь не найдена');
  bookings[idx].status = 'cancelled';
  setStorage(STORAGE_KEYS.bookings, bookings);
  return bookings[idx];
}

export async function fetchWishlist(userId: number): Promise<WishlistItem[]> {
  await delay();
  return getWishlist().filter((w) => w.user === userId);
}

export async function addToWishlist(userId: number, tourId: number): Promise<WishlistItem> {
  await delay();
  const wishlist = getWishlist();
  if (wishlist.find((w) => w.user === userId && w.tour.id === tourId)) {
    throw new Error('Уже в избранном');
  }
  const tour = getTours().find((t) => t.id === tourId);
  if (!tour) throw new Error('Тур не найден');
  const item: WishlistItem = { id: Date.now(), user: userId, tour };
  wishlist.push(item);
  setStorage(STORAGE_KEYS.wishlist, wishlist);
  return item;
}

export async function removeFromWishlist(userId: number, tourId: number): Promise<void> {
  await delay();
  const wishlist = getWishlist().filter((w) => !(w.user === userId && w.tour.id === tourId));
  setStorage(STORAGE_KEYS.wishlist, wishlist);
}

export async function updateProfile(userId: number, data: Partial<User>): Promise<User> {
  await delay();
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('Пользователь не найден');
  users[idx] = { ...users[idx], ...data };
  setStorage(STORAGE_KEYS.users, users);
  setStorage(STORAGE_KEYS.currentUser, users[idx]);
  return users[idx];
}

export async function fetchUsers(): Promise<User[]> {
  await delay();
  return getUsers();
}

export async function updateUserRole(userId: number, role: UserRole): Promise<User> {
  await delay();
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('Пользователь не найден');
  users[idx].role = role;
  setStorage(STORAGE_KEYS.users, users);
  return users[idx];
}

export async function fetchTransactions(userId: number): Promise<BonusTransaction[]> {
  await delay();
  return getTransactions().filter((t) => t.user === userId);
}

export async function createPostcard(data: { user: number; tour: number; image_url: string; message: string }): Promise<Postcard> {
  await delay();
  const postcards = getPostcards();
  const tour = getTours().find((t) => t.id === data.tour);
  if (!tour) throw new Error('Тур не найден');
  const postcard: Postcard = {
    id: Date.now(),
    user: data.user,
    tour,
    image_url: data.image_url,
    message: data.message,
    created_at: new Date().toISOString(),
  };
  postcards.push(postcard);
  setStorage(STORAGE_KEYS.postcards, postcards);
  return postcard;
}

export async function fetchPostcards(userId: number): Promise<Postcard[]> {
  await delay();
  return getPostcards().filter((p) => p.user === userId);
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay();
  const bookings = getBookings();
  const users = getUsers();
  const tours = getTours();
  const revenue = bookings.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.total_price, 0);

  const statusCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });

  const monthMap: Record<string, number> = {};
  bookings
    .filter((b) => b.status === 'paid')
    .forEach((b) => {
      const month = b.created_at.slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + b.total_price;
    });

  return {
    total_users: users.length,
    total_tours: tours.length,
    total_bookings: bookings.length,
    total_revenue: revenue,
    bookings_by_status: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    revenue_by_month: Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue })),
  };
}

export async function assistantRecommend(preferences: string): Promise<Tour[]> {
  await delay(800);
  const tours = getTours();
  const pref = preferences.toLowerCase();
  let scored = tours.map((t) => {
    let score = 0;
    if (pref.includes('пляж') || pref.includes('море') || pref.includes('солнце')) {
      if (t.category.slug === 'beach' || t.category.slug === 'cruise') score += 3;
      if (t.country.name === 'Мальдивы' || t.country.name === 'Таиланд') score += 2;
    }
    if (pref.includes('горы') || pref.includes('лыжи') || pref.includes('снег')) {
      if (t.category.slug === 'ski') score += 3;
    }
    if (pref.includes('экскурс') || pref.includes('истор') || pref.includes('культур')) {
      if (t.category.slug === 'excursion') score += 3;
    }
    if (pref.includes('сафари') || pref.includes('дикая') || pref.includes('животн')) {
      if (t.category.slug === 'safari') score += 3;
    }
    if (pref.includes('дешев') || pref.includes('эконом') || pref.includes('бюджет')) {
      if (t.price < 80000) score += 2;
    }
    if (pref.includes('люкс') || pref.includes('дорог') || pref.includes('роскош')) {
      if (t.price > 120000) score += 2;
    }
    if (pref.includes(t.country.name.toLowerCase())) score += 3;
    return { tour: t, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((s) => s.tour);
}

export { countries, categories };
