import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiEdit2, FiEye, FiMail, FiPhone, FiPlus, FiSearch, FiTrash2, FiUserCheck } from 'react-icons/fi';
import api from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  name: '', email: '', password: '', phone: '', designation: '', department: '', joiningDate: '', salary: '', role: 'employee', isActive: true,
};

const Employees = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('employee');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, role],
    queryFn: () => api.get('/users', { params: { search, role, limit: 100 } }).then((response) => response.data),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? api.put(`/users/${id}`, payload) : api.post('/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeleteUser(null);
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    reset(emptyForm);
  };

  const openCreate = () => {
    setEditingUser(null);
    reset(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    reset({
      ...emptyForm,
      ...user,
      joiningDate: user.joiningDate ? user.joiningDate.slice(0, 10) : '',
      password: '',
    });
    setModalOpen(true);
  };

  const submit = (formData) => {
    const payload = { ...formData, salary: formData.salary ? Number(formData.salary) : undefined };
    if (editingUser && !payload.password) delete payload.password;
    saveMutation.mutate({ id: editingUser?._id, payload });
  };

  const columns = [
    { key: 'name', label: 'Employee', render: (user) => <div><p className="font-semibold text-secondary">{user.name}</p><p className="text-xs text-gray-400">{user.designation || 'Team member'}</p></div> },
    { key: 'email', label: 'Contact', render: (user) => <div className="space-y-1"><p className="flex items-center gap-2"><FiMail className="text-primary" />{user.email}</p>{user.phone && <p className="flex items-center gap-2 text-xs text-gray-500"><FiPhone />{user.phone}</p>}</div> },
    { key: 'department', label: 'Department', render: (user) => user.department || '-' },
    { key: 'joiningDate', label: 'Joining Date', render: (user) => user.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN') : '-' },
    { key: 'isActive', label: 'Status', render: (user) => <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} /> },
    { key: 'actions', label: 'Actions', render: (user) => <div className="flex items-center gap-3"><button title="View employee work" className="text-primary hover:text-primary-dark" onClick={() => navigate(`/daily-work?employeeId=${user._id}`)}><FiEye /></button><button title="Edit employee" className="text-primary hover:text-primary-dark" onClick={() => openEdit(user)}><FiEdit2 /></button><button title={user.isActive ? 'Deactivate employee' : 'Activate employee'} className={user.isActive ? 'text-amber-600' : 'text-green-600'} onClick={() => saveMutation.mutate({ id: user._id, payload: { isActive: !user.isActive } })}><FiUserCheck /></button><button title="Delete employee" className="text-red-500 hover:text-red-700" onClick={() => setDeleteUser(user)}><FiTrash2 /></button></div> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">People & access</p><h1 className="text-2xl font-bold text-secondary">Employee Management</h1><p className="text-sm text-gray-500 mt-1">Create, update, and control employee access</p></div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus /> Add Employee</button>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input-field pl-9" placeholder="Search by name or email..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <select className="input-field w-auto min-w-[150px]" value={role} onChange={(event) => setRole(event.target.value)}><option value="employee">Employees</option><option value="admin">Admins</option><option value="">All users</option></select>
        <span className="text-sm text-gray-500">{data?.total ?? 0} records</span>
      </div>

      <div className="card p-0 overflow-hidden"><DataTable loading={isLoading} rows={data?.users || []} columns={columns} emptyMessage="No employees found" /></div>

      <Modal open={modalOpen} onClose={closeModal} title={editingUser ? 'Edit Employee' : 'Add Employee'} footer={<><button className="btn-secondary" onClick={closeModal}>Cancel</button><button className="btn-primary" onClick={handleSubmit(submit)} disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save Employee'}</button></>}>
        <form className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Full Name *</label><input className="input-field" {...register('name', { required: 'Name is required' })} />{errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}</div>
          <div><label className="label">Email *</label><input type="email" className="input-field" {...register('email', { required: 'Email is required' })} />{errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}</div>
          <div><label className="label">Password {editingUser ? '(leave blank to keep)' : '*'}</label><input type="password" className="input-field" {...register('password', { required: !editingUser ? 'Password is required' : false, minLength: { value: 6, message: 'Use at least 6 characters' } })} />{errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}</div>
          <div><label className="label">Phone</label><input className="input-field" {...register('phone')} /></div>
          <div><label className="label">Designation</label><input className="input-field" {...register('designation')} /></div>
          <div><label className="label">Department</label><input className="input-field" {...register('department')} /></div>
          <div><label className="label">Joining Date</label><input type="date" className="input-field" {...register('joiningDate')} /></div>
          <div><label className="label">Salary</label><input type="number" min="0" className="input-field" {...register('salary')} /></div>
          <div><label className="label">Role</label><select className="input-field" {...register('role')}><option value="employee">Employee</option><option value="admin">Admin</option></select></div>
          <label className="flex items-center gap-2 text-sm text-gray-600 mt-7"><input type="checkbox" {...register('isActive')} /> Active account</label>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteUser)} onClose={() => setDeleteUser(null)} onConfirm={() => deleteMutation.mutate(deleteUser._id)} title="Delete employee?" message={`Remove ${deleteUser?.name} permanently? This action cannot be undone.`} />
    </div>
  );
};

export default Employees;
