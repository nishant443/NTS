import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Customers from './pages/Customers';
import DailyWork from './pages/DailyWork';
import Payments from './pages/Payments';
import FollowUps from './pages/FollowUps';
import Quotations from './pages/Quotations';
import PurchaseOrders from './pages/PurchaseOrders';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import NotFound from './pages/NotFound';

// Renders the right dashboard based on role
const HomeDashboard = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <EmployeeDashboard />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeDashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="daily-work" element={<DailyWork />} />
        <Route path="payments" element={<Payments />} />
        <Route path="follow-ups" element={<ProtectedRoute allowedRoles={['admin']}><FollowUps /></ProtectedRoute>} />
        <Route path="quotations" element={<ProtectedRoute allowedRoles={['admin']}><Quotations /></ProtectedRoute>} />
        <Route path="purchase-orders" element={<ProtectedRoute allowedRoles={['admin']}><PurchaseOrders /></ProtectedRoute>} />
        <Route path="documents" element={<Documents />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
        <Route path="employees" element={<ProtectedRoute allowedRoles={['admin']}><Employees /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
