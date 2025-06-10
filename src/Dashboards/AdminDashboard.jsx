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

// === Data ===
const pieData = [
  { name: "A1", value: 20 },
  { name: "A2", value: 30 },
  { name: "B1", value: 25 },
  { name: "B2", value: 25 },
];
const COLORS = ["#4dabf7", "#228be6", "#1c7ed6", "#1864ab"];

const barData = [
  { level: "A2", value: 30 },
  { level: "B1", value: 25 },
  { level: "B2", value: 25 },
];

const progressData = [
  { name: "1", score: 420 },
  { name: "2", score: 500 },
  { name: "3", score: 590 },
  { name: "4", score: 670 },
];

const topStudents = ["Emma Johnson", "Michael Smith", "David Brown", "Sarah Wilson", "John Miller"];
const lowStudents = ["Anna Davis", "James Martin", "Emily White", "Daniel Harris", "Megan Clark"];

const latestEvaluatedStudents = [
  { name: "Carlos Pérez", level: "A2", date: "2025-06-07", score: 340 },
  { name: "Laura Gómez", level: "B1", date: "2025-06-06", score: 410 },
  { name: "Juan Torres", level: "A1", date: "2025-06-06", score: 290 },
];

const activeAssessments = [
  "Nivel A2 - Grammar Test (cierra en 3 días)",
  "Nivel B1 - Listening Assessment (activo)",
  "Nivel B2 - Speaking Evaluation (próximo lunes)",
];

const adminPendingTasks = [
  "3 estudiantes sin asignar nivel",
  "1 evaluación sin publicar resultados",
];

// === Student Dashboard ===
function StudentDashboard() {
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="col-span-1 xl:col-span-3">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Award className="text-blue-600" />
            <p className="text-lg font-medium">Welcome Back, Student</p>
          </div>
          <p className="text-sm text-muted">Level: B1 | Score: 345</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted">Your Level</p>
          <h2 className="text-3xl font-bold">B1</h2>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted">Your Score</p>
          <h2 className="text-3xl font-bold">345</h2>
        </CardContent>
      </Card>

      <Card className="col-span-1 xl:col-span-2">
        <CardContent>
          <p className="mb-2 text-sm text-muted">Progress Over Time</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={progressData}>
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[400, 700]} />
              <Line type="monotone" dataKey="score" stroke="#1c7ed6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <p className="text-sm mb-2 text-muted">Recommendations</p>
          <ul className="list-disc list-inside text-sm text-blue-800">
            <li>Focus on improving your reading skills</li>
            <li>Try a new mock test every 3 days</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted">Your Rank</p>
          <h2 className="text-5xl font-bold">5<sup>th</sup></h2>
        </CardContent>
      </Card>
    </main>
  );
}

// === Admin Dashboard ===
function AdminDashboard() {
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="col-span-1 xl:col-span-3">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" />
            <p className="text-lg font-medium">Welcome Back, Admin</p>
          </div>
          <p className="text-sm text-muted">Total Evaluated: 1,250 | Avg. Score: 670</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted">Students Evaluated</p>
          <h2 className="text-3xl font-bold">1,250</h2>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted">Average Score</p>
          <h2 className="text-3xl font-bold">670</h2>
        </CardContent>
      </Card>

      <Card className="col-span-1 xl:col-span-3">
        <CardContent>
          <p className="mb-2 text-sm text-muted">Level Distribution</p>
          <div className="flex flex-wrap gap-4 justify-around">
            <PieChart width={150} height={150}>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <BarChart width={300} height={150} data={barData}>
              <XAxis dataKey="level" />
              <YAxis />
              <Bar dataKey="value" fill="#228be6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-semibold mb-2">Top 5 Students</h3>
          <ul className="space-y-1">
            {topStudents.map((s, i) => (
              <li key={i} className="text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block mr-2"></span>
                {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-semibold mb-2">Low-Performing Students</h3>
          <ul className="space-y-1">
            {lowStudents.map((s, i) => (
              <li key={i} className="text-sm text-red-600">
                <AlertCircle size={16} className="inline-block mr-2" />
                {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* NUEVO CONTENIDO */}

      <Card className="col-span-1 xl:col-span-3 overflow-auto">
        <CardContent>
          <h3 className="font-semibold mb-3">Últimos Estudiantes Evaluados</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 px-3">Nombre</th>
                <th className="py-2 px-3">Nivel</th>
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {latestEvaluatedStudents.map((s, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-3">{s.name}</td>
                  <td className="py-2 px-3">{s.level}</td>
                  <td className="py-2 px-3">{s.date}</td>
                  <td className="py-2 px-3">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-semibold mb-2">Evaluaciones Activas</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            {activeAssessments.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-semibold mb-2 text-red-600 flex items-center gap-2">
            <AlertCircle size={18} />
            Pendientes Administrativos
          </h3>
          <ul className="text-sm text-red-800 list-disc list-inside">
            {adminPendingTasks.map((task, i) => (
              <li key={i}>{task}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}

// === Dashboard Wrapper ===
export default function Dashboard({ role = "admin" }) {
  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {role === "admin" ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
}
