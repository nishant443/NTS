import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiPlus, FiSearch, FiDownload } from 'react-icons/fi';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => api.get('/customers', { params: { search, page, limit: 10 } }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/customers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setModalOpen(false);
      reset();
    },
  });

  const exportCSV = () => {
    const rows = data?.customers || [];
    const header = ['Company Name', 'Contact Person', 'Email', 'Phone', 'City', 'Status'];
    const csv = [header.join(',')]
      .concat(rows.map((c) => [c.companyName, c.contactPerson, c.email, c.phone, c.city, c.status].map((v) => `"${v || ''}"`).join(',')))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-secondary">Customers</h1>
          <p className="text-sm text-gray-400">{data?.total ?? 0} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9 w-56"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <FiDownload /> Export
          </button>
          {isAdmin && (
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
              <FiPlus /> Add Customer
            </button>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable
          loading={isLoading}
          rows={data?.customers || []}
          columns={[
            { key: 'companyName', label: 'Company' },
            { key: 'contactPerson', label: 'Contact Person' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'city', label: 'City' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">
          Previous
        </button>
        <span className="px-3 py-2 text-sm text-gray-500">Page {page}</span>
        <button
          disabled={(data?.customers || []).length < 10}
          onClick={() => setPage((p) => p + 1)}
          className="btn-secondary disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Customer"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit((d) => createMutation.mutate(d))} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save Customer'}
            </button>
          </>
        }
      >
        <form className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Company Name *</label>
            <input className="input-field" {...register('companyName', { required: true })} />
          </div>
          <div>
            <label className="label">Contact Person</label>
            <input className="input-field" {...register('contactPerson')} />
          </div>
          <div>
            <label className="label">Designation</label>
            <input className="input-field" {...register('designation')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-field" {...register('email')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input-field" {...register('phone')} />
          </div>
          <div>
            <label className="label">GST Number</label>
            <input className="input-field" {...register('gstNumber')} />
          </div>
          <div>
            <label className="label">PAN Number</label>
            <input className="input-field" {...register('panNumber')} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input-field" {...register('city')} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input-field" {...register('state')} />
          </div>
          <div>
            <label className="label">Industry</label>
            <input className="input-field" {...register('industry')} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" {...register('status')}>
              <option>Lead</option>
              <option>Customer</option>
              <option>Vendor</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Remarks</label>
            <textarea className="input-field" rows={2} {...register('remarks')} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
