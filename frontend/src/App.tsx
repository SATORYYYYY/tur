import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ToursList from './pages/ToursList';
import TourDetail from './pages/TourDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Assistant from './pages/Assistant';
import PostcardDesigner from './pages/PostcardDesigner';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tours" element={<ToursList />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/postcards" element={<PostcardDesigner />} />
            <Route
              path="/profile/*"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
