import React from 'react';

const Settings = () => (
  <div className="space-y-4 max-w-lg">
    <h1 className="text-xl font-semibold text-secondary">Settings</h1>
    <div className="card space-y-4">
      <p className="text-sm text-gray-500">
        Company profile, GST/PAN details, bank details, email settings, and theme options go here.
        Wire this page up to a <code>/api/settings</code> endpoint (model not included by default —
        add a <code>Settings</code> collection if you need persisted company-wide config).
      </p>
    </div>
  </div>
);

export default Settings;
