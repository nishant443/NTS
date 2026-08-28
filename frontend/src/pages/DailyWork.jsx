import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiPlus, FiCheck, FiX, FiCalendar } from 'react-icons/fi';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const DailyWork = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId') || '';
  const range = searchParams.get('range') || 'all';

  const getDateRange = (selectedRange) => {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);
    end.setDate(end.getDate() + 1);
    if (selectedRange === 'week') {
      start.setDate(today.getDate() - today.getDay());
    } else if (selectedRange === 'lastWeek') {
      start.setDate(today.getDate() - today.getDay() - 7);
      end.setTime(start.getTime());
      end.setDate(start.getDate() + 7);
    } else if (selectedRange === 'month') {
      start.setDate(1);
    } else if (selectedRange === 'lastMonth') {
      start.setMonth(today.getMonth() - 1, 1);
      end.setMonth(today.getMonth(), 1);
    } else if (selectedRange === 'last3Months') {
      start.setMonth(today.getMonth() - 3, 1);
    } else {
      return {};
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const dateRange = getDateRange(range);
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['daily-work', employeeId, range],
    queryFn: () => api.get('/daily-work', { params: { limit: 20, ...(employeeId ? { employeeId } : {}), ...dateRange } }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/daily-work', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-work'] });
      setModalOpen(false);
      reset();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/daily-work/${id}/review`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-work'] }),
  });

  const columns = [
    { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString('en-IN') },
    ...(isAdmin ? [{ key: 'employee', label: 'Employee', render: (r) => r.employee?.name }] : []),
    { key: 'companyVisited', label: 'Company Visited' },
    { key: 'productsDiscussed', label: 'Machine', render: (r) => r.productsDiscussed || '-' },
    { key: 'workDescription', label: 'Work Done', render: (r) => <div className="whitespace-pre-line whitespace-normal min-w-[260px] max-w-[420px]">{r.workDescription || r.servicePerformed || '-'}</div> },
    { key: 'hoursWorked', label: 'Hours' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(isAdmin
      ? [{
          key: 'actions',
          label: 'Actions',
          render: (r) =>
            r.status === 'Pending' ? (
              <div className="flex gap-2">
                <button onClick={() => reviewMutation.mutate({ id: r._id, status: 'Completed' })} className="text-green-600" title="Approve">
                  <FiCheck />
                </button>
                <button onClick={() => reviewMutation.mutate({ id: r._id, status: 'Cancelled' })} className="text-red-500" title="Reject">
                  <FiX />
                </button>
              </div>
            ) : (
              <span className="text-gray-300">—</span>
            ),
        }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-secondary">Daily Work Reports</h1>
          <p className="text-sm text-gray-400">{isAdmin ? employeeId ? 'Filtered employee work reports' : 'All employee submissions' : 'Your submitted reports'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <label className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <select className="input-field pl-9 w-48" value={range} onChange={(event) => setSearchParams({ ...(employeeId ? { employeeId } : {}), range: event.target.value })}>
              <option value="all">All Work</option>
              <option value="week">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="month">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
            </select>
          </label>
          {isAdmin && employeeId && <button onClick={() => setSearchParams({ range })} className="btn-secondary">Show All Employees</button>}
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> New Report
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable loading={isLoading} rows={data?.works || []} columns={columns} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Daily Work Report"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit((d) => createMutation.mutate(d))} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </button>
          </>
        }
      >
        <form className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date *</label>
            <input type="date" className="input-field" {...register('date', { required: true })} />
          </div>
          <div>
            <label className="label">Company Visited</label>
            <input className="input-field" {...register('companyVisited')} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input-field" {...register('location')} />
          </div>
          <div>
            <label className="label">Purpose of Visit</label>
            <input className="input-field" {...register('purposeOfVisit')} />
          </div>
          <div>
            <label className="label">Start Time</label>
            <input type="time" className="input-field" {...register('startTime')} />
          </div>
          <div>
            <label className="label">End Time</label>
            <input type="time" className="input-field" {...register('endTime')} />
          </div>
          <div>
            <label className="label">Hours Worked</label>
            <input type="number" step="0.5" className="input-field" {...register('hoursWorked')} />
          </div>
          <div>
            <label className="label">Travel Distance (km)</label>
            <input type="number" className="input-field" {...register('travelDistance')} />
          </div>
          <div>
            <label className="label">Expense (₹)</label>
            <input type="number" className="input-field" {...register('expense')} />
          </div>
          <div className="col-span-2">
            <label className="label">Work Description</label>
            <textarea className="input-field" rows={3} {...register('workDescription')} />
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

export default DailyWork;
