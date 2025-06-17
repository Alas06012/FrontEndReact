import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Alert from '../Components/Alert';
import { Link } from 'react-router-dom';
import { setTokens, setUserInfo, getUserRole } from '../Utils/auth.js';
import LogoITCA from '../assets/LogoITCA_Web.png';
import { API_URL } from '/config.js';
import { FiEyeOff, FiEye, FiLock, FiMail, FiLogIn, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTime, setLockoutTime] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    const navigate = useNavigate();

    // Check login status (same as original)
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md sm:max-w-lg md:max-w-md">
                {/* Logo ITCA arriba del cuadro de login */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                >
                    <img
                        src={LogoITCA}
                        alt="Logo ITCA"
                        className="h-20 mx-auto"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                        scale: { delay: 0.1, duration: 0.5 }
                    }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-center relative overflow-hidden">
                        {/* Burbujas múltiples con movimiento aleatorio */}
                        {[1, 2, 3, 4].map((i) => (
                            <motion.div
                                key={i}
                                className={`absolute rounded-full bg-white/${i % 2 ? 10 : 5}`}
                                style={{
                                    width: `${40 + i * 10}px`,
                                    height: `${40 + i * 10}px`,
                                    top: `${0 + i * 15}%`,
                                    left: `${i * 20}%`,
                                }}
                                animate={{
                                    y: [0, (i % 2 ? -1 : 1) * (10 + i * 5), 0],
                                    x: [0, (i % 2 ? -1 : 1) * (5 + i * 3), 0],
                                }}
                                transition={{
                                    duration: 10 + i * 2,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut",
                                    delay: i * 0.5,
                                }}
                            />
                        ))}

                        {/* Contenido principal */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-block bg-white/10 p-5 rounded-full backdrop-blur-sm border border-white/20"
                        >
                            <FiUser className="text-white text-3xl" />
                        </motion.div>
                        <h2 className="mt-6 text-3xl font-bold text-white">
                            Welcome Back
                        </h2>
                        <p className="text-blue-100/90 mt-3 text-lg">
                            Please enter your credentials to login
                        </p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleLogin}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.2 }}
                                className="mb-6"
                            >
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@itca.edu.sv"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.2 }}
                                className="mb-6"
                            >
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <motion.div
                                            key={showPassword ? 'visible' : 'hidden'}
                                            initial={{ rotate: -10, opacity: 0.7 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {showPassword ? (
                                                <FiEye className="text-gray-500 hover:text-blue-600 transition" />
                                            ) : (
                                                <FiEyeOff className="text-gray-500 hover:text-blue-600 transition" />
                                            )}
                                        </motion.div>
                                    </button>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Link
                                        to='/forgot-password'
                                        className="text-sm text-blue-600 hover:text-blue-800 transition duration-200"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.2 }}
                                className="mb-6"
                            >
                                <motion.button
                                    type="submit"
                                    disabled={isLoading || isLocked}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex justify-center items-center space-x-2 ${(isLoading || isLocked)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-md'
                                        }`}
                                    whileHover={!isLoading && !isLocked ? { scale: 1.01 } : {}}
                                    whileTap={!isLoading && !isLocked ? { scale: 0.99 } : {}}
                                    onHoverStart={() => !isLoading && !isLocked && setIsHovered(true)}
                                    onHoverEnd={() => setIsHovered(false)}
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
                                        <>
                                            <FiLogIn className={`transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                                            <span>Sign In</span>
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.2 }}
                                className="text-center"
                            >
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link
                                        to='/register'
                                        className="font-medium text-blue-600 hover:text-blue-800 transition duration-200"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>

            </div>

        </div>


    );
}