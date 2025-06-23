import React from 'react';
import { motion } from 'framer-motion';

const Table = ({ columns, data, onAction }) => {
   const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        when: "beforeChildren"
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      y: -2,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    }
  };


  // Versión para desktop (tabla tradicional con scroll)
  const renderDesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <motion.table 
        className="min-w-full divide-y divide-gray-200"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <motion.th 
                key={`th-${index}`}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
              >
                <div className="flex items-center">
                  {column.header}
                  {column.sortable && (
                    <button className="ml-1 focus:outline-none">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.th>
            ))}
            {onAction && (
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, rowIndex) => (
            <motion.tr 
              key={`row-${rowIndex}`}
              variants={rowVariants}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {onAction && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2 items-center justify-start">
                    {onAction(item)}
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );

  // Versión para móvil (cards)
  const renderMobileCards = () => (
    <motion.div 
      className="md:hidden space-y-4 p-2"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {data.map((item, rowIndex) => (
        <motion.div
          key={`card-${rowIndex}`}
          variants={cardVariants}
          initial="hidden"
          animate="show"
          whileHover="hover"
          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
        >
          <div className="p-5 space-y-4">
            {columns.map((column, colIndex) => (
              <div 
                key={`mobile-cell-${rowIndex}-${colIndex}`} 
                className="flex flex-col group"
              >
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {column.header}
                </span>
                <div className="text-sm font-medium text-gray-800 mt-1 overflow-x-auto py-1 px-1 -mx-1 rounded">
                  {column.render ? column.render(item) : item[column.key]}
                </div>
                {colIndex < columns.length - 1 && (
                  <div className="border-b border-gray-100 mt-2"></div>
                )}
              </div>
            ))}
            {onAction && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <div className="flex gap-3 items-center justify-end">
                  {onAction(item)}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );


  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {renderDesktopTable()}
      {renderMobileCards()}
      
      {data.length === 0 && (
        <motion.div 
          className="p-8 text-center text-gray-500 bg-white rounded-b-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          No hay datos disponibles
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(Table);