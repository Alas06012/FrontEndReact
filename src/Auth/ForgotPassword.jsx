import { useState, useEffect } from 'react';
import Alert from '../Components/Alert';
import LogoITCA from '../assets/LogoITCA_Web.png';
import { API_URL } from '/config.js';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole } from '../Utils/auth.js';
import { FiMail, FiArrowLeft, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";

const TIMER_DURATION = 180; // 3 minutes

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    // Start cooldown timer and store timestamp
    const startCooldown = () => {
        const now = Date.now();
        localStorage.setItem('forgot_timer_start', now);
        setCooldown(TIMER_DURATION);
    };

    // Check if cooldown timer exists in localStorage
    const checkStoredCooldown = () => {
        const stored = localStorage.getItem('forgot_timer_start');
        if (stored) {
            const elapsed = Math.floor((Date.now() - parseInt(stored)) / 1000);
            if (elapsed < TIMER_DURATION) {
                setCooldown(TIMER_DURATION - elapsed);
            } else {
                localStorage.removeItem('forgot_timer_start');
            }
        }
    };

    // On load, check if there's an active cooldown
    useEffect(() => {
        checkStoredCooldown();
    }, []);

    // Countdown logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (cooldown > 0) {
                setCooldown((prev) => prev - 1);
            } else {
                localStorage.removeItem('forgot_timer_start');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            Alert({
                title: 'Warning',
                text: 'You must enter your email.',
                icon: 'warning',
                background: '#4b7af0',
                color: 'white',
            });
            return;
        }

        if (cooldown > 0) return;

        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                Alert({
                    title: 'Success',
                    text: data.message || 'Recovery instructions have been sent to your email.',
                    icon: 'success',
                    background: '#4b7af0',
                    color: 'white',
                });
                startCooldown();
            } else {
                Alert({
                    title: 'Error',
                    text: data.message || 'Could not send recovery email.',
                    icon: 'error',
                    background: '#4b7af0',
                    color: 'white',
                });
            }
        } catch (err) {
            Alert({
                title: 'Error',
                text: 'An error occurred while processing your request.',
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
                {/* Logo ITCA arriba del cuadro */}
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
                        {/* Burbujas animadas */}
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
                            <FiMail className="text-white text-3xl" />
                        </motion.div>
                        <h2 className="mt-6 text-3xl font-bold text-white">
                            Forgot Password
                        </h2>
                        <p className="text-blue-100/90 mt-3 text-lg">
                            Enter your email to reset your password
                        </p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit}>
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
                                <motion.button
                                    type="submit"
                                    disabled={isLoading || cooldown > 0}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex justify-center items-center space-x-2 ${(isLoading || cooldown > 0)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-md'
                                        }`}
                                    whileHover={!isLoading && cooldown <= 0 ? { scale: 1.01 } : {}}
                                    whileTap={!isLoading && cooldown <= 0 ? { scale: 0.99 } : {}}
                                    onHoverStart={() => !isLoading && cooldown <= 0 && setIsHovered(true)}
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
                                            Sending...
                                        </>
                                    ) : cooldown > 0 ? (
                                        <>
                                            <FiClock className="mr-2" />
                                            {`Wait ${cooldown}s to resend`}
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <FiMail className={`transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
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
                                <Link
                                    to='/login'
                                    className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-200"
                                >
                                    <FiArrowLeft className="mr-1" />
                                    Back to Sign In
                                </Link>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}