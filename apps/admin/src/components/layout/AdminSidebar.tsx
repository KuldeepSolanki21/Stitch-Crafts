import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Overview', icon: '📊' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/products', label: 'Products & Variants', icon: '👜' },
    { to: '/categories', label: 'Categories', icon: '🏷️' },
    { to: '/inventory', label: 'Inventory Control', icon: '📦' },
    { to: '/orders', label: 'Order Fulfillment', icon: '🚚' },
    { to: '/coupons', label: 'Coupons & Promos', icon: '🎟️' },
    { to: '/users', label: 'Customers', icon: '👥' },
    { to: '/reviews', label: 'Reviews', icon: '⭐' },
    { to: '/banners', label: 'Banners', icon: '🖼️' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-6">
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-white tracking-wider">STITCH & CRAFTS</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white p-1.5 rounded-lg focus:outline-none"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>
        <nav className="flex flex-col space-y-1.5 text-sm">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-admin-primary text-white font-medium shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="pt-6 border-t border-gray-800 text-xs text-gray-500">
        <p className="font-semibold text-gray-400">Atelier Control Desk</p>
        <p className="mt-0.5">v2.4.0 (Production)</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-admin-sidebar text-gray-300 min-h-screen shrink-0 border-r border-gray-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-admin-sidebar text-gray-300 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
