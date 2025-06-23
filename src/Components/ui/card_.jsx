// src/components/ui/card.jsx
/*import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl shadow-md bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}
*/

import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ title, children, bgColor = 'bg-blue-50', className = '' }) => {
  return (
    <div className={`p-4 rounded-lg shadow ${bgColor} ${className}`}>
      {title && <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>}
      {children}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  bgColor: PropTypes.string,
  className: PropTypes.string,
};

export default Card;