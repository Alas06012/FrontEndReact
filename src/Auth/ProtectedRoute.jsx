import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/fetchWithAuth.js';
import { getUserRole } from '../Utils/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetchWithAuth('http://localhost:5000/auth/verify', {
                    method: 'GET',
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                    setUserRole(getUserRole());
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error verificando token:', error);
                setIsAuthenticated(false);
            }
        };

        verifyToken();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-dashed rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-purple-400">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificación de roles si se especifican
    if (allowedRoles && !allowedRoles.includes(userRole?.toLowerCase())) {
        return <Navigate to={`/dashboard/${userRole?.toLowerCase()}`} replace />;
    }

    return children;
};

export default ProtectedRoute;