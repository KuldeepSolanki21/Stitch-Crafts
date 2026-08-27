import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "px-6 py-3 font-medium transition-all duration-300 rounded-none text-sm tracking-wider uppercase";
  const variants = {
    primary: "bg-leather text-white hover:bg-leather-dark",
    secondary: "bg-charcoal text-white hover:bg-charcoal-dark",
    outline: "border border-leather text-leather hover:bg-leather hover:text-white"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
