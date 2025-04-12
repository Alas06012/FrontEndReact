import { Link } from "react-router-dom";

// src/Others/NotAuthorized.jsx
const NotAuthorized = () => {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso no autorizado</h1>
          <p className="mb-4">No tienes permisos para acceder a esta página</p>
          <Link 
            to="/dashboard" 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  };
  
  export default NotAuthorized;