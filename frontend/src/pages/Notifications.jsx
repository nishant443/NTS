import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiBell } from 'react-icons/fi';
import api from '../api/axios';

const Notifications = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-secondary">Notifications</h1>
          <p className="text-sm text-gray-400">{data?.unreadCount ?? 0} unread</p>
        </div>
        <button onClick={() => markAllRead.mutate()} className="btn-secondary">Mark all as read</button>
      </div>
      <div className="card divide-y divide-gray-50">
        {isLoading && <p className="text-gray-400 text-sm">Loading...</p>}
        {!isLoading && (data?.notifications || []).length === 0 && (
          <p className="text-gray-400 text-sm py-4">You're all caught up!</p>
        )}
        {(data?.notifications || []).map((n) => (
          <div key={n._id} className={`py-3 flex items-start gap-3 ${!n.isRead ? 'bg-accent/40' : ''}`}>
            <FiBell className="text-primary mt-1 shrink-0" />
            <div>
              <p className="text-sm font-medium text-secondary">{n.title}</p>
              <p className="text-xs text-gray-500">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
