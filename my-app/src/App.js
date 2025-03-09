import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ProfileScreen from './ProfileScreen';
import MapScreen from './MapScreen';
import DormsManagement from './DormsManagement';
import FavoritesScreen from './FavoritesScreen';
import './styles/Navbar.css';
import './App.css';

function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <nav className="navbar">
      {!isLoggedIn && (
        <>
          <Link to="/login" className="navbar-link">Login</Link>
          <Link to="/register" className="navbar-link">Register</Link>
        </>
      )}

      {isLoggedIn && (
        <>
          <Link to="/map" className="navbar-link">Map</Link>
          <Link to="/favorites" className="navbar-link">Favorites</Link>
          <Link to="/profile" className="navbar-link">Profile</Link>
          {user?.name === 'admin' && (
            <Link to="/manage-dorms" className="navbar-link">Manage Dorms</Link>
          )}
          <button onClick={logout} className="navbar-button">Logout</button>
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
        <div className="App">
          <Routes>
            <Route path="/" element={<h1>Welcome to Dorm Finder App</h1>} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/map" element={<ProtectedRoute><MapScreen /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
            <Route path="/manage-dorms" element={<AdminRoute><DormsManagement /></AdminRoute>} />
            <Route path="/favorites" element={<FavoritesScreen />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
