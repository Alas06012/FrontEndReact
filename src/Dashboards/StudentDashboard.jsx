import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { API_URL } from "../../config";
import { motivationalMessages } from "../Utils/motivational-messages";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  LightBulbIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

// Registrar Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
// --- Componente Reutilizable y Rediseñado para Secciones de Información ---
const InfoSection = ({ icon, title, items, color }) => {
  // Mapeo de estilos mejorado
  const colorStyles = {
    green: {
      bg: "bg-green-50/80 hover:bg-green-50 dark:bg-slate-800/95 dark:hover:bg-slate-800 transition-colors",
      iconContainer: "bg-green-100 dark:bg-green-900/50",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-900 dark:text-green-200",
      text: "text-green-800/90 dark:text-green-100/90",
      border: "ring-green-200 dark:ring-green-900/50",
    },
    red: {
      bg: "bg-red-50/80 hover:bg-red-50 dark:bg-slate-800/95 dark:hover:bg-slate-800 transition-colors",
      iconContainer: "bg-red-100 dark:bg-red-900/50",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-900 dark:text-red-200",
      text: "text-red-800/90 dark:text-red-100/90",
      border: "ring-red-200 dark:ring-red-900/50",
    },
    blue: {
      bg: "bg-blue-50/80 hover:bg-blue-50 dark:bg-slate-800/95 dark:hover:bg-slate-800 transition-colors transition-colors",
      iconContainer: "bg-blue-100 dark:bg-blue-900/50",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-200",
      text: "text-blue-800/90 dark:text-blue-100/90",
      border: "ring-blue-200 dark:ring-blue-900/50",
    },
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`shadow-lg rounded-xl p-6 ring-1 ${styles.border} flex flex-col h-full ${styles.bg} transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* Encabezado de la tarjeta */}
      <div className="flex items-center mb-4">
        <div
          className={`flex-shrink-0 p-3 rounded-lg ${styles.iconContainer} transition-colors`}
        >
          {React.cloneElement(icon, { 
            className: `h-6 w-6 ${styles.icon} transition-colors`,
            "aria-hidden": true 
          })}
        </div>
        <h3 className={`ml-4 text-lg font-semibold ${styles.title} transition-colors`}>
          {title}
        </h3>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="flex-grow">
        {items && items.length > 0 ? (
          <div className={`space-y-3 ${styles.text} leading-relaxed transition-colors`}>
            {items.map((item, index) => (
              <>
              {item}
              </>
            ))}
          </div>
        ) : (
          <p className={`text-sm italic ${styles.text} opacity-70 transition-colors`}>
            No hay datos disponibles por el momento.
          </p>
        )}
      </div>
    </div>
  );
};

// --- Componente Principal del Dashboard ---
function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token)
          throw new Error(
            "No se encontró el token de acceso. Por favor, inicie sesión."
          );

        const response = await fetch(`${API_URL}/student-dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (response.status === 404 && result.data === false) {
          setDashboardData(null);
          return;
        }
        if (!response.ok) {
          throw new Error(
            result.message || "No se pudieron cargar los datos del dashboard."
          );
        }
        setDashboardData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
            Error al cargar
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <motion.div
          className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LightBulbIcon className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            ¡Tu viaje de aprendizaje comienza ahora!
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Realiza tu primera prueba de nivel para que podamos empezar a
            registrar tu progreso, descubrir tus fortalezas y ofrecerte
            recomendaciones personalizadas.
          </p>
        </motion.div>
      </div>
    );
  }

  // --- Procesamiento y Configuración de Datos ---
  const motivationalMessage =
    motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
    ];
  const stats = [
    {
      name: "Nivel Actual",
      value: dashboardData.current_level,
      icon: CheckBadgeIcon,
      type: "stat",
    },
    {
      name: "Último Puntaje",
      value: dashboardData.score,
      icon: ChartBarIcon,
      type: "stat",
    },
    {
      name: "Tests Realizados",
      value: dashboardData.test_done,
      icon: DocumentTextIcon,
      type: "stat",
    },
    {
      name: "Mensaje para ti",
      value: motivationalMessage,
      icon: SparklesIcon,
      type: "message",
    },
  ];

  const progressData = {
    labels: dashboardData.test_history
      .slice(-7)
      .map((item) =>
        new Date(item.date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        })
      ),
    datasets: [
      {
        label: "Puntaje",
        data: dashboardData.test_history.slice(-7).map((item) => item.score),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 1)",
        tension: 0.3,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointHoverRadius: 7,
        pointRadius: 5,
      },
    ],
  };

  // --- Animaciones ---
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
      className="p-4 sm:p-6 lg:p-8 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* --- Sección de Estadísticas --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 flex items-start space-x-4 ring-1 ring-black ring-opacity-5"
            variants={itemVariants}
          >
            <div className="dark:bg-blue-900/50 p-3 rounded-full flex-shrink-0">
              <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.name}
              </p>
              {stat.type === "message" ? (
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  "{stat.value}"
                </p>
              ) : (
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- Gráfico de Progreso --- */}
      <motion.div
        className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 ring-1 ring-black ring-opacity-5 mb-8"
        variants={itemVariants}
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Tu Progreso (Últimos 7 Tests)
        </h3>
        <div className="h-80">
          <Line
            data={progressData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </motion.div>

      {/* --- Secciones de Información (DISEÑO MEJORADO) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <InfoSection
            icon={<CheckCircleIcon />}
            title="Fortalezas"
            items={dashboardData.strengths}
            color="green"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <InfoSection
            icon={<XCircleIcon />}
            title="Áreas de Mejora"
            items={dashboardData.weaknesses}
            color="red"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <InfoSection
            icon={<LightBulbIcon />}
            title="Recomendaciones"
            items={dashboardData.recommendations}
            color="blue"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default StudentDashboard;