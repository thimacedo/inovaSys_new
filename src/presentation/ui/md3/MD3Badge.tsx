import React from 'react';

interface MD3BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error';
  className?: string;
}

export const MD3Badge: React.FC<MD3BadgeProps> = ({ 
  label, 
  variant = 'primary',
  className = ''
}) => {
  const variants = {
    primary: "bg-md-primary-container text-md-on-primary-container",
    secondary: "bg-md-secondary-container text-md-on-secondary-container",
    tertiary: "bg-md-tertiary-container text-md-on-tertiary-container",
    error: "bg-rose-100 text-rose-700"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {label}
    </span>
  );
};
