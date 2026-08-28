import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiCheckCircle, FiClock, FiEdit2, FiPlus } from 'react-icons/fi';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Payments = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const { register, handleSubmit, reset, watch } = useForm();
  const invoiceAmount = Number(watch('invoiceAmount') || 0);
  const amountReceived = Number(watch('amountReceived') || 0);

  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments', { params: { limit: 20, ...(isAdmin ? {} : { status: 'Pending' }) } }).then((r) => r.data),
  });
  const { data: customerData } = useQuery({
    queryKey: ['payment-customers'],
    queryFn: () => api.get('/customers', { params: { limit: 1000 } }).then((r) => r.data),
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? api.put(`/payments/${id}`, payload) : api.post('/payments', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      closeModal();
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingPayment(null);
    reset();
  };

  const openCreate = () => {
    setEditingPayment(null);
    reset({ invoiceDate: new Date().toISOString().slice(0, 10), amountReceived: 0, mode: 'NEFT' });
    setModalOpen(true);
  };

  const openEdit = (payment, completed = false) => {
    setEditingPayment(payment);
    reset({
      customer: payment.customer?._id,
      invoiceNumber: payment.invoiceNumber,
      invoiceAmount: payment.invoiceAmount,
      amountReceived: completed ? payment.invoiceAmount : payment.amountReceived,
      invoiceDate: payment.invoiceDate?.slice(0, 10),
      paymentDueDate: payment.paymentDueDate?.slice(0, 10),
      mode: payment.mode || 'NEFT',
    });
    setModalOpen(true);
  };

  const submitPayment = (formData) => {
    saveMutation.mutate({
      id: editingPayment?._id,
      payload: { ...formData, invoiceAmount: Number(formData.invoiceAmount), amountReceived: Number(formData.amountReceived || 0) },
    });
  };

  // Employees only ever receive the limited field set from the backend (enforced server-side),
  // so the same table safely renders fewer columns for them automatically.
  const columns = [
    { key: 'customer', label: 'Company', render: (r) => r.customer?.companyName },
    { key: 'invoiceNumber', label: 'Invoice #' },
    ...(isAdmin ? [{ key: 'invoiceAmount', label: 'Invoice Amount', render: (r) => `₹${(r.invoiceAmount || 0).toLocaleString('en-IN')}` }] : []),
    { key: 'balanceAmount', label: 'Balance', render: (r) => `₹${(r.balanceAmount || 0).toLocaleString('en-IN')}` },
    { key: 'paymentDueDate', label: 'Due Date', render: (r) => (r.paymentDueDate ? new Date(r.paymentDueDate).toLocaleDateString('en-IN') : '—') },
    { key: 'paymentStatus', label: 'Status', render: (r) => <StatusBadge status={r.paymentStatus} /> },
    ...(isAdmin ? [{
      key: 'actions',
      label: 'Actions',
      render: (r) => r.paymentStatus === 'Paid' || r.paymentStatus === 'Cancelled' ? null : (
        <div className="flex items-center gap-2">
          <button title="Add partial payment" onClick={() => openEdit(r)} className="text-primary hover:text-primary-dark"><FiEdit2 /></button>
          <button title="Mark completed" onClick={() => openEdit(r, true)} className="text-green-600 hover:text-green-700"><FiCheckCircle /></button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-secondary">{isAdmin ? 'Payments' : 'Pending Payments'}</h1>
          {isAdmin && <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus /> Add Pending Payment</button>}
        </div>
        <p className="text-sm text-gray-400">
          {isAdmin ? 'Full payment history across all customers' : 'Balance and due dates for customer invoices'}
        </p>
      </div>
      <div className="card p-0 overflow-hidden">
        <DataTable loading={isLoading} rows={data?.payments || []} columns={columns} />
      </div>
      {isAdmin && (
        <Modal open={modalOpen} onClose={closeModal} title={editingPayment ? 'Update Payment' : 'Add Pending Payment'} footer={(
          <>
            <button className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit(submitPayment)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingPayment ? 'Save Payment' : 'Create Pending Payment'}
            </button>
          </>
        )}>
          <form className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Customer *</label>
              <select className="input-field" {...register('customer', { required: true })}>
                <option value="">Select customer</option>
                {(customerData?.customers || []).map((customer) => <option key={customer._id} value={customer._id}>{customer.companyName}</option>)}
              </select>
            </div>
            <div><label className="label">Invoice Number *</label><input className="input-field" {...register('invoiceNumber', { required: true })} /></div>
            <div><label className="label">Invoice Amount *</label><input type="number" min="0" className="input-field" {...register('invoiceAmount', { required: true, min: 0 })} /></div>
            <div><label className="label">Amount Received</label><input type="number" min="0" max={invoiceAmount} className="input-field" {...register('amountReceived', { min: 0, max: invoiceAmount })} /></div>
            <div className="flex items-end pb-2 text-sm text-gray-500"><span className="flex items-center gap-1"><FiClock /> Balance: ₹{Math.max(invoiceAmount - amountReceived, 0).toLocaleString('en-IN')}</span></div>
            <div><label className="label">Invoice Date</label><input type="date" className="input-field" {...register('invoiceDate')} /></div>
            <div><label className="label">Due Date</label><input type="date" className="input-field" {...register('paymentDueDate')} /></div>
            <div><label className="label">Payment Mode</label><select className="input-field" {...register('mode')}><option>NEFT</option><option>RTGS</option><option>Cheque</option><option>UPI</option><option>Cash</option></select></div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Payments;
