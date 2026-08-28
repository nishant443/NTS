import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const FollowUps = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['follow-ups'],
    queryFn: () => api.get('/follow-ups', { params: { limit: 20 } }).then((r) => r.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-secondary">Follow-ups</h1>
        <p className="text-sm text-gray-400">Payment follow-up history and reminders</p>
      </div>
      <div className="card p-0 overflow-hidden">
        <DataTable
          loading={isLoading}
          rows={data?.followUps || []}
          columns={[
            { key: 'customer', label: 'Company', render: (r) => r.customer?.companyName },
            { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString('en-IN') },
            { key: 'personContacted', label: 'Contacted' },
            { key: 'discussion', label: 'Discussion' },
            { key: 'nextFollowUpDate', label: 'Next Follow-up', render: (r) => (r.nextFollowUpDate ? new Date(r.nextFollowUpDate).toLocaleDateString('en-IN') : '—') },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </div>
    </div>
  );
};

export default FollowUps;
