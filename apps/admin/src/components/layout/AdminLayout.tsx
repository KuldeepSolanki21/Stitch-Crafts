import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-admin-bg">
    <AdminSidebar />
    <div className="flex-1 flex flex-col">
      <AdminHeader />
      <main className="p-8 flex-1">{children}</main>
    </div>
  </div>
);
