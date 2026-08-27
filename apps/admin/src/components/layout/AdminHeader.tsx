import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('adminUser') || '{"name":"Super Administrator"}');

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-800">Admin Control Panel</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600">{user.name}</span>
        <button
          onClick={handleLogout}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

