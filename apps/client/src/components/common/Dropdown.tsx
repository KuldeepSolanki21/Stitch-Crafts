import React from 'react';

export const Dropdown: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select className="px-4 py-3 bg-white border border-gray-300 focus:border-leather focus:outline-none" {...props} />
);
