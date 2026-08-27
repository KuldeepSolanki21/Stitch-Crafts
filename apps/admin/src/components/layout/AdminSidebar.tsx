import React from 'react';
import { Link } from 'react-router-dom';

export const AdminSidebar: React.FC = () => (
  <aside className="w-64 bg-admin-sidebar text-gray-300 min-h-screen p-6 flex flex-col justify-between">
    <div>
      <h2 className="text-xl font-bold text-white tracking-wider mb-8">STITCH & CRAFTS</h2>
      <nav className="flex flex-col space-y-3 text-sm">
        <Link to="/" className="hover:text-white transition-colors">Overview</Link>
        <Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link>
        <Link to="/products" className="hover:text-white transition-colors">Products & Variants</Link>
        <Link to="/categories" className="hover:text-white transition-colors">Categories</Link>
        <Link to="/inventory" className="hover:text-white transition-colors">Inventory Control</Link>
        <Link to="/orders" className="hover:text-white transition-colors">Order Fulfillment</Link>
        <Link to="/coupons" className="hover:text-white transition-colors">Coupons & Promos</Link>
        <Link to="/users" className="hover:text-white transition-colors">Customers</Link>
        <Link to="/reviews" className="hover:text-white transition-colors">Reviews</Link>
        <Link to="/banners" className="hover:text-white transition-colors">Banners</Link>
        <Link to="/settings" className="hover:text-white transition-colors">Settings</Link>
      </nav>
    </div>
  </aside>
);
