import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-muted text-center px-4">
    <h1 className="text-6xl font-bold text-primary">404</h1>
    <p className="text-secondary mt-2 mb-6">Page not found</p>
    <Link to="/" className="btn-primary">Back to Dashboard</Link>
  </div>
);

export default NotFound;
