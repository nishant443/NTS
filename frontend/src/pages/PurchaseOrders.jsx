import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const PurchaseOrders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => api.get('/purchase-orders').then((r) => r.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-secondary">Purchase Orders</h1>
        <p className="text-sm text-gray-400">Track supplier purchase orders</p>
      </div>
      <div className="card p-0 overflow-hidden">
        <DataTable
          loading={isLoading}
          rows={data?.pos || []}
          columns={[
            { key: 'poNumber', label: 'PO #' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'poDate', label: 'PO Date', render: (r) => new Date(r.poDate).toLocaleDateString('en-IN') },
            { key: 'totalAmount', label: 'Amount', render: (r) => `₹${(r.totalAmount || 0).toLocaleString('en-IN')}` },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </div>
    </div>
  );
};

export default PurchaseOrders;
