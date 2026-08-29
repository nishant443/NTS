import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiFile, FiDownload, FiTrash2, FiUpload, FiEdit2 } from 'react-icons/fi';
import api from '../api/axios';
import Modal from '../components/Modal';

const DOCUMENT_TYPES = [
  'GST Certificate', 'PAN Card', 'MSME Certificate', 'Cheque', 'Bank Details', 'Company Profile', 'License', 'Registration', 'Other'
];

const Settings = () => {
  const queryClient = useQueryClient();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({ documentType: 'GST Certificate', name: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Fetch company documents
  const { data, isLoading } = useQuery({
    queryKey: ['company-documents'],
    queryFn: () => api.get('/company-documents').then((r) => r.data),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formDataObj) => {
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('documentType', formDataObj.documentType);
      uploadData.append('name', formDataObj.name || selectedFile.name);
      uploadData.append('description', formDataObj.description);

      return api.post('/company-documents', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['company-documents']);
      setUploadModalOpen(false);
      setFormData({ documentType: 'GST Certificate', name: '', description: '' });
      setSelectedFile(null);
      setUploadProgress(0);
      setUploading(false);
    },
    onError: (error) => {
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
      setUploading(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/company-documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['company-documents']),
    onError: (error) => alert('Delete failed: ' + (error.response?.data?.message || error.message)),
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
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
    }
  };

  const documents = data?.documents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-secondary">Settings</h1>
        <p className="text-xs sm:text-sm text-gray-400">Manage company documents and settings</p>
      </div>

      {/* Company Documents Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-secondary">Company Documents</h2>
            <p className="text-xs sm:text-sm text-gray-400">GST, PAN, MSME, Cheque, Bank Details, etc.</p>
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
          title="Upload Company Document"
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
                disabled={uploading || !selectedFile}
                className="btn-primary"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          }
        >
          <form className="space-y-4">
            {/* Document Type */}
            <div>
              <label className="label">Document Type *</label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                disabled={uploading}
                className="input-field"
                required
              >
                {DOCUMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Document Name */}
            <div>
              <label className="label">Document Name</label>
              <input
                type="text"
                placeholder="e.g., NTS GST Certificate 2024"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={uploading}
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description (optional)</label>
              <textarea
                placeholder="Add any additional details..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={uploading}
                className="input-field resize-none"
                rows="3"
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

            {/* Upload Progress */}
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

        {/* Documents Grid/List */}
        <div className="space-y-3">
          {isLoading && (
            <div className="space-y-2">
              <div className="skeleton h-16 w-full rounded-lg" />
              <div className="skeleton h-16 w-full rounded-lg" />
            </div>
          )}

          {!isLoading && documents.length === 0 && (
            <div className="card text-center py-8 sm:py-12">
              <FiFile size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">No company documents uploaded yet.</p>
              <p className="text-xs text-gray-300 mt-1">Click "Upload Document" to add company documents</p>
            </div>
          )}

          {!isLoading && documents.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {documents.map((doc, i) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4 flex flex-col hover:shadow-soft"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
                      <FiFile size={18} />
                    </div>
                    <span className="text-xs font-semibold bg-accent text-primary px-2.5 py-1 rounded-full">
                      {doc.documentType}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 mb-3">
                    <h3 className="text-sm font-semibold text-secondary truncate">{doc.name}</h3>
                    {doc.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">{doc.description}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-2">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 h-8 rounded-lg text-primary bg-accent hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                    >
                      <FiDownload size={16} />
                      Download
                    </a>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this document?')) {
                          deleteMutation.mutate(doc._id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 h-8 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
