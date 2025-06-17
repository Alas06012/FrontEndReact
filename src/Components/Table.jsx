import React from 'react';
import { motion } from 'framer-motion';

const Table = ({ columns, data, onAction }) => {
  // Animaciones simplificadas
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

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, rowIndex) => (
            <motion.tr 
              key={`row-${rowIndex}`}
              variants={rowVariants}
              className="hover:bg-gray-50 transition-colors duration-150" // Solo hover simple con Tailwind
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