import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    whileHover={{ y: -3, scale: 1.01 }}
    className="card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-5"
  >
    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-accent text-primary flex items-center justify-center text-lg sm:text-xl shrink-0">
      {Icon && <Icon />}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
      {loading ? (
        <div className="skeleton h-5 sm:h-6 w-20 mt-1" />
      ) : (
        <p className="text-lg sm:text-xl font-semibold text-secondary truncate">{value}</p>
      )}
    </div>
  </motion.div>
);

export default StatCard;
