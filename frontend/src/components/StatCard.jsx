import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    whileHover={{ y: -3, scale: 1.01 }}
    className="card flex items-center gap-4"
  >
    <div className="h-11 w-11 rounded-xl bg-accent text-primary flex items-center justify-center text-xl shrink-0">
      {Icon && <Icon />}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 truncate">{label}</p>
      {loading ? (
        <div className="skeleton h-6 w-16 mt-1" />
      ) : (
        <p className="text-xl font-semibold text-secondary truncate">{value}</p>
      )}
    </div>
  </motion.div>
);

export default StatCard;
