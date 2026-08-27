import React from 'react';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-leather focus:outline-none transition-colors" {...props} />
);
