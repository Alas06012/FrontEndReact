import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Alert from '../Components/Alert';
import { Link } from 'react-router-dom';
import { setTokens, setUserInfo, getUserName, getUserRole } from '../Utils/auth.js';
import LogoITCA from '../assets/LogoITCA_Web.png'
import { API_URL } from '../../config.js';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Nuevo estado para loading
    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        const role = getUserRole();
        if (role) {
            navigate(`/dashboard/${role.toLowerCase()}`);
        }
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true); // Activa loading

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                setTokens(data.access_token, data.refresh_token);
                setUserInfo(data.user);
                const role = getUserRole().toLowerCase();
                navigate(`/dashboard/${role}`);
            } else {
                Alert({
                    title: '',
                    text: data.message,
                    icon: 'error',
                    background: '#4b7af0',
                    color: 'white',
                });
            }
        } catch (error) {
            Alert({
                title: 'Error',
                text: error.toString(),
                icon: 'error',
                background: '#4b7af0',
                color: 'white',
            });
        } finally {
            setIsLoading(false); // Siempre desactiva loading al terminar
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-Paleta-GrisClaro">
            <div className="w-full max-w-sm bg-Paleta-Blanco rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <img src={LogoITCA} alt="Logo ITCA" />
                    <h2 className="mt-4 text-xl font-bold text-black">
                        Log in with your credentials
                    </h2>
                </div>

                <hr className="my-4 border-t-2 border-gray-300" />

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Example: user01@itca.edu.sv"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="**********"
                            required
                        />
                        <Link to='/forgot-password' className="block text-right underline text-sm mt-1 text-gray-600 hover:text-Paleta-Celeste transition duration-300 ease-in-out">
                            Forgot password?
                        </Link>
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md transition duration-300 ease-in-out flex justify-center items-center ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Paleta-VerdeSuave'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        ></path>
                                    </svg>
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <Link to='/register' className="block text-sm mt-4 text-gray-600 hover:text-Paleta-Celeste transition duration-300 ease-in-out">
                            Don't have an account? Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
