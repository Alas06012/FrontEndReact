import React from "react";
import { Card, CardContent } from "../Components/ui/card";
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
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  Users,
  BarChart2,
  TrendingUp,
  Award,
} from "lucide-react";

function AdminDashboard() {
  const [dashboardData] = useState({
    totalEvaluated: 1250,
    averageScore: 670,
    pieData: [
      { name: "A1", value: 20 },
      { name: "A2", value: 30 },
      { name: "B1", value: 25 },
      { name: "B2", value: 25 },
    ],
    barData: [
      { level: "A2", value: 30 },
      { level: "B1", value: 25 },
      { level: "B2", value: 25 },
    ],
    progressData: [
      { name: "1", score: 420 },
      { name: "2", score: 500 },
      { name: "3", score: 590 },
      { name: "4", score: 670 },
    ],
    topStudents: ["Emma Johnson", "Michael Smith", "David Brown", "Sarah Wilson", "John Miller"],
    lowStudents: ["Anna Davis", "James Martin", "Emily White", "Daniel Harris", "Megan Clark"],
    latestEvaluatedStudents: [
      { name: "Carlos Pérez", level: "A2", date: "2025-06-07", score: 340 },
      { name: "Laura Gómez", level: "B1", date: "2025-06-06", score: 410 },
      { name: "Juan Torres", level: "A1", date: "2025-06-06", score: 290 },
    ],
    activeAssessments: [
      "Nivel A2 - Grammar Test (cierra en 3 días)",
      "Nivel B1 - Listening Assessment (activo)",
      "Nivel B2 - Speaking Evaluation (próximo lunes)",
    ],
    adminPendingTasks: [
      "3 estudiantes sin asignar nivel",
      "1 evaluación sin publicar resultados",
    ],
  });

  const COLORS = ["#4dabf7", "#228be6", "#1c7ed6", "#1864ab"];

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <Card title="Admin Dashboard Overview" bgColor="bg-blue-50" className="col-span-1 xl:col-span-3">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={24} />
            <p className="text-lg font-medium">Welcome Back, Admin</p>
          </div>
          <p className="text-sm text-gray-500">Total Evaluated: {dashboardData.totalEvaluated} | Avg. Score: {dashboardData.averageScore}</p>
        </div>
      </Card>

      <Card title="Students Evaluated" bgColor="bg-blue-50">
        <div className="py-4 text-center">
          <h2 className="text-3xl font-bold text-blue-700">{dashboardData.totalEvaluated}</h2>
        </div>
      </Card>

      <Card title="Average Score" bgColor="bg-blue-50">
        <div className="py-4 text-center">
          <h2 className="text-3xl font-bold text-blue-700">{dashboardData.averageScore}</h2>
        </div>
      </Card>

      <Card title="Level Distribution" bgColor="bg-blue-50" className="col-span-1 xl:col-span-3">
        <div className="py-4">
          <ResponsiveContainer width="100%" height={200}>
            <div className="flex flex-wrap gap-4 justify-around">
              <PieChart>
                <Pie
                  data={dashboardData.pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
              <BarChart data={dashboardData.barData}>
                <XAxis dataKey="level" />
                <YAxis />
                <Bar dataKey="value" fill="#228be6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </div>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Top 5 Students" bgColor="bg-blue-50">
        <div className="py-4">
          <ul className="space-y-1">
            {dashboardData.topStudents.map((s, i) => (
              <li key={i} className="text-sm flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block mr-2"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card title="Low-Performing Students" bgColor="bg-red-50">
        <div className="py-4">
          <ul className="space-y-1">
            {dashboardData.lowStudents.map((s, i) => (
              <li key={i} className="text-sm flex items-center text-red-600">
                <AlertCircle size={16} className="mr-2" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card title="Latest Evaluated Students" bgColor="bg-blue-50" className="col-span-1 xl:col-span-3">
        <div className="py-4 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left bg-gray-100">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Level</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.latestEvaluatedStudents.map((s, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-4">{s.name}</td>
                  <td className="py-2 px-4">{s.level}</td>
                  <td className="py-2 px-4">{s.date}</td>
                  <td className="py-2 px-4">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Active Assessments" bgColor="bg-blue-50">
        <div className="py-4">
          <ul className="text-sm space-y-1 list-disc list-inside">
            {dashboardData.activeAssessments.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </Card>

      <Card title="Pending Administrative Tasks" bgColor="bg-red-50">
        <div className="py-4">
          <ul className="text-sm text-red-800 list-disc list-inside">
            {dashboardData.adminPendingTasks.map((task, i) => (
              <li key={i}>{task}</li>
            ))}
          </ul>
        </div>
      </Card>
    </main>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <AdminDashboard />
    </div>
  );
}