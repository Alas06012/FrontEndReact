import { useState, useEffect } from 'react';
import Alert from '../Components/Alert';
import { useNavigate, Link } from 'react-router-dom';
import LogoITCA from '../assets/LogoITCA_Web.png';
import { getUserRole } from '../Utils/auth.js';
import { API_URL } from '/config.js';
import { FiMail, FiLock, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";

const TIMER_DURATION = 15; // 15 seconds

export default function VerifyCode() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [verifyTimer, setVerifyTimer] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isHoveredVerify, setIsHoveredVerify] = useState(false);
    const [isHoveredResend, setIsHoveredResend] = useState(false);

    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        const role = getUserRole();
        if (role) {
            navigate(`/dashboard/${role.toLowerCase()}`);
        }
    }, []);

    // Start timer and store timestamp in localStorage
    const startTimer = (key, setTimer) => {
        const now = Date.now();
        localStorage.setItem(key, now);
        setTimer(TIMER_DURATION);
    };

    const checkStoredTimer = (key, setTimer) => {
        const stored = localStorage.getItem(key);
        if (stored) {
            const elapsed = Math.floor((Date.now() - parseInt(stored)) / 1000);
            if (elapsed < TIMER_DURATION) {
                setTimer(TIMER_DURATION - elapsed);
            } else {
                localStorage.removeItem(key);
            }
        }
    };

    // Load existing timers on page load
    useEffect(() => {
        checkStoredTimer('resend_timer_start', setResendTimer);
        checkStoredTimer('verify_timer_start', setVerifyTimer);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (resendTimer > 0) setResendTimer((prev) => prev - 1);
            if (verifyTimer > 0) setVerifyTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendTimer, verifyTimer]);

    const handleResendCode = async () => {
        if (!email) {
            Alert({
                title: 'Warning',
                text: 'You must enter an email address first.',
                icon: 'warning',
                background: '#4b7af0',
                color: 'white',
            });
            return;
        }

        startTimer('resend_timer_start', setResendTimer);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                Alert({
                    title: 'Code Resent',
                    text: 'A new verification code has been sent to your email.',
                    icon: 'success',
                    background: '#4b7af0',
                    color: 'white',
                });
            } else {
                const errorData = await response.json();
                Alert({
                    title: 'Error',
                    text: errorData.message || 'Failed to resend verification code.',
                    icon: 'error',
                    background: '#4b7af0',
                    color: 'white',
                });
            }
        } catch (error) {
            Alert({
                title: 'Error',
                text: 'An error occurred while resending the code.',
                icon: 'error',
                background: '#4b7af0',
                color: 'white',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!email || !code) {
            Alert({
                title: 'Required Fields',
                text: 'You must enter your email and the verification code.',
                icon: 'warning',
                background: '#4b7af0',
                color: 'white',
            });
            return;
        }

        startTimer('verify_timer_start', setVerifyTimer);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            if (response.ok) {
                const data = await response.json();
                Alert({
                    title: 'Verified',
                    text: data.message || 'Your account has been successfully verified.',
                    icon: 'success',
                    background: '#4b7af0',
                    color: 'white',
                });
                setTimeout(() => navigate('/login'), 2000);
            } else {
                const errorData = await response.json();
                Alert({
                    title: 'Error',
                    text: errorData.message || 'Invalid verification code.',
                    icon: 'error',
                    background: '#4b7af0',
                    color: 'white',
                });
            }
        } catch (error) {
            Alert({
                title: 'Error',
                text: 'An error occurred while verifying the code.',
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
                {/* Logo ITCA arriba del cuadro de verificación */}
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
                        {/* Burbujas de fondo animadas */}
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

                        {/* Icono de verificación */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-block bg-white/10 p-5 rounded-full backdrop-blur-sm border border-white/20"
                        >
                            <FiCheckCircle className="text-white text-3xl" />
                        </motion.div>
                        <h2 className="mt-6 text-3xl font-bold text-white">
                            Verify Your Account
                        </h2>
                        <p className="text-blue-100/90 mt-3 text-lg">
                            Enter the verification code sent to your email
                        </p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleVerify}>
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
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                                        id="code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="123456"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.2 }}
                                className="flex flex-col gap-4 mb-6"
                            >
                                <motion.button
                                    type="submit"
                                    disabled={isLoading || verifyTimer > 0}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex justify-center items-center space-x-2 ${
                                        (isLoading || verifyTimer > 0)
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-md'
                                    }`}
                                    whileHover={!isLoading && verifyTimer <= 0 ? { scale: 1.01 } : {}}
                                    whileTap={!isLoading && verifyTimer <= 0 ? { scale: 0.99 } : {}}
                                    onHoverStart={() => !isLoading && verifyTimer <= 0 && setIsHoveredVerify(true)}
                                    onHoverEnd={() => setIsHoveredVerify(false)}
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
                                            Verifying...
                                        </>
                                    ) : verifyTimer > 0 ? (
                                        `Verify (${verifyTimer}s)`
                                    ) : (
                                        <>
                                            <FiCheckCircle className={`transition-transform duration-200 ${isHoveredVerify ? 'scale-110' : ''}`} />
                                            <span>Verify Account</span>
                                        </>
                                    )}
                                </motion.button>

                                <motion.button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={isLoading || resendTimer > 0}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex justify-center items-center space-x-2 ${
                                        (isLoading || resendTimer > 0)
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-md'
                                    }`}
                                    whileHover={!isLoading && resendTimer <= 0 ? { scale: 1.01 } : {}}
                                    whileTap={!isLoading && resendTimer <= 0 ? { scale: 0.99 } : {}}
                                    onHoverStart={() => !isLoading && resendTimer <= 0 && setIsHoveredResend(true)}
                                    onHoverEnd={() => setIsHoveredResend(false)}
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
                                    ) : resendTimer > 0 ? (
                                        `Resend (${resendTimer}s)`
                                    ) : (
                                        <>
                                            <FiRefreshCw className={`transition-transform duration-200 ${isHoveredResend ? 'rotate-180' : ''}`} />
                                            <span>Resend Code</span>
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
                                    Already have an account?{' '}
                                    <Link
                                        to='/login'
                                        className="font-medium text-blue-600 hover:text-blue-800 transition duration-200"
                                    >
                                        Login
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