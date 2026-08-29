import React from 'react';
import { motion } from 'framer-motion';

// Generic reusable table: columns = [{ key, label, render? }]
const DataTable = ({ columns, rows, loading, emptyMessage = 'No records found' }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    // Mobile card view
    return (
      <div className="space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="skeleton h-4 w-full mb-3" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        {!loading && rows.length === 0 && (
          <div className="card p-8 text-center text-gray-400">{emptyMessage}</div>
        )}
        {!loading &&
          rows.map((row, i) => (
            <motion.div
              key={row._id || i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.025, 0.2) }}
              className="card p-4 space-y-2"
            >
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">{col.label}:</span>
                  <span className="text-gray-900 font-medium text-right">
                    {col.render ? col.render(row) : row[col.key]}
                  </span>
                </div>
              ))}
            </motion.div>
          ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted text-left text-gray-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-t border-gray-100">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="skeleton h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row, i) => (
              <motion.tr
                key={row._id || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.025, 0.2) }}
                className="border-t border-primary/10 hover:bg-accent/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
