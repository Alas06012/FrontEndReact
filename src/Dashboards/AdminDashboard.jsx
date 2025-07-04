import React, { useRef, useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { API_URL } from "../../config";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  UsersIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Registrar Chart.js (sin cambios)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Componente Reutilizable para Tablas de Estudiantes ---
const StudentTable = ({ title, subtitle, data, columns, onRowClick }) => {
  const tableContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  
  // Extrae las claves de los datos para un acceso dinámico
  const dataKeys = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <motion.div 
      className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden ring-1 ring-black ring-opacity-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm font-normal text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
            <tr>
              {columns.map((col) => (
                <th key={col} scope="col" className="px-6 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={tableContainerVariants} initial="hidden" animate="show">
            {data.map((student, idx) => (
              <motion.tr
                key={idx}
                className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 ${onRowClick ? 'cursor-pointer' : ''}`}
                variants={rowVariants}
                onClick={() => onRowClick && onRowClick(student)}
              >
                {dataKeys.map((key, cellIdx) => (
                  <td key={cellIdx} className={`px-6 py-4 ${cellIdx === 0 ? 'font-medium text-slate-900 dark:text-white' : ''}`}>
                    {student[key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};


// --- Componente Principal del Dashboard ---
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lógica de obtención y procesamiento de datos (sin cambios mayores)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/admin-dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Error fetching data");

        const raw = result.data;
        setDashboardData({
          total_evaluated: raw.evaluated_students,
          average_score: raw.average_score,
          level_distribution: raw.level_distribution.map(item => ({ name: item.level, count: item.count })),
          tests_by_day_data: processTestsByDay(raw.tests_by_day),
          approval_rate: raw.approval_rate,
          top_performers: raw.top_performers.map(p => ({ name: p.user_name, lastname: p.user_lastname, score: p.score })),
          low_performers: raw.low_performers.map(p => ({ name: p.user_name, lastname: p.user_lastname, score: p.score })),
          latest_evaluated: raw.latest_evaluated.map(s => ({ name: s.user_name, lastname: s.user_lastname, date: s.date, level: s.level || "N/A", score: s.score || 0 })),
        });
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const processTestsByDay = (testsByDay) => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const countMap = {};
    testsByDay.forEach(item => {
      const [day, month, year] = item.date.split(" ").map(Number);
      const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      countMap[formattedDate] = item.count;
    });

    return {
      labels: last7Days.map(d => new Date(d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })),
      datasets: [{
        label: "Tests completados",
        data: last7Days.map(date => countMap[date] || 0),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 5,
      }],
    };
  };

  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!dashboardData) return <div className="text-center p-6 text-slate-500">No hay datos disponibles.</div>;

  // --- Datos para los componentes ---
  const stats = [
    { name: "Estudiantes Evaluados", value: dashboardData.total_evaluated, icon: UsersIcon },
    { name: "Promedio Global", value: dashboardData.average_score, icon: ChartBarIcon },
    { name: "Tasa de Aprobación", value: `${dashboardData.approval_rate}%`, icon: CheckCircleIcon },
  ];

  const levelDistributionData = {
    labels: dashboardData.level_distribution.map(item => item.name),
    datasets: [{
      data: dashboardData.level_distribution.map(item => item.count),
      backgroundColor: ["#93C5FD", "#60A5FA", "#3B82F6", "#2563EB"],
      borderColor: "#fff",
      borderWidth: 2,
    }],
  };
  
  // Animaciones de Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* --- Sección de Estadísticas --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 flex items-center space-x-4 ring-1 ring-black ring-opacity-5"
            variants={itemVariants}
          >
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
              <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- Sección de Gráficos --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <motion.div className="lg:col-span-3 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 ring-1 ring-black ring-opacity-5" variants={itemVariants}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tests por Día (Últimos 7 días)</h3>
          <div className="h-80">
            <Bar data={dashboardData.tests_by_day_data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </motion.div>
        <motion.div className="lg:col-span-2 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 ring-1 ring-black ring-opacity-5" variants={itemVariants}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Distribución por Nivel</h3>
          <div className="h-80">
             <Pie data={levelDistributionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }} />
          </div>
        </motion.div>
      </div>
      
      {/* --- Sección de Tablas Reutilizables --- */}
      <div className="space-y-8">
        <StudentTable
          title="🚀 Top 5 Estudiantes"
          subtitle="Los estudiantes con el mejor desempeño reciente."
          data={dashboardData.top_performers}
          columns={["Nombre", "Apellido", "Puntaje"]}
          onRowClick={openModal}
        />
        <StudentTable
          title="📉 Bottom 5 Estudiantes"
          subtitle="Estudiantes con puntajes bajos para atención prioritaria."
          data={dashboardData.low_performers}
          columns={["Nombre", "Apellido", "Puntaje"]}
          onRowClick={openModal}
        />
        <StudentTable
          title="⏱️ Últimos 5 Evaluados"
          subtitle="Registro de los estudiantes evaluados más recientemente."
          data={dashboardData.latest_evaluated}
          columns={["Nombre", "Apellido", "Fecha", "Nivel", "Puntaje"]}
        />
      </div>

      {/* --- Modal con Animación --- */}
      <AnimatePresence>
        {isModalOpen && selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Contenido del modal (simplificado, puedes expandirlo como en tu código original) */}
              <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Editar Estudiante</h3>
                <button onClick={closeModal} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">X</button>
              </div>
              <div className="p-6">
                <p className="text-slate-600 dark:text-slate-300">
                  Aquí iría el formulario para editar a <span className="font-bold">{selectedStudent.name} {selectedStudent.lastname}</span>.
                </p>
              </div>
              <div className="flex justify-end p-4 border-t dark:border-slate-700">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">Guardar Cambios</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;