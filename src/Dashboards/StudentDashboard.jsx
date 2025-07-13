import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { API_URL } from "../../config";
import { motivationalMessages } from "../Utils/motivational-messages";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  CheckBadgeIcon,
  CheckCircleIcon,
  LightBulbIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

// Register Chart.js
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

// --- Component: Information Sections ---
const InfoSection = ({ icon, title, items, color }) => {
  const colorStyles = {
    green: {
      // ANTES: bg: "bg-green-50/80..."
      // AHORA: bg: "bg-green-50 bg-opacity-80..." (y así para los demás)
      bg: "bg-green-50 bg-opacity-80 hover:bg-green-50 dark:bg-slate-800 dark:bg-opacity-95 dark:hover:bg-slate-800",
      iconContainer: "bg-green-100 dark:bg-green-900 dark:bg-opacity-50",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-900 dark:text-green-200",
      text: "text-green-800 text-opacity-90 dark:text-green-100 dark:text-opacity-90",
      border: "ring-green-200 dark:ring-green-900 dark:ring-opacity-50",
      listIcon: CheckCircleIcon,
    },
    red: {
      bg: "bg-red-50 bg-opacity-80 hover:bg-red-50 dark:bg-slate-800 dark:bg-opacity-95 dark:hover:bg-slate-800",
      iconContainer: "bg-red-100 dark:bg-red-900 dark:bg-opacity-50",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-900 dark:text-red-200",
      text: "text-red-800 text-opacity-90 dark:text-red-100 dark:text-opacity-90",
      border: "ring-red-200 dark:ring-red-900 dark:ring-opacity-50",
      listIcon: XCircleIcon,
    },
    blue: {
      bg: "bg-blue-50 bg-opacity-80 hover:bg-blue-50 dark:bg-slate-800 dark:bg-opacity-95 dark:hover:bg-slate-800",
      iconContainer: "bg-blue-100 dark:bg-blue-900 dark:bg-opacity-50",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-200",
      text: "text-blue-800 text-opacity-90 dark:text-blue-100 dark:text-opacity-90",
      border: "ring-blue-200 dark:ring-blue-900 dark:ring-opacity-50",
      listIcon: LightBulbIcon,
    },
  };

  const styles = colorStyles[color] || colorStyles.blue;
  const ListItemIcon = styles.listIcon;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`shadow-lg rounded-xl p-6 ring-1 ${styles.border} flex flex-col h-full ${styles.bg} transition-all hover:shadow-xl hover:-translate-y-1`}
    >
      <motion.div variants={itemVariants} className="flex items-center mb-4">
        <div className={`flex-shrink-0 p-3 rounded-lg ${styles.iconContainer}`}>
          {React.cloneElement(icon, {
            className: `h-6 w-6 ${styles.icon}`,
            "aria-hidden": true
          })}
        </div>
        <h3 className={`ml-4 text-lg font-semibold ${styles.title}`}>{title}</h3>
      </motion.div>
      <motion.div variants={itemVariants} className="flex-grow">
        {items && items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <ListItemIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
                <span className={`text-sm ${styles.text} leading-relaxed`}>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm italic ${styles.text} opacity-70`}>No data available at this time.</p>
        )}
      </motion.div>
    </motion.div>
  );
};

// --- Main Dashboard Component ---
function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Access token not found. Please log in.");

        const response = await fetch(`${API_URL}/student-dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (response.status === 404 && result.data === false) {
          setDashboardData(null);
          return;
        }
        if (!response.ok) {
          throw new Error(result.message || "Could not load dashboard data.");
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

  const handleExportPDF = () => {
    const input = dashboardRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const pdfHeight = pdfWidth / ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("progress_report.pdf");
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Loading Error</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <motion.div
          className="text-center bg-white p-8 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LightBulbIcon className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Your learning journey starts now!</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Take your first placement test so we can start tracking your progress, discover your strengths, and provide personalized recommendations.
          </p>
        </motion.div>
      </div>
    );
  }

  const motivationalMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  const stats = [
    { name: "Current Level", value: dashboardData.current_level, icon: CheckBadgeIcon, type: "stat" },
    { name: "Latest Score", value: dashboardData.score, icon: ChartBarIcon, type: "stat" },
    { name: "Tests Completed", value: dashboardData.test_done, icon: DocumentTextIcon, type: "stat" },
    { name: "Message for You", value: motivationalMessage, icon: SparklesIcon, type: "message" },
  ];

  const progressData = {
    labels: dashboardData.test_history
      .slice(-7)
      .map((item) => {
        const parts = item.date.split(' ');
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        return new Date(formattedDate).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      }),
    datasets: [
      {
        label: "Score",
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
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 justify-center gap-5 mb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex items-center gap-4"
        >
          <motion.div variants={itemVariants} className="bg-blue-900 p-3 rounded-xl">
            <ChartBarIcon className="h-8 w-8 text-blue-400" />
          </motion.div>
          <div>
            <motion.h1
              variants={itemVariants}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              My Progress
            </motion.h1>
            <motion.p variants={itemVariants} className="text-sm text-slate-500">
              An overview of your performance and progress.
            </motion.p>
          </div>
        </motion.div>

        {/* <div className="flex justify-end mx-4">
          <button
            onClick={handleExportPDF}
            className="flex items-center max-w-40 gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 ring-1 ring-inset ring-blue-200 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <div className="bg-blue-900 p-2 rounded-full flex-shrink-0">
              <ArrowDownTrayIcon className="h-4 w-4 text-blue-400" />
            </div>
            <span>Export PDF</span>
          </button>
        </div> */}

      </motion.div>

      <div ref={dashboardRef} className="p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.name}
              className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 flex items-start space-x-4 ring-1 ring-black ring-opacity-5"
              variants={itemVariants}
            >
              <div className="bg-blue-100 dark:bg-blue-900 dark:bg-opacity-50 p-3 rounded-full flex-shrink-0">
                <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                {stat.type === "message" ? (
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">"{stat.value}"</p>
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 ring-1 ring-black ring-opacity-5 mb-8"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Progress (Last 7 Tests)</h3>
          <div className="h-80">
            <Line data={progressData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <InfoSection icon={<CheckCircleIcon />} title="Strengths" items={dashboardData.strengths} color="green" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <InfoSection icon={<XCircleIcon />} title="Areas for Improvement" items={dashboardData.weaknesses} color="red" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <InfoSection icon={<LightBulbIcon />} title="Recommendations" items={dashboardData.recommendations} color="blue" />
          </motion.div>
        </div>
        <df-messenger
          location="us-east1"
          project-id="necdiagnostics-tesis"
          agent-id="74180c1b-a688-4176-a28d-a82b260e5c7e"
          language-code="es"
          max-query-length="-1">
          <df-messenger-chat-bubble
            chat-title="NECBot">
          </df-messenger-chat-bubble>
        </df-messenger>
      </div>
    </motion.div>
  );
}

export default StudentDashboard;