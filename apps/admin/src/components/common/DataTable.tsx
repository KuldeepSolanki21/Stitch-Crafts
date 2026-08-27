import React from 'react';

export const DataTable: React.FC<{ columns: string[]; data: any[] }> = ({ columns }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
    <table className="w-full text-left text-sm min-w-[600px]">
      <thead className="bg-gray-50 border-b">
        <tr>{columns.map(col => <th key={col} className="p-4 font-semibold text-gray-600">{col}</th>)}</tr>
      </thead>
      <tbody>
        <tr><td colSpan={columns.length} className="p-8 text-center text-gray-400">No records found.</td></tr>
      </tbody>
    </table>
  </div>
);
