import React from 'react';
import { motion } from 'framer-motion';

// Generic reusable table: columns = [{ key, label, render? }]
const DataTable = ({ columns, rows, loading, emptyMessage = 'No records found' }) => (
  <div className="overflow-x-auto">
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

export default DataTable;
