import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import StudentDashboard from "./StudentDashboard";
import { getUserRole } from "../Utils/auth.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userRole = getUserRole()?.toLowerCase();
    if (!userRole) {
      Alert({
        title: "Access Denied",
        text: "You need to log in to access this page.",
        icon: "error",
        background: "#4b7af0",
        color: "white",
      });
      navigate("/login");
    } else {
      setRole(userRole);
    }
  }, [navigate]);

  if (!role)
    return (
      <div className="min-h-screen bg-blue-50 p-6 flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {role === "admin" || role === "teacher" ? (
        <AdminDashboard />
      ) : role === "student" ? (
        <StudentDashboard />
      ) : null}
    </div>
  );
};

export default Dashboard;
