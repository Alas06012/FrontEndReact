import {
  Pie,
  Line,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AlertCircle, Lightbulb, XCircle } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Alert from "../Components/Alert";
import Card from "../Components/ui/card";
import { API_URL } from "../../config";
import { motivationalMessages } from "../Utils/motivational-messages"; 

// Registrar los elementos de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lineChartRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found. Please log in.");

      const response = await fetch(`${API_URL}/student-dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.status === 404 && result.data === false) {
        setDashboardData(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }

      setDashboardData(result.data);
    } catch (err) {
      setError(err.message);
      Alert({
        title: "Error",
        text: err.message,
        icon: "error",
        background: "#4b7af0",
        color: "white",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Seleccionar una frase motivacional aleatoria
  const getRandomMotivationalMessage = () => {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    return motivationalMessages[randomIndex];
  };

  // Procesar datos para el gráfico de progreso
  const processProgressData = (testHistory) => {
    const recentTests = testHistory.slice(-5).reverse(); // Últimos 5 intentos, de más antiguo a reciente
    return {
      labels: recentTests.map(item => item.date),
      datasets: [
        {
          label: "Score",
          data: recentTests.map(item => item.score),
          borderColor: "#60A5FA",
          backgroundColor: "rgba(96, 165, 250, 0.2)", // Fondo semitransparente para el área bajo la línea
          tension: 0.4, // Curva suave
          fill: true, // Relleno bajo la línea
          pointRadius: 5, // Tamaño de los puntos
          pointBackgroundColor: "#60A5FA", // Color de los puntos
        },
      ],
    };
  };

  // Destruir gráfico anterior al actualizar
  useEffect(() => {
    return () => {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
    };
  }, []);

  if (loading) return <div className="text-center p-6">Loading...</div>;

  if (!dashboardData) {
    return (
      <main className="p-6">
        <Card title="" bgColor="bg-yellow-50" className="text-center">
          <div className="flex flex-col items-center space-y-3 p-4">
            <Lightbulb className="w-10 h-10 text-yellow-500" />
            <p className="text-yellow-800 text-lg font-semibold">
              Hi there! Your journey hasn't begun.
            </p>
            <p className="text-sm text-yellow-700 max-w-md">
              Take your first test to start tracking your progress, strengths,
              and personalized recommendations
            </p>
          </div>
        </Card>
      </main>
    );
  }

  const stats = [
    { id: 1, name: "Current Level", value: dashboardData.current_level },
    { id: 2, name: "Last Score", value: dashboardData.score },
    { id: 3, name: "Tests Done", value: dashboardData.test_done },
  ];

  const progressData = processProgressData(dashboardData.test_history);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Stats Section */}
      <div className="bg-white py-12 sm:py-16 mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:gap-y-12 lg:grid-cols-3 text-center">
          {stats.map((stat) => (
            <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-3">
              <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
              <dd className="order-first text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
        <Card title="Your Progress (Last 5 Attempts)" bgColor="bg-white">
          <Line
            ref={lineChartRef}
            data={progressData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Your Progress (Last 5 Attempts)" },
              },
              scales: {
                x: { title: { display: true, text: "Date" } },
                y: {
                  beginAtZero: false,
                  min: 10, // Mínimo ajustado a 10
                  max: 990, // Máximo ajustado a 990
                  title: { display: true, text: "Score" },
                  ticks: {
                    display: true,
                    stepSize: 1000, // Paso de 50 para legibilidad (ajustable)
                  },
                },
              },
            }}
          />
        </Card>
      </div>

      <Card title="Motivational Message" bgColor="bg-green-50" className="text-center mt-6">
        <p className="text-sm text-green-800">
          {getRandomMotivationalMessage()}
        </p>
      </Card>

      <InfoSection
        icon={<Lightbulb className="w-8 h-8 text-blue-800" />}
        title="Recommendations"
        text={dashboardData.recommendations.join(" ")}
        color="blue"
      />

      <InfoSection
        icon={<Lightbulb className="w-8 h-8 text-green-800" />}
        title="Strengths"
        text={dashboardData.strengths.join(" ")}
        color="green"
      />

      <InfoSection
        icon={<XCircle className="w-8 h-8 text-red-800" />}
        title="Weaknesses"
        text={dashboardData.weaknesses.join(" ")}
        color="red"
      />
    </div>
  );
}

// Reusable section for recommendations, strengths, weaknesses
function InfoSection({ icon, title, text, color }) {
  return (
    <section
      className={`bg-gradient-to-tr from-${color}-100 to-${color}-50 border border-${color}-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6 mt-6`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-grow">
        <h3 className="text-2xl font-semibold mb-3">{title}</h3>
        {text ? (
          <p className="text-base text-gray-800 text-justify">{text}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">No data available.</p>
        )}
      </div>
    </section>
  );
}

export default StudentDashboard;