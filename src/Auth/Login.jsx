import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Alert from '../Components/Alert';
import { Link } from 'react-router-dom';
import { setTokens, setUserInfo, getUserRole } from '../Utils/auth.js';
import LogoITCA from '../assets/LogoITCA_Web.png';
import { API_URL } from '/config.js';
import { FiEyeOff, FiEye } from "react-icons/fi";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTime, setLockoutTime] = useState(null);

    const navigate = useNavigate();

    // Check login status
    useEffect(() => {
        const role = getUserRole();
        if (role) {
            navigate(`/dashboard/${role.toLowerCase()}`);
        }

        const storedAttempts = localStorage.getItem('loginAttempts');
        const lockTimestamp = localStorage.getItem('lockTimestamp');

        if (storedAttempts) {
            setLoginAttempts(parseInt(storedAttempts, 10));
        }

        if (lockTimestamp) {
            const now = Date.now();
            const lockTime = parseInt(lockTimestamp, 10);
            if (now < lockTime + 15 * 60 * 1000) {
                setIsLocked(true);
                setLockoutTime(lockTime + 15 * 60 * 1000);
            } else {
                localStorage.removeItem('loginAttempts');
                localStorage.removeItem('lockTimestamp');
            }
        }
    }, []);

    useEffect(() => {
        if (isLocked && lockoutTime) {
            const timer = setInterval(() => {
                const now = Date.now();
                if (now >= lockoutTime) {
                    setIsLocked(false);
                    setLoginAttempts(0);
                    localStorage.removeItem('loginAttempts');
                    localStorage.removeItem('lockTimestamp');
                    clearInterval(timer);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isLocked, lockoutTime]);

    const handleLogin = async (event) => {
        event.preventDefault();
        if (isLocked) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                setTokens(data.access_token, data.refresh_token);
                setUserInfo(data.user);
                localStorage.removeItem('loginAttempts');
                localStorage.removeItem('lockTimestamp');
                const role = getUserRole().toLowerCase();
                navigate(`/dashboard/${role}`);
            } else {
                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);
                localStorage.setItem('loginAttempts', newAttempts.toString());

                if (newAttempts >= 5) {
                    const timestamp = Date.now();
                    localStorage.setItem('lockTimestamp', timestamp.toString());
                    setIsLocked(true);
                    setLockoutTime(timestamp + 15 * 60 * 1000);
                    Alert({
                        title: 'Too many attempts',
                        text: 'You have been locked out for 15 minutes.',
                        icon: 'warning',
                        background: '#4b7af0',
                        color: 'white',
                    });
                } else {
                    Alert({
                        title: '',
                        text: data.message,
                        icon: 'error',
                        background: '#4b7af0',
                        color: 'white',
                    });
                }
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
            setIsLoading(false);
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

                    <div className="mb-4 relative">
                        <label htmlFor="password" className="block text-gray-700">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="**********"
                            required
                        />
                        <span
                            className="absolute top-9 right-3 cursor-pointer text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FiEye /> : <FiEyeOff />}
                        </span>
                        <Link to='/forgot-password' className="block text-right underline text-sm mt-1 text-gray-600 hover:text-Paleta-Celeste transition duration-300 ease-in-out">
                            Forgot password?
                        </Link>
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isLoading || isLocked}
                            className={`w-full py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md transition duration-300 ease-in-out flex justify-center items-center ${
                                (isLoading || isLocked) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Paleta-VerdeSuave'
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
                            ) : isLocked ? (
                                `Try again in ${Math.ceil((lockoutTime - Date.now()) / 60000)} min`
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
