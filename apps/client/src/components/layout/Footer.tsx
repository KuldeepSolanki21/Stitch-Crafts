import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => (
  <footer className="bg-charcoal text-gray-300 pt-12 sm:pt-16 pb-10 sm:pb-12 mt-16 sm:mt-24 border-t border-leather/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
      <div>
        <h3 className="font-serif text-lg sm:text-xl text-white tracking-widest mb-3 sm:mb-4 uppercase">Stitch & Crafts</h3>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          Mastercrafted premium leather goods, precision-tailored for a lifetime of luxury and timeless patina.
        </p>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-leather mb-3 sm:mb-4 font-bold">Explore</h4>
        <div className="flex flex-col space-y-2 text-xs sm:text-sm">
          <Link to="/shop" className="hover:text-white transition-colors">Shop Catalog</Link>
          <Link to="/categories" className="hover:text-white transition-colors">Collections</Link>
          <Link to="/about" className="hover:text-white transition-colors">Our Heritage</Link>
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-leather mb-3 sm:mb-4 font-bold">Assistance</h4>
        <div className="flex flex-col space-y-2 text-xs sm:text-sm">
          <Link to="/tracking" className="hover:text-white transition-colors">Order Tracking</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Customer Support</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-leather mb-3 sm:mb-4 font-bold">Newsletter</h4>
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">Join our private circle for bespoke edition announcements and craftsmanship stories.</p>
        <div className="text-[11px] text-gray-500 font-mono">
          © {new Date().getFullYear()} Stitch & Crafts. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);
