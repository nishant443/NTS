import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiFileText, FiPhoneCall, FiClock, FiUsers } from 'react-icons/fi';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const EmployeeDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: () => api.get('/dashboard/employee').then((r) => r.data),
  });

  const cards = data?.cards || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-secondary">My Dashboard</h1>
        <p className="text-sm text-gray-400">Here's what's happening today</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FiFileText} label="Today's Work" value={cards.todaysWork ?? 0} loading={isLoading} />
        <StatCard icon={FiPhoneCall} label="Pending Follow Ups" value={cards.pendingFollowUps ?? 0} loading={isLoading} />
        <StatCard icon={FiClock} label="Pending Payments" value={cards.pendingPayments ?? 0} loading={isLoading} />
        <StatCard icon={FiUsers} label="Assigned Customers" value={cards.assignedCustomers ?? 0} loading={isLoading} />
      </div>

      <div className="card">
        <h3 className="font-medium text-secondary mb-3">My Recent Activity</h3>
        <ul className="space-y-3 text-sm">
          {(data?.latestActivities || []).map((w) => (
            <li key={w._id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
              <span className="text-gray-600">{w.workDescription || w.purposeOfVisit || 'Work report'}</span>
              <StatusBadge status={w.status} />
            </li>
          ))}
          {(!data?.latestActivities || data.latestActivities.length === 0) && !isLoading && (
            <p className="text-gray-400 text-sm">No activity yet. Submit your first daily work report!</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
