import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', message }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    footer={
      <>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary bg-red-500 hover:bg-red-600" onClick={onConfirm}>Delete</button>
      </>
    }
  >
    <p className="text-sm text-gray-600">{message || 'This action cannot be undone.'}</p>
  </Modal>
);

export default ConfirmDialog;
