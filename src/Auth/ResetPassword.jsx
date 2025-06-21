import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import Alert from '../Components/Alert';
import { FiLock, FiCheckCircle, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";

const ResetPassword = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const navigate = useNavigate();

    const [new_password, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (new_password !== confirmPassword) {
            Alert({
                title: 'Warning',
                text: 'Passwords do not match.',
                icon: 'warning',
                background: '#4b7af0',
                color: 'white',
            });
            setIsLoading(false);
            return;
        }

        if (!new_password?.trim() || new_password.trim().length < 8) {
            Alert({
                title: 'Weak Password',
                text: `Password must be at least 8 characters long and should not contain only spaces.`,
                icon: 'warning',
                background: '#4b7af0',
                color: 'white',
            });
            setIsLoading(false);
            return;
        }

        if (!token) {
            Alert({
                title: 'Error',
                text: 'Please generate a request on the Forgot Password page.',
                icon: 'error',
                background: '#4b7af0',
                color: 'white',
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert({
                    title: 'Success',
                    text: 'Password has been reset successfully!',
                    icon: 'success',
                    background: '#4b7af0',
                    color: 'white',
                });

                setNewPassword('');
                setConfirmPassword('');

                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                Alert({
                    title: 'Error',
                    text: data.message || 'An error occurred while resetting the password. Please try again.',
                    icon: 'error',
                    background: '#4b7af0',
                    color: 'white',
                });
            }
        } catch (err) {
            Alert({
                title: 'Error',
                text: 'Unexpected error. Please try again.',
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
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-center relative overflow-hidden">
                        {/* Burbujas de fondo animadas */}
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className={`absolute rounded-full bg-white/${i % 2 ? 10 : 5}`}
                                style={{
                                    width: `${30 + i * 10}px`,
                                    height: `${30 + i * 10}px`,
                                    top: `${10 + i * 20}%`,
                                    left: `${i * 25}%`,
                                }}
                                animate={{
                                    y: [0, (i % 2 ? -1 : 1) * (5 + i * 3), 0],
                                    x: [0, (i % 2 ? -1 : 1) * (3 + i * 2), 0],
                                }}
                                transition={{
                                    duration: 8 + i * 2,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut",
                                    delay: i * 0.5,
                                }}
                            />
                        ))}

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-block bg-white/10 p-5 rounded-full backdrop-blur-sm border border-white/20"
                        >
                            <FiLock className="text-white text-3xl" />
                        </motion.div>
                        <h2 className="mt-6 text-3xl font-bold text-white">
                            Reset Password
                        </h2>
                        <p className="text-blue-100/90 mt-3 text-lg">
                            Enter your new password below
                        </p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.2 }}
                            >
                                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                                        id="new_password"
                                        value={new_password}
                                        onChange={(e) => setNewPassword(e.target.value)}
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
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.2 }}
                            >
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiCheckCircle className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <motion.div
                                            key={showConfirmPassword ? 'visible' : 'hidden'}
                                            initial={{ rotate: -10, opacity: 0.7 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {showConfirmPassword ? (
                                                <FiEye className="text-gray-500 hover:text-blue-600 transition" />
                                            ) : (
                                                <FiEyeOff className="text-gray-500 hover:text-blue-600 transition" />
                                            )}
                                        </motion.div>
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.2 }}
                            >
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex justify-center items-center space-x-2 ${isLoading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-md'
                                        }`}
                                    whileHover={!isLoading ? { scale: 1.01 } : {}}
                                    whileTap={!isLoading ? { scale: 0.99 } : {}}
                                    onHoverStart={() => !isLoading && setIsHovered(true)}
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
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            <FiArrowRight className={`transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                                            <span>Reset Password</span>
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;