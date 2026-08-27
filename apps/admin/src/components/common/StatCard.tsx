import React from 'react';

export const StatCard: React.FC<{ title: string; value: string; trend?: string }> = ({ title, value, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    {trend && <span className="text-xs text-green-600 font-medium">{trend}</span>}
  </div>
);
