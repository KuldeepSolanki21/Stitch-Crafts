import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('customerAccessToken');
  const user = token ? JSON.parse(localStorage.getItem('customerUser') || '{}') : null;

  const handleLogout = () => {
    localStorage.removeItem('customerAccessToken');
    localStorage.removeItem('customerUser');
    onClose();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop Catalog' },
    { to: '/categories', label: 'Collections' },
    { to: '/about', label: 'Craftsmanship' },
    { to: '/tracking', label: 'Order Tracking' },
    { to: '/contact', label: 'Contact Concierge' },
  ];

  return (
    <>
      {/* Dark Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Menu Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[85%] max-w-sm bg-parchment-light z-50 md:hidden shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-leather/15 pb-4 mb-6">
            <Link to="/" onClick={onClose} className="text-xl font-serif font-bold tracking-widest text-charcoal uppercase">
              Stitch & Crafts
            </Link>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-charcoal/5 hover:bg-charcoal/10 text-charcoal transition"
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>

          {/* Quick Action Pills */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link
              to="/cart"
              onClick={onClose}
              className="flex items-center justify-center space-x-2 bg-charcoal text-white py-2.5 px-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-leather transition"
            >
              <span>🛍️</span>
              <span>Cart</span>
            </Link>
            <Link
              to="/wishlist"
              onClick={onClose}
              className="flex items-center justify-center space-x-2 bg-white border border-leather/20 text-charcoal py-2.5 px-3 rounded text-xs font-bold uppercase tracking-wider hover:border-leather transition"
            >
              <span>♡</span>
              <span>Wishlist</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={`py-3 px-3 rounded text-sm font-medium tracking-wide uppercase transition ${
                    isActive
                      ? 'bg-leather/10 text-leather font-bold'
                      : 'text-charcoal hover:bg-black/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account / Auth Section in Footer of Drawer */}
        <div className="p-6 border-t border-leather/15 bg-parchment/60">
          {user && user.name ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-leather text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-charcoal truncate">{user.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="flex-1 text-center py-2 bg-white border border-leather/30 rounded text-xs font-bold uppercase tracking-wider text-charcoal hover:bg-leather hover:text-white transition"
                >
                  Patron Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-50 text-red-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="block text-center w-full bg-leather text-white py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-leather-dark transition shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="block text-center w-full bg-white border border-leather text-leather py-2.5 rounded text-xs font-bold uppercase tracking-widest hover:bg-leather hover:text-white transition"
              >
                Join the Atelier
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
