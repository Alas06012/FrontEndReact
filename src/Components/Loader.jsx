import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({ size = 'md', color = 'text-blue-500', className = '' }) => {
  const sizeClasses = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-3',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-[5px]',
    xl: 'h-16 w-16 border-[6px]',
  };

  return (
    <div 
      className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${color} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default Loader;