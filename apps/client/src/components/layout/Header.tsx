import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-parchment-light/95 backdrop-blur-md border-b border-leather/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          {/* Mobile Hamburger Button */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-charcoal hover:bg-black/5 focus:outline-none"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="text-lg sm:text-xl font-serif font-bold tracking-widest text-charcoal uppercase">
              Stitch & Crafts
            </Link>
          </div>

          {/* Desktop Logo */}
          <Link to="/" className="hidden md:block text-2xl font-serif font-bold tracking-widest text-charcoal uppercase">
            Stitch & Crafts
          </Link>

          {/* Desktop Navigation */}
          <Navbar />

          {/* User Utility Actions */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm font-medium">
            <Link to="/wishlist" className="hover:text-leather transition-colors flex items-center space-x-1" title="Wishlist">
              <span className="text-base sm:text-lg">♡</span>
              <span className="hidden sm:inline">Wishlist</span>
            </Link>
            <Link to="/cart" className="hover:text-leather transition-colors font-medium flex items-center space-x-1" title="Cart">
              <span className="text-base sm:text-lg">🛍️</span>
              <span className="hidden sm:inline">Cart</span>
            </Link>
            <Link to="/profile" className="hover:text-leather transition-colors flex items-center space-x-1" title="Account">
              <span className="text-base sm:text-lg">👤</span>
              <span className="hidden sm:inline">Account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};
