import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  perPage, 
  onPerPageChange,
  maxVisiblePages = 5 
}) => {
  // Calcular páginas visibles
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = maxVisiblePages;
    }

    if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxVisiblePages + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  // Funciones para cambiar de página
  const goToFirstPage = () => onPageChange(1);
  const goToPreviousPage = () => currentPage > 1 && onPageChange(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && onPageChange(currentPage + 1);
  const goToLastPage = () => onPageChange(totalPages);

  // Estilo base para botones
  const baseButtonClass = "flex items-center justify-center w-8 h-8 rounded transition duration-300";
  const activeButtonClass = "bg-blue-600 text-white";
  const inactiveButtonClass = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  const disabledButtonClass = "bg-gray-100 text-gray-400 cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
      {/* Mostrar rango de registros */}
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, currentPage * perPage)} of {totalPages * perPage} entries
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-1">
        {/* Primer página */}
        <button
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className={`${baseButtonClass} ${currentPage === 1 ? disabledButtonClass : inactiveButtonClass}`}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Página anterior */}
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`${baseButtonClass} ${currentPage === 1 ? disabledButtonClass : inactiveButtonClass}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Páginas visibles */}
        {visiblePages[0] > 1 && (
          <span className="px-2 text-gray-500">...</span>
        )}

        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${baseButtonClass} ${currentPage === page ? activeButtonClass : inactiveButtonClass}`}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <span className="px-2 text-gray-500">...</span>
        )}

        {/* Página siguiente */}
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`${baseButtonClass} ${currentPage === totalPages ? disabledButtonClass : inactiveButtonClass}`}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Última página */}
        <button
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          className={`${baseButtonClass} ${currentPage === totalPages ? disabledButtonClass : inactiveButtonClass}`}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      {/* Selector de registros por página */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Rows per page:</label>
        <select
          value={perPage}
          onChange={onPerPageChange}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;