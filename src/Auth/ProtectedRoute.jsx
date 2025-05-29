import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchWithAuth } from '../Utils/fetchWithAuth.js';
import { getUserRole, logout } from '../Utils/auth';
import { API_URL } from '/config.js';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}/auth/verify`, {
                    method: 'GET',
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUserRole(data.role?.toLowerCase());
                } else {
                    throw new Error('Unauthorized');
                }
            } catch (error) {
                console.error('Error verifying token:', error.message);
                logout(); // Limpia tokens
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
                    <p className="text-lg text-purple-400">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Usuario autenticado pero sin permiso para esta ruta
        return <Navigate to={`/dashboard/${userRole}`} replace />;
    }

    return children;
};

export default ProtectedRoute;
