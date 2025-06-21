// StudyHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from "../../../Components/Alert.jsx";
import { API_URL } from "../../../../config.js";
import { getUserRole, getAccessToken } from "../../../Utils/auth.js";

const StudyHome = () => {
  const [filters, setFilters] = useState({
    level: '',
    tags: '',
    search: ''
  });
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [mcerLevels, setMcerLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6
  });
  
  const navigate = useNavigate();

  // Cargar niveles MCER al montar el componente
  useEffect(() => {
    const fetchMcerLevels = async () => {
      try {
        // En una implementación real, esto vendría de tu API
        // Aquí mantenemos los datos hardcodeados como en tu ejemplo
        const levels = [
          { id: 1, name: 'A1', desc: 'Principiante' },
          { id: 2, name: 'A2', desc: 'Elemental' },
          { id: 3, name: 'B1', desc: 'Intermedio' },
          { id: 4, name: 'B2', desc: 'Intermedio-Avanzado' },
          { id: 5, name: 'C1', desc: 'Avanzado' },
          { id: 6, name: 'C2', desc: 'Experto' }
        ];
        setMcerLevels(levels);
      } catch (err) {
        console.error("Error cargando niveles MCER:", err);
      }
    };

    fetchMcerLevels();
  }, []);

  // Cargar materiales de estudio con filtros
  useEffect(() => {
    const fetchStudyMaterials = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error('No autenticado');
        }

        const response = await fetch(`${API_URL}/materials/filter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            page: pagination.currentPage,
            per_page: pagination.itemsPerPage,
            studymaterial_title: filters.search,
            level_fk: filters.level,
            studymaterial_tags: filters.tags
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar materiales');
        }

        const data = await response.json();
        setStudyMaterials(data.materials);
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.total_pages,
          totalItems: data.pagination.total_items
        }));
      } catch (err) {
        setError(err.message);
        Alert({
          title: 'Error',
          text: err.message,
          icon: 'error',
          background: '#ef4444'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudyMaterials();
  }, [filters, pagination.currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    // Resetear a página 1 cuando cambian los filtros
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-10 border border-gray-200">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 tracking-tight">
          Study Materials
        </h1>
        
        {/* Filtros de búsqueda */}
        <div className="mb-10 bg-gray-50 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Filtrar Materiales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filtro por nivel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel MCER
              </label>
              <select
                name="level"
                value={filters.level}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los niveles</option>
                {mcerLevels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name} - {level.desc}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro por etiquetas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas
              </label>
              <input
                type="text"
                name="tags"
                value={filters.tags}
                onChange={handleFilterChange}
                placeholder="grammar, vocabulary, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Búsqueda general */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Título o descripción"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && !loading && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Lista de materiales */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyMaterials.map(material => {
                const level = mcerLevels.find(l => l.id === material.level_fk);
                
                return (
                  <div 
                    key={material.pk_studymaterial}
                    className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      {/* Cabecera con nivel */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            material.level_fk === 1 ? 'bg-blue-100 text-blue-800' :
                            material.level_fk === 2 ? 'bg-green-100 text-green-800' :
                            material.level_fk === 3 ? 'bg-yellow-100 text-yellow-800' :
                            material.level_fk === 4 ? 'bg-orange-100 text-orange-800' :
                            material.level_fk === 5 ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {level ? level.name : 'N/A'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(material.created_at)}
                        </span>
                      </div>
                      
                      {/* Contenido */}
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {material.studymaterial_title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {material.studymaterial_desc}
                      </p>
                      
                      {/* Etiquetas */}
                      {material.studymaterial_tags && (
                        <div className="flex flex-wrap gap-2 mb-5">
                          {material.studymaterial_tags.split(',').map((tag, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Footer con tipo y botón */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Tipo: {material.studymaterial_type}
                        </span>
                        <a 
                          href={material.studymaterial_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          Ver Material
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Mensaje cuando no hay materiales */}
            {studyMaterials.length === 0 && !loading && (
              <div className="text-center py-10">
                <div className="bg-gray-100 border-2 border-dashed rounded-xl p-8 mx-auto max-w-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron materiales</h3>
                  <p className="text-gray-500">
                    Prueba ajustando tus filtros o intenta más tarde
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Paginación */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-4 py-2 rounded-lg ${
                  pagination.currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Anterior
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-4 py-2 rounded-lg ${
                  pagination.currentPage === pagination.totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyHome;