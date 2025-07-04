import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BookCopy, ChevronDown, Search, Tag, Download, ChevronLeft, ChevronRight, FileText, FileQuestion } from 'lucide-react';
import Alert from "../../../Components/Alert.jsx";
import { API_URL } from "../../../../config.js";
import { getUserRole, getAccessToken } from "../../../Utils/auth.js";

// --- Componente: Encabezado de la Página ---
const StudyHeader = () => {
  // Animation variants for the container and its children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Controls the delay between each child's animation
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 } 
    },
  };

  return (
    <motion.div
      className="mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center gap-4 mb-2">
        {/* Styled and animated icon */}
        <motion.div variants={itemVariants} className="bg-blue-100 p-3 rounded-full">
          <BookOpen className="h-8 w-8 text-blue-500" />
        </motion.div>
        
        {/* Animated title with gradient */}
        <motion.h1 
          variants={itemVariants} 
          className="text-4xl py-3 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Study Materials
        </motion.h1>
      </div>
      
      {/* Animated paragraph */}
      <motion.p variants={itemVariants} className="text-slate-500 pl-20">
        Find resources, presentations, and documents to boost your learning journey.
      </motion.p>
    </motion.div>
  );
};


// --- Componente: Barra de Filtros ---
const FilterBar = ({ filters, mcerLevels, onFilterChange }) => {
  // Variantes de animación para el contenedor y los elementos hijos
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* --- Filtro de Búsqueda --- */}
      <motion.div className="relative" variants={itemVariants}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={onFilterChange}
          placeholder="Search by title..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-200 border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </motion.div>

      {/* --- Filtro de Nivel --- */}
      <motion.div className="relative" variants={itemVariants}>
        <BookCopy className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <select
          name="level"
          value={filters.level}
          onChange={onFilterChange}
          className="w-full appearance-none pl-11 pr-10 py-2.5 bg-slate-200 border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
        >
          <option value="">All Levels</option>
          {mcerLevels.map(level => (
            <option key={level.id} value={level.id}>
              {level.name} - {level.desc}
            </option>
          ))}
        </select>
      </motion.div>

      {/* --- Filtro de Etiquetas --- */}
      <motion.div className="relative" variants={itemVariants}>
        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          name="tags"
          value={filters.tags}
          onChange={onFilterChange}
          placeholder="Filter by tags (e.g., grammar)"
          className="w-full pl-11 pr-4 py-2.5 bg-slate-200 border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </motion.div>
    </motion.div>
  );
};

// --- Componente: Tarjeta de Material ---
const MaterialCard = ({ material, level }) => {
  const levelColorMap = {
    1: "bg-blue-100 text-blue-800",
    2: "bg-green-100 text-green-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-orange-100 text-orange-800",
    5: "bg-red-100 text-red-800",
    default: "bg-purple-100 text-purple-800",
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/80 overflow-hidden flex flex-col hover:shadow-lg hover:ring-blue-500 transition-all"
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColorMap[material.level_fk] || levelColorMap.default}`}>
            {level ? level.name : 'N/A'}
          </span>
          <span className="text-xs text-slate-400">{formatDate(material.created_at)}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          {material.studymaterial_title}
        </h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {material.studymaterial_desc}
        </p>
      </div>
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">
              {material.studymaterial_type}
            </span>
          </div>
          <a
            href={material.studymaterial_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            View
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// --- Componente: Paginación ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="mt-10 flex justify-center items-center gap-2">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
    <span className="text-sm text-slate-600">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
    >
      <ChevronRight className="h-5 w-5" />
    </button>
  </div>
);

// --- Componente: Estado Vacío ---
const EmptyState = () => (
    <div className="text-center py-16 col-span-full">
        <FileQuestion className="h-20 w-20 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700">No Materials Found</h3>
        <p className="text-slate-500 mt-2">Try adjusting your filters or check back later for new content.</p>
    </div>
);

// --- Componente: Spinner de Carga ---
const LoadingSpinner = () => (
    <div className="flex justify-center py-16 col-span-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

// --- Componente Principal: StudyHome ---
const StudyHome = () => {
  const [filters, setFilters] = useState({ level: '', tags: '', search: '' });
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [mcerLevels, setMcerLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 6 });
  const navigate = useNavigate();

  // Lógica de carga de datos (sin cambios)
  useEffect(() => {
    const fetchMcerLevels = () => {
      const levels = [
        { id: 1, name: 'A1', desc: 'Beginner' },
        { id: 2, name: 'A2', desc: 'Elementary' },
        { id: 3, name: 'B1', desc: 'Intermediate' },
        { id: 4, name: 'B2', desc: 'Upper-Intermediate' },
        { id: 5, name: 'C1', desc: 'Advanced' },
        { id: 6, name: 'C2', desc: 'Proficient' }
      ];
      setMcerLevels(levels);
    };
    fetchMcerLevels();
  }, []);
  
  useEffect(() => {
    const fetchStudyMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        const response = await fetch(`${API_URL}/materials/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
          body: JSON.stringify({
            page: pagination.currentPage,
            per_page: pagination.itemsPerPage,
            studymaterial_title: filters.search,
            level_fk: filters.level,
            studymaterial_tags: filters.tags
          })
        });
        if (!response.ok) throw new Error('Failed to load materials');
        const data = await response.json();
        setStudyMaterials(data.materials);
        setPagination(prev => ({ ...prev, totalPages: data.pagination.total_pages, totalItems: data.pagination.total_items }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudyMaterials();
  }, [filters, pagination.currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <StudyHeader />
        <FilterBar filters={filters} mcerLevels={mcerLevels} onFilterChange={handleFilterChange} />

        {error && <p className="text-red-500">Error: {error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <LoadingSpinner />
          ) : studyMaterials.length > 0 ? (
            <AnimatePresence>
              {studyMaterials.map(material => (
                <MaterialCard
                  key={material.pk_studymaterial}
                  material={material}
                  level={mcerLevels.find(l => l.id === material.level_fk)}
                />
              ))}
            </AnimatePresence>
          ) : (
            <EmptyState />
          )}
        </div>
        
        {!loading && !error && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default StudyHome;