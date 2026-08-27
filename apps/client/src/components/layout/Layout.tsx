import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col justify-between">
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);
