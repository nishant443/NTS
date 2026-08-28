import React from 'react';

const STYLES = {
  Paid: 'bg-green-100 text-green-700',
  Completed: 'bg-green-100 text-green-700',
  Active: 'bg-green-100 text-green-700',
  Partial: 'bg-yellow-100 text-yellow-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Lead: 'bg-blue-100 text-blue-700',
  Open: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
  Inactive: 'bg-red-100 text-red-700',
  Closed: 'bg-gray-100 text-gray-600',
};

const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
    {status}
  </span>
);

export default StatusBadge;
