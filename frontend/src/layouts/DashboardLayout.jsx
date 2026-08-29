import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiUsers, FiFileText, FiDollarSign, FiPhoneCall, FiFilePlus, FiTruck,
  FiFolder, FiBell, FiSettings, FiMenu, FiLogOut, FiUser, FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ADMIN_LINKS = [
  { to: '/', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/customers', label: 'Customers', icon: FiUsers },
  { to: '/employees', label: 'Employees', icon: FiUser },
  { to: '/daily-work', label: 'Daily Work', icon: FiFileText },
  { to: '/payments', label: 'Payments', icon: FiDollarSign },
  { to: '/follow-ups', label: 'Follow-ups', icon: FiPhoneCall },
  { to: '/quotations', label: 'Quotations', icon: FiFilePlus },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: FiTruck },
  { to: '/documents', label: 'Documents', icon: FiFolder },
  { to: '/notifications', label: 'Notifications', icon: FiBell },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

const EMPLOYEE_LINKS = [
  { to: '/', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/daily-work', label: 'Daily Work', icon: FiFileText },
  { to: '/payments', label: 'Pending Payments', icon: FiDollarSign },
  { to: '/customers', label: 'Customer List', icon: FiUsers },
  { to: '/notifications', label: 'Notifications', icon: FiBell },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(true); // Collapsed by default on mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = isAdmin ? ADMIN_LINKS : EMPLOYEE_LINKS;
  const location = useLocation();

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-muted dashboard-shell overflow-x-hidden">
      {/* Sidebar - Hidden on mobile, collapsed on desktop by default */}
      <aside
        className={`sidebar border-r border-white/10 flex flex-col transition-all duration-300 fixed lg:relative lg:translate-x-0 h-screen lg:h-auto z-40 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed && !mobileOpen ? 'lg:w-[72px]' : 'w-64'}`}
      >
        <div className="h-16 lg:h-20 flex items-center gap-3 px-4 border-b border-primary/10">
          <div className="h-10 w-10 rounded-xl bg-white shadow-soft flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="NTS" className="h-8 w-8 object-contain" />
          </div>
          <span className={`font-semibold text-white truncate tracking-tight transition-opacity ${collapsed && !mobileOpen ? 'hidden lg:block lg:opacity-0' : 'block'}`}>Nutan Tech Solutions</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link group relative flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-all ${
                  isActive ? 'bg-white text-primary shadow-soft' : 'text-white hover:bg-white/15 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className={`truncate transition-opacity ${collapsed && !mobileOpen ? 'hidden lg:block lg:opacity-0' : 'block'}`}>{label}</span>
              {(mobileOpen || !collapsed) && <FiChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="h-12 lg:h-14 border-t border-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors hidden lg:flex"
        >
          <FiMenu />
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky header */}
        <header className="h-16 lg:h-20 bg-white/90 backdrop-blur border-b border-primary/10 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden h-9 w-9 rounded-lg text-gray-600 hover:bg-gray-100 flex items-center justify-center"
            title="Toggle menu"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex-1 lg:flex-none">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary hidden sm:block">{isAdmin ? 'Admin' : 'Employee'} Panel</p>
            <p className="text-sm lg:text-base font-semibold text-secondary">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs lg:text-sm font-medium text-navy">{user?.name}</p>
              <p className="text-xs text-gray-400 hidden md:block">{user?.designation || user?.role}</p>
            </div>
            <img
              src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=075DF5&color=fff`}
              alt="avatar"
              className="h-8 w-8 lg:h-9 lg:w-9 rounded-full object-cover"
            />
            <button onClick={logout} title="Logout" className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center">
              <FiLogOut size={18} />
            </button>
          </div>
        </header>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 lg:hidden z-30"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
