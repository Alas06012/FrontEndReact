import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, perPage, onPerPageChange }) => {
  // Generamos un arreglo de números de página
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Funciones para cambiar de página
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-4">
      {/* Botones de paginación */}
      <div className="flex gap-2 items-center">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded flex items-center ${
            currentPage === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-Paleta-Celeste text-white hover:bg-Paleta-VerdeSuave'
          } transition duration-300 ease-in-out`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {pages.length > 0 ? (
          pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-Paleta-Celeste text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition duration-300 ease-in-out`}
            >
              {page}
            </button>
          ))
        ) : (
          <span className="px-3 py-1 text-gray-500">1</span>
        )}
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded flex items-center ${
            currentPage === totalPages
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-Paleta-Celeste text-white hover:bg-Paleta-VerdeSuave'
          } transition duration-300 ease-in-out`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Selector de registros por página */}
      <div className="flex items-center gap-2">
        <label className="text-gray-700">Registros por página:</label>
        <select
          value={perPage}
          onChange={onPerPageChange}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;