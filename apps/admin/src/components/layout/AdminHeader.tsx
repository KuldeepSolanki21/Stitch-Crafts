import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('adminUser') || '{"name":"Super Administrator"}');

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight">Admin Control Panel</h1>
          <p className="text-[11px] text-gray-400 hidden sm:block">Luxury Leather Atelier Administration</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="text-right hidden sm:block">
          <span className="text-sm font-semibold text-gray-800 block">{user.name}</span>
          <span className="text-[10px] uppercase font-bold text-admin-primary tracking-wider">{user.role || 'Super Admin'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-3.5 py-1.5 rounded-lg font-semibold transition border border-gray-200"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};
