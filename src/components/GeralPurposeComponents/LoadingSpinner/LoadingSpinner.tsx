import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'border-red-600' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-32 w-32'
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 ${color}`}></div>
  );
};

export default LoadingSpinner; 