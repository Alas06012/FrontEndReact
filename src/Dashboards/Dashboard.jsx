import React from "react";
import AdminDashboard from './AdminDashboard.jsx';
import StudentDashboard from "./StudentDashboard";

// Simula el rol. Reemplazar con lógica real desde auth/context
const role = "student"; // o "student"
console.log(role);
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {role === "admin" ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
};

export default Dashboard;
