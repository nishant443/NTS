import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const Quotations = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => api.get('/quotations').then((r) => r.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-secondary">Quotations</h1>
        <p className="text-sm text-gray-400">Create, send, and convert quotations into invoices</p>
      </div>
      <div className="card p-0 overflow-hidden">
        <DataTable
          loading={isLoading}
          rows={data?.quotations || []}
          columns={[
            { key: 'quotationNumber', label: 'Quotation #' },
            { key: 'customer', label: 'Customer', render: (r) => r.customer?.companyName },
            { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString('en-IN') },
            { key: 'totalAmount', label: 'Amount', render: (r) => `₹${(r.totalAmount || 0).toLocaleString('en-IN')}` },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </div>
    </div>
  );
};

export default Quotations;
