import React from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiMail, FiShield, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Account center</p>
        <h1 className="text-2xl font-bold text-secondary">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your identity and workspace access</p>
      </div>
      <motion.div whileHover={{ scale: 1.01 }} className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary-dark via-primary to-primary-light p-6 text-white shadow-soft">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
        <div className="relative flex items-center gap-5">
        <img
          src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=075DF5&color=fff&size=160`}
          alt="avatar"
          className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/25"
        />
        <div>
          <p className="text-xl font-bold">{user?.name}</p>
          <p className="text-sm text-white/75 mt-1">{user?.designation || 'Team member'}</p>
          <span className="inline-flex items-center gap-1 mt-3 rounded-full bg-white/15 px-3 py-1 text-xs"><FiShield /> {user?.role}</span>
        </div>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-accent text-primary flex items-center justify-center"><FiMail /></div>
          <div><p className="text-xs text-gray-400">Email address</p><p className="text-sm font-medium text-secondary break-all">{user?.email}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-accent text-primary flex items-center justify-center"><FiBriefcase /></div>
          <div><p className="text-xs text-gray-400">Department</p><p className="text-sm font-medium text-secondary">{user?.department || 'Not assigned'}</p></div>
        </div>
      </div>
      <div className="card flex items-center gap-3 bg-accent/60">
        <FiUser className="text-primary" />
        <p className="text-sm text-gray-600">Your account is active and managed by the NTS administration team.</p>
      </div>
    </div>
  );
};

export default Profile;
