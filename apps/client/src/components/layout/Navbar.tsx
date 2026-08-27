import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => (
  <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-wider uppercase">
    <Link to="/" className="hover:text-leather transition-colors">Home</Link>
    <Link to="/shop" className="hover:text-leather transition-colors">Shop All</Link>
    <Link to="/categories" className="hover:text-leather transition-colors">Collections</Link>
    <Link to="/about" className="hover:text-leather transition-colors">Craftsmanship</Link>
    <Link to="/contact" className="hover:text-leather transition-colors">Contact</Link>
  </nav>

);
