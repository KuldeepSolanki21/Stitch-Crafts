import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Header: React.FC = () => (
  <header className="sticky top-0 z-40 bg-parchment-light/95 backdrop-blur-md border-b border-leather/10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-serif font-bold tracking-widest text-charcoal uppercase">
        Stitch & Crafts
      </Link>
      <Navbar />
      <div className="flex items-center space-x-6">
        <Link to="/wishlist" className="hover:text-leather">Wishlist</Link>
        <Link to="/cart" className="hover:text-leather font-medium">Cart</Link>
        <Link to="/profile" className="hover:text-leather">Account</Link>
      </div>
    </div>
  </header>
);
