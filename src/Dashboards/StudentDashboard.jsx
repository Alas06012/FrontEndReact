import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import { AlertCircle, Lightbulb, XCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import Alert from "../Components/Alert";
import Card from "../Components/ui/card";
import { API_URL } from "../../config";
import { ChartJSLine } from "../Components/ui/Charts";
import { motivationalMessages } from "../Utils/motivational-messages";

function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Determinar el sufijo del rank
  const getRankSuffix = (rank) => {
    if (rank % 100 >= 11 && rank % 100 <= 13) return "th";
    switch (rank % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  // Seleccionar una frase motivacional aleatoria
  const getRandomMotivationalMessage = () => {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    return motivationalMessages[randomIndex];
  };

  // Preparar datos para el gráfico
  const chartData = dashboardData.test_history
    .map((item) => ({
      name: item.date,
      score: item.score,
    }))
    .reverse(); // Invertir el orden para mostrar de más antiguo a más reciente

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="col-span-full space-y-6">
        <Card title="Student Dashboard Overview" bgColor="bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Current Level" bgColor="bg-blue-50">
              <h2 className="text-3xl font-bold text-blue-700 text-center">
                {dashboardData.current_level}
              </h2>
            </Card>
            <Card title="Last Score" bgColor="bg-blue-50">
              <h2 className="text-3xl font-bold text-blue-700 text-center">
                {dashboardData.score}
              </h2>
            </Card>
            <Card title="Tests Done" bgColor="bg-blue-50">
              <h2 className="text-3xl font-bold text-blue-700 text-center">
                {dashboardData.test_done}
              </h2>
            </Card>
          </div>
        </Card>

        <Card title="Your Progress (Last 5 Attempts)" bgColor="bg-blue-50">
          {chartData.length > 0 ? (
            <BarChart
              data={chartData}
              dataKey="score" // Clave para los valores (puntuaciones)
              title="Your Progress (Last 5 Attempts)"
              xAxisLabel="Attempts"
              yAxisLabel="Score"
              colors={{
                background: "rgba(28, 126, 214, 0.5)",
                border: "#1c7ed6",
              }}
            />
          ) : (
            <p className="text-center text-gray-500">
              No data available for chart.
            </p>
          )}
        </Card>

        <Card
          title="Motivational Message"
          bgColor="bg-green-50"
          className="text-center"
        >
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

        <Card title="Your Rank" bgColor="bg-blue-50" className="text-center">
          <h2 className="text-4xl font-bold text-blue-700">
            {dashboardData.rank}
            <sup>{getRankSuffix(dashboardData.rank)}</sup>
          </h2>
        </Card>
      </div>
    </main>
  );
}

// Reusable section for recommendations, strengths, weaknesses
function InfoSection({ icon, title, text, color }) {
  return (
    <section
      className={`bg-gradient-to-tr from-${color}-100 to-${color}-50 border border-${color}-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6`}
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
