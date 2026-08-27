import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => (
  <footer className="bg-charcoal text-gray-300 pt-16 pb-12 mt-24">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div>
        <h3 className="font-serif text-xl text-white tracking-widest mb-4 uppercase">Stitch & Crafts</h3>
        <p className="text-sm text-gray-400">Mastercrafted premium leather goods, precision-tailored for a lifetime of luxury.</p>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-leather mb-4 font-semibold">Explore</h4>
        <div className="flex flex-col space-y-2 text-sm">
          <Link to="/shop" className="hover:text-white">Shop Catalog</Link>
          <Link to="/categories" className="hover:text-white">Collections</Link>
          <Link to="/about" className="hover:text-white">Our Heritage</Link>
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-leather mb-4 font-semibold">Assistance</h4>
        <div className="flex flex-col space-y-2 text-sm">
          <Link to="/tracking" className="hover:text-white">Order Tracking</Link>
          <Link to="/contact" className="hover:text-white">Customer Support</Link>
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-leather mb-4 font-semibold">Newsletter</h4>
        <p className="text-xs text-gray-400 mb-4">Join our private circle for bespoke edition announcements.</p>
      </div>
    </div>
  </footer>
);
