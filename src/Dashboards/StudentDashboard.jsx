import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line } from "recharts";
import { AlertCircle } from "lucide-react";

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

function StudentDashboard() {
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Card><CardContent><p>My Level</p><h2 className="text-2xl font-bold">B1</h2></CardContent></Card>
          <Card><CardContent><p>Score</p><h2 className="text-2xl font-bold">345</h2></CardContent></Card>
        </div>
        <Card>
          <CardContent>
            <p>Your Progress</p>
            <LineChart width={300} height={120} data={progressData}>
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[400, 700]} />
              <Line type="monotone" dataKey="score" stroke="#1c7ed6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p>Recommendations</p>
            <ul className="list-disc list-inside text-sm text-blue-800">
              <li>Focus on improving your reading skills</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p>Your Rank</p>
            <h2 className="text-4xl font-bold">5<sup>th</sup></h2>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function AdminDashboard() {
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Card><CardContent><p>Students Evaluated</p><h2 className="text-3xl font-bold">1,250</h2></CardContent></Card>
          <Card><CardContent><p>Average Score</p><h2 className="text-3xl font-bold">670</h2></CardContent></Card>
        </div>
        <Card>
          <CardContent>
            <h3>Level Distribution</h3>
            <div className="flex justify-around">
              <PieChart width={120} height={120}>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={50} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
              <BarChart width={150} height={120} data={barData}>
                <XAxis dataKey="level" />
                <YAxis />
                <Bar dataKey="value" fill="#228be6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Card><CardContent><h3>Top 5 Students</h3><ul className="space-y-1">{topStudents.map((s, i) => <li key={i}><span className="w-2 h-2 rounded-full bg-blue-600 inline-block mr-2"></span>{s}</li>)}</ul></CardContent></Card>
          <Card><CardContent><h3>Low-Performing Students</h3><ul className="space-y-1">{lowStudents.map((s, i) => <li key={i} className="text-red-600"><AlertCircle size={16} className="inline-block mr-2" />{s}</li>)}</ul></CardContent></Card>
        </div>
      </section>
    </main>
  );
}

export default function Dashboard({ role = "student" }) {
  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {role === "admin" ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
}
