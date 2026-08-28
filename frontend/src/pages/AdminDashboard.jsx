import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  FiUsers, FiClock, FiCheckCircle, FiDollarSign, FiFileText, FiPhoneCall, FiUserCheck, FiFilePlus,
} from 'react-icons/fi';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const COLORS = ['#075DF5', '#4D8BFF', '#F5A623', '#666666'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/dashboard/admin').then((r) => r.data),
  });

  const cards = data?.cards || {};
  const revenueData = (data?.graphs?.monthlyRevenue || []).map((d) => ({
    name: `${MONTH_NAMES[d._id.month - 1]} '${String(d._id.year).slice(2)}`,
    revenue: d.revenue,
  }));
  const pendingVsPaid = (data?.graphs?.pendingVsPaid || []).map((d) => ({ name: d._id, value: d.count }));
  const employeeActivity = (data?.graphs?.employeeActivity || []).map((d) => ({
    name: d.employee.name,
    reports: d.reportCount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-secondary">Admin Dashboard</h1>
        <p className="text-sm text-gray-400">Overview of company performance</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="Total Customers" value={cards.totalCustomers ?? 0} loading={isLoading} />
        <StatCard icon={FiClock} label="Pending Payments" value={`₹${(cards.pendingPayments ?? 0).toLocaleString('en-IN')}`} loading={isLoading} />
        <StatCard icon={FiCheckCircle} label="Total Payments" value={`₹${(cards.receivedPayments ?? 0).toLocaleString('en-IN')}`} loading={isLoading} />
        <StatCard icon={FiDollarSign} label="Total Revenue" value={`₹${(cards.totalRevenue ?? 0).toLocaleString('en-IN')}`} loading={isLoading} />
        <StatCard icon={FiFileText} label="Today's Work Reports" value={cards.todaysWorkReports ?? 0} loading={isLoading} />
        <StatCard icon={FiPhoneCall} label="Pending Follow Ups" value={cards.pendingFollowUps ?? 0} loading={isLoading} />
        <StatCard icon={FiUserCheck} label="Active Employees" value={cards.activeEmployees ?? 0} loading={isLoading} />
        <StatCard icon={FiFilePlus} label="Pending Quotations" value={cards.pendingQuotations ?? 0} loading={isLoading} />
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-medium text-secondary mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#075DF5" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-medium text-secondary mb-4">Pending vs Paid Payments</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pendingVsPaid} dataKey="value" nameKey="name" outerRadius={90} label>
                {pendingVsPaid.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-medium text-secondary mb-4">Employee Activity (report count)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={employeeActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="reports" fill="#075DF5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latest activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-medium text-secondary mb-3">Recent Payments</h3>
          <ul className="space-y-3 text-sm">
            {(data?.latestActivity?.recentPayments || []).map((p) => (
              <li key={p._id} className="flex justify-between items-center">
                <span className="text-gray-500 truncate">{p.customer?.companyName}</span>
                <StatusBadge status={p.paymentStatus} />
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="font-medium text-secondary mb-3">Recent Work Logs</h3>
          <ul className="space-y-3 text-sm">
            {(data?.latestActivity?.recentWorkLogs || []).map((w) => (
              <li key={w._id} className="flex justify-between items-center">
                <span className="text-gray-500 truncate">{w.employee?.name} — {w.customer?.companyName || w.companyVisited}</span>
                <StatusBadge status={w.status} />
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="font-medium text-secondary mb-3">Recent Customers</h3>
          <ul className="space-y-3 text-sm">
            {(data?.latestActivity?.recentCustomers || []).map((c) => (
              <li key={c._id} className="flex justify-between items-center">
                <span className="text-gray-500 truncate">{c.companyName}</span>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
