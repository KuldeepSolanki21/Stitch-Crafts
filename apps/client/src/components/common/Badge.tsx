import React from 'react';

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children }) => (
  <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-leather/10 text-leather">
    {children}
  </span>
);
