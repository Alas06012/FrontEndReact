import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const ToeicFilters = ({
    filters,
    loading,
    onFilterChange,
    onApplyFilters,
    onCreateTest,
    onClearFilters
}) => {
    // Animaciones
    const filterItemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3
            }
        })
    };

    const buttonVariants = {
        hover: { scale: 1.03, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
        tap: { scale: 0.98 },
        disabled: { opacity: 0.6, cursor: 'not-allowed' }
    };

    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

    // Verificar si hay filtros activos para mostrar el botón de limpiar
    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="mb-10">
            {/* Filtros */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={filterItemVariants} custom={0}>
                    <input
                        type="text"
                        name="user_email"
                        placeholder="Email"
                        value={filters.user_email}
                        onChange={onFilterChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                </motion.div>

                <motion.div variants={filterItemVariants} custom={1}>
                    <input
                        type="text"
                        name="user_name"
                        placeholder="First Name"
                        value={filters.user_name}
                        onChange={onFilterChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                </motion.div>

                <motion.div variants={filterItemVariants} custom={2}>
                    <input
                        type="text"
                        name="user_lastname"
                        placeholder="Last Name"
                        value={filters.user_lastname}
                        onChange={onFilterChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                </motion.div>

                <motion.div variants={filterItemVariants} custom={3}>
                    <select
                        name="level_name"
                        value={filters.level_name}
                        onChange={onFilterChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        <option value="">All Levels</option>
                        {levels.map((level) => (
                            <option key={level} value={level}>
                                {level}
                            </option>
                        ))}
                    </select>
                </motion.div>

                {/* Nuevos filtros de fecha */}
                <motion.div variants={filterItemVariants} custom={4}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                        type="date"
                        name="start_date"
                        value={filters.start_date || ''}
                        onChange={onFilterChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                </motion.div>

                <motion.div variants={filterItemVariants} custom={5}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                        type="date"
                        name="end_date"
                        value={filters.end_date || ''}
                        onChange={onFilterChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                </motion.div>
            </motion.div>

            {/* Botones de Acción */}
            <motion.div
                className="flex flex-col sm:flex-row justify-between items-center gap-4"
                initial="hidden"
                animate="visible"
            >
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <motion.div
                        variants={filterItemVariants}
                        custom={4}
                    >
                        <motion.button
                            onClick={onApplyFilters}
                            disabled={loading}
                            variants={buttonVariants}
                            whileHover={!loading ? "hover" : "disabled"}
                            whileTap={!loading ? "tap" : "disabled"}
                            className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium px-6 py-3 rounded-xl shadow transition ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-700'
                                }`}
                        >
                            Apply Filters
                        </motion.button>
                    </motion.div>

                    {hasActiveFilters && (
                        <motion.div
                            variants={filterItemVariants}
                            custom={5}
                        >
                            <motion.button
                                onClick={onClearFilters}
                                disabled={loading}
                                variants={buttonVariants}
                                whileHover={!loading ? "hover" : "disabled"}
                                whileTap={!loading ? "tap" : "disabled"}
                                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium px-6 py-3 rounded-xl shadow transition ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:from-gray-600 hover:to-gray-700'
                                    }`}
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </motion.button>
                        </motion.div>
                    )}
                </div>

                <motion.div
                    className="w-full sm:w-auto"
                    variants={filterItemVariants}
                    custom={6}
                >
                    <motion.button
                        onClick={onCreateTest}
                        disabled={loading}
                        variants={buttonVariants}
                        whileHover={!loading ? "hover" : "disabled"}
                        whileTap={!loading ? "tap" : "disabled"}
                        className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:from-green-600 hover:to-green-700'
                            }`}
                    >
                        <Plus className="w-5 h-5" />
                        Create Test
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ToeicFilters;