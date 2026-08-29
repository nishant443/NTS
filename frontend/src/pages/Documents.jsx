import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiFile, FiDownload, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import api from '../api/axios';
import Modal from '../components/Modal';

const DOCUMENT_CATEGORIES = [
  'GST Certificate', 'PAN', 'Purchase Order', 'Invoice', 'Payment Receipt', 'Warranty', 'AMC', 'Service Report', 'Other'
];

const Documents = () => {
  const queryClient = useQueryClient();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({ customer: '', category: 'Other', name: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Fetch documents
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents').then((r) => r.data),
  });

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then((r) => r.data),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formDataObj) => {
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('customer', formDataObj.customer);
      uploadData.append('category', formDataObj.category);
      uploadData.append('name', formDataObj.name || selectedFile.name);

      return api.post('/documents', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      setUploadModalOpen(false);
      setFormData({ customer: '', category: 'Other', name: '' });
      setSelectedFile(null);
      setUploadProgress(0);
      setUploading(false);
    },
    onError: (error) => {
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
      setUploading(false);
      setUploadProgress(0);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['documents']),
    onError: (error) => alert('Delete failed: ' + (error.response?.data?.message || error.message)),
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !formData.customer) {
      alert('Please select a file and customer');
      return;
    }
    setUploading(true);
    uploadMutation.mutate(formData);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, name: file.name.split('.')[0] }));
    }
  };

  const documents = data?.documents || [];
  const customers = customersData?.customers || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-secondary">Documents</h1>
          <p className="text-xs sm:text-sm text-gray-400">Customer-related files: GST, PAN, invoices, receipts, AMC, etc.</p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <FiUpload size={18} />
          Upload Document
        </button>
      </div>

      {/* Upload Modal */}
      <Modal
        open={uploadModalOpen}
        onClose={() => !uploading && setUploadModalOpen(false)}
        title="Upload Document"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setUploadModalOpen(false)}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !formData.customer}
              className="btn-primary"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        }
      >
        <form className="space-y-4">
          {/* Customer Select */}
          <div>
            <label className="label">Select Customer *</label>
            <select
              value={formData.customer}
              onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
              disabled={uploading}
              className="input-field"
              required
            >
              <option value="">Choose a customer...</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <label className="label">Document Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              disabled={uploading}
              className="input-field"
            >
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Document Name */}
          <div>
            <label className="label">Document Name (optional)</label>
            <input
              type="text"
              placeholder="e.g., Invoice for Feb 2024"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={uploading}
              className="input-field"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="label">Choose File *</label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="file-input"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
              />
              <label
                htmlFor="file-input"
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/60 hover:bg-accent/50 transition-all"
              >
                <FiUpload size={20} className="text-primary" />
                <div className="text-center">
                  <p className="text-sm font-medium text-secondary">
                    {selectedFile ? selectedFile.name : 'Click or drag file here'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max 50MB • PDF, Word, Excel, Images</p>
                </div>
              </label>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-secondary">Uploading...</p>
                <span className="text-sm font-semibold text-primary">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ boxShadow: '0 0 10px rgba(7, 93, 245, 0.5)' }}
                />
              </div>
            </motion.div>
          )}
        </form>
      </Modal>

      {/* Documents List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="text-center py-8">
            <div className="skeleton h-10 w-full mb-2" />
            <div className="skeleton h-10 w-full" />
          </div>
        )}

        {!isLoading && documents.length === 0 && (
          <div className="card text-center py-8">
            <FiFile size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
            <p className="text-xs text-gray-300 mt-1">Click "Upload Document" to get started</p>
          </div>
        )}

        {!isLoading && documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {documents.map((doc, i) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:shadow-soft"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
                  <FiFile size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-secondary truncate">{doc.name}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-400 mt-1">
                    <span>{doc.category}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="truncate">{doc.customer?.companyName || 'Unknown'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 rounded-lg text-primary hover:bg-accent flex items-center justify-center transition-colors"
                    title="Download"
                  >
                    <FiDownload size={18} />
                  </a>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this document?')) {
                        deleteMutation.mutate(doc._id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Documents;
