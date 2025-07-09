import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Plus, FileSpreadsheet, FileDown, Trash } from "lucide-react";
import NewTestPopUp from "./NewTestPopUp";

// Este es el nuevo componente que encapsula toda la barra de herramientas.
const TestToolbar = ({
    userRole,
    filters,
    loading,
    tests,
    onFilterChange,
    onClearFilters,
    onNewTest,
    onExportExcel,
    onExportPDF,
}) => {
    // El estado para la visibilidad de los filtros ahora vive aquí.
    const [filtersVisible, setFiltersVisible] = useState(false);

    // Determina si el usuario tiene un rol de gestión (admin/teacher)
    const isTeacher = userRole === 'admin' || userRole === 'teacher';


    return (
        <>
            {/* ======================================================================= */}
            {/* MUESTRA EL BANNER ATRACTIVO SÓLO SI EL USUARIO ES UN ESTUDIANTE  */}
            {/* ======================================================================= */}
            {userRole === 'student' && <NewTestPopUp onNewTest={onNewTest} />}

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md ring-1 ring-slate-200/80 dark:ring-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Título y Botón para mostrar filtros */}
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                            Test Management
                        </h2>
                        <button
                            onClick={() => setFiltersVisible(!filtersVisible)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Botones de Acción Principales */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onExportExcel(tests, "reporte")}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-white ring-1 ring-inset ring-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Excel</span>
                        </button>
                        <button
                            onClick={() => onExportPDF(tests, "reporte")}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-white ring-1 ring-inset ring-rose-200 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                            <FileDown className="w-4 h-4" />
                            <span>PDF</span>
                        </button>
                        {/* ================================================================= */}
                        {/* El botón "Nuevo Test" solo aparece para Admins y Profesores */}
                        {/* ================================================================= */}
                        {isTeacher && (
                            <button
                                onClick={onNewTest}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg shadow-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nuevo Test</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Panel de Filtros Desplegable con Animación */}
                <AnimatePresence>
                    {filtersVisible && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: "1.5rem" }} // 1.5rem = mt-6
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 text-white">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-1">
                                    {/* Input con estilo mejorado */}
                                    <input
                                        type="text"
                                        name="user_email"
                                        placeholder="Student´s Email"
                                        value={filters.user_email}
                                        onChange={onFilterChange}
                                        className="w-full bg-slate-700/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="text"
                                        name="user_name"
                                        placeholder="Name"
                                        value={filters.user_name}
                                        onChange={onFilterChange}
                                        className="w-full bg-slate-700/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="text"
                                        name="user_lastname"
                                        placeholder="Lastname"
                                        value={filters.user_lastname}
                                        onChange={onFilterChange}
                                        className="w-full bg-slate-700/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <select
                                        name="level_name"
                                        value={filters.level_name}
                                        onChange={onFilterChange}
                                        className="w-full bg-slate-700/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Levels</option>
                                        {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>

                                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            {/* Nuevo filtro de Status */}
                                            <span className="text-sm">Status:</span>
                                            <select
                                                name="status"
                                                value={filters.status  || ""}
                                                onChange={onFilterChange}
                                                className="w-full bg-slate-700/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">All</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                        </div>

                                        <div>
                                            {/* Nuevo filtro de Results */}
                                            <span className="text-sm">Result:</span>
                                            <select
                                                name="test_passed"
                                                value={filters.test_passed  || ""}
                                                onChange={onFilterChange}
                                                className="w-full bg-slate-700/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">All</option>
                                                <option value="0">Failed</option>
                                                <option value="1">Passed</option>
                                            </select>
                                        </div>

                                    </div>


                                    {/* Rango de Fechas */}
                                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm">From:</span>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={filters.start_date}
                                                onChange={onFilterChange}
                                                className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <span className="text-sm">To:</span>
                                            <input
                                                type="date"
                                                name="end_date"
                                                value={filters.end_date}
                                                onChange={onFilterChange}
                                                className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>


                                    </div>
                                </div>
                                {/* Botón para limpiar filtros */}
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={onClearFilters}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <Trash className="w-4 h-4" />
                                        <span>Clean Filters</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default TestToolbar;