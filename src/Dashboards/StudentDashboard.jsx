import React, { useState, useEffect } from "react";
import { API_URL } from "../../config.js"; // Asegúrate de tener este archivo con la URL base
import Alert from "../Components/Alert.jsx"; // Asegúrate de tener este componente
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import Card from "../components/ui/Card.jsx";
import { Lightbulb, XCircle } from "lucide-react";
import { ChartJSLine } from "../Components/ui/Charts.jsx";

function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState({
    user_id: "",
    user_name: "",
    user_lastname: "",
    currentLevel: "",
    score: 0,
    testDone: 0,
    testHistory: [],
    recommendations: [],
    strengths: [],
    weaknesses: [],
    rank: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Usa el token almacenado
        if (!token) throw new Error("No token found. Please log in.");

        const response = await fetch(`${API_URL}/student-dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData({
            user_id: data.data.user_id || "",
            user_name: data.data.user_name || "",
            user_lastname: data.data.user_lastname || "",
            currentLevel: data.data.current_level || "",
            score: data.data.score || 0,
            testDone: data.data.test_done || 0,
            testHistory: data.data.test_history || [],
            recommendations: data.data.recommendations || [],
            strengths: data.data.strengths || [],
            weaknesses: data.data.weaknesses || [],
            rank: data.data.rank || 0,
            loading: false,
            error: null,
          });
        } else {
          const errorData = await response.json();
          Alert({
            title: "Error",
            text: errorData.error || "Failed to fetch dashboard data",
            icon: "error",
            background: "#4b7af0",
            color: "white",
          });
          setDashboardData((prev) => ({
            ...prev,
            loading: false,
            error: "Failed to fetch data",
          }));
        }
      } catch (error) {
        Alert({
          title: "Error",
          text: "Network error occurred",
          icon: "error",
          background: "#4b7af0",
          color: "white",
        });
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: "Network error occurred",
        }));
      }
    };

    fetchDashboardData();
  }, []);

  if (dashboardData.loading) return <div className="text-center p-6">Loading...</div>;
  if (dashboardData.error) return <div className="text-center p-6 text-red-600">Error: {dashboardData.error}</div>;

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="col-span-full">
        <Card title="Student Dashboard Overview" bgColor="bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card title="My Last Level" bgColor="bg-blue-50" className="p-2">
                <h2 className="text-3xl font-bold text-blue-700 text-center">
                  {dashboardData.currentLevel}
                </h2>
              </Card>
              <Card title="Last Score" bgColor="bg-blue-50" className="p-2">
                <h2 className="text-3xl font-bold text-blue-700 text-center">
                  {dashboardData.score}
                </h2>
              </Card>
              <Card title="Tests Done" bgColor="bg-blue-50" className="p-2">
                <h2 className="text-3xl font-bold text-blue-700 text-center">
                  {dashboardData.testDone}
                </h2>
              </Card>
              <Card
                title="Motivational Message"
                bgColor="bg-green-50"
                className="p-2 mt-4 md:mt-0 col-span-3"
              >
                <p className="text-sm text-green-800 text-center">
                  Keep pushing forward! Every test brings you closer to your goals. Stay motivated and continue learning!
                </p>
              </Card>
            </div>
            <Card title="Your Progress in the Last 5 Attempts" bgColor="bg-blue-50" className="p-2">
              <ChartJSLine data={dashboardData.testHistory} />
              {/**
               <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dashboardData.testHistory}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={[400, 700]} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#1c7ed6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
               */}
            </Card>
          </div>
          <section className="bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6 mt-4">
            <div className="flex-shrink-0 text-blue-800">
              <Lightbulb className="w-10 h-10" />
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-semibold mb-3">Recommendations</h3>
              <ul className="list-disc list-inside text-base text-blue-900">
                {dashboardData.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </section>
          <section className="bg-gradient-to-tr from-green-100 to-green-50 border border-green-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6 mt-4">
            <div className="flex-shrink-0 text-green-800">
              <Lightbulb className="w-10 h-10" />
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-semibold mb-3">Strengths</h3>
              <ul className="list-disc list-inside text-base text-green-900">
                {dashboardData.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          </section>
          <section className="bg-gradient-to-tr from-red-100 to-red-50 border border-red-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6 mt-4">
            <div className="flex-shrink-0 text-red-800">
              <XCircle className="w-10 h-10" />
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-semibold mb-3">Weaknesses</h3>
              <ul className="list-disc list-inside text-base text-red-900">
                {dashboardData.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
          </section>
          <Card
            title="Your Rank"
            bgColor="bg-blue-50"
            className="mt-4 text-center p-2"
          >
            <h2 className="text-4xl font-bold text-blue-700">
              {dashboardData.rank}
              <sup>th</sup>
            </h2>
          </Card>
        </Card>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <StudentDashboard />
    </div>
  );
}