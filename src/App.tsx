import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleRoute from './components/RoleRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import AdminPanel from './pages/AdminPanel';
import BarberDashboard from './pages/BarberDashboard';
import './App.css';

/**
 * Root Application Component.
 * - Wraps the component tree with AuthProvider to manage login state globally.
 * - Declares the routing paths:
 *   - /login: Public Sign In
 *   - /register: Public Sign Up
 *   - /dashboard: Protected dashboard (Client's appointments) - client only
 *   - /booking: Protected new booking wizard - client only
 *   - /admin-panel: Protected admin workspace - admin only
 *   - /barber-dashboard: Protected provider agenda - provider only
 *   - Any other route: Redirects to /dashboard (which redirects role-appropriately)
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes by Role */}
          <Route
            path="/dashboard"
            element={
              <RoleRoute allowedRoles={['client']}>
                <Dashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <RoleRoute allowedRoles={['client']}>
                <Booking />
              </RoleRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminPanel />
              </RoleRoute>
            }
          />
          <Route
            path="/barber-dashboard"
            element={
              <RoleRoute allowedRoles={['provider']}>
                <BarberDashboard />
              </RoleRoute>
            }
          />

          {/* Wildcard Fallback redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
