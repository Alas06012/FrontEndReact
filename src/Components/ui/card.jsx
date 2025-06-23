import React from "react";

const Card = ({ title, children, bgColor = "bg-white", className = "" }) => {
  return (
    <div
      className={`rounded-lg shadow-md p-4 ${bgColor} ${className}`}
    >
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          {title}
        </h2>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  );
};

export default Card;