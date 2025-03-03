import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ProfileScreen from './ProfileScreen';
import MapScreen from './MapScreen';
import DormsManagement from './DormsManagement';
import FavoritesScreen from './FavoritesScreen'; // ייבוא הקומפוננטה למועדפים

function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <nav style={{ display: 'flex', justifyContent: 'center', padding: '10px', backgroundColor: '#007bff', color: '#fff' }}>
      {!isLoggedIn && (
        <>
          <Link to="/login" style={{ margin: '0 15px', textDecoration: 'none', color: '#fff' }}>
            Login
          </Link>
          <Link to="/register" style={{ margin: '0 15px', textDecoration: 'none', color: '#fff' }}>
            Register
          </Link>
        </>
      )}

      {isLoggedIn && (
        <>
          <Link to="/map" style={{ margin: '0 15px', textDecoration: 'none', color: '#fff' }}>
            Map
          </Link>
          <Link to="/favorites" style={{ margin: '0 15px', textDecoration: 'none', color: '#fff' }}>
            Favorites
          </Link>
          <Link to="/profile" style={{ margin: '0 15px', textDecoration: 'none', color: '#fff' }}>
            Profile
          </Link>
          {user?.name === 'admin' && (
            <Link to="/manage-dorms" style={{ margin: '0 15px', textDecoration: 'none', color: '#fff' }}>
              Manage Dorms
            </Link>
          )}
          <button
            onClick={logout}
            style={{
              margin: '0 15px',
              backgroundColor: 'red',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.name === 'admin' ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<h1 style={{ textAlign: 'center', marginTop: '50px' }}>Welcome to Dorm Finder App</h1>} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/map" element={<ProtectedRoute><MapScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/manage-dorms" element={<AdminRoute><DormsManagement /></AdminRoute>} />
          <Route path="/favorites" element={<FavoritesScreen />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
