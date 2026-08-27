import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-admin-bg text-gray-800">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
