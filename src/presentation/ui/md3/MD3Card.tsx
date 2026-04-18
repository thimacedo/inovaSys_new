import React from 'react';
import { motion } from 'motion/react';

interface MD3CardProps {
  children: React.ReactNode;
  variant?: 'filled' | 'elevated' | 'outlined';
  className?: string;
  onClick?: () => void;
}

export const MD3Card: React.FC<MD3CardProps> = ({ 
  children, 
  variant = 'filled', 
  className = '',
  onClick 
}) => {
  const baseStyles = "rounded-[28px] p-6 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
  
  const variants = {
    filled: "bg-md-surface-variant/30 border border-md-outline/5 hover:bg-md-surface-variant/50",
    elevated: "bg-md-surface shadow-md-1 hover:shadow-md-2 hover:scale-[1.01]",
    outlined: "bg-transparent border border-md-outline/20 hover:bg-md-primary/5"
  };

  return (
    <motion.div 
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};
