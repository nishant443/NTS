import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiFile, FiDownload } from 'react-icons/fi';
import api from '../api/axios';

const Documents = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents').then((r) => r.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-secondary">Documents</h1>
        <p className="text-sm text-gray-400">Customer-related files: GST, PAN, invoices, receipts, AMC, etc.</p>
      </div>
      <div className="card">
        {isLoading && <p className="text-gray-400 text-sm">Loading...</p>}
        {!isLoading && (data?.documents || []).length === 0 && (
          <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
        )}
        <ul className="divide-y divide-gray-50">
          {(data?.documents || []).map((doc) => (
            <li key={doc._id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiFile className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-secondary">{doc.name || doc.category}</p>
                  <p className="text-xs text-gray-400">{doc.category}</p>
                </div>
              </div>
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-primary">
                <FiDownload />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Documents;
