import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Alert from '../Components/Alert';
import { Link, useNavigate } from 'react-router-dom';
import LogoITCA from '../assets/LogoITCA_Web.png';
import { API_URL } from '/config.js';
import { FiUser, FiMail, FiLock, FiLogIn, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Register() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (data) => {
        setIsLoading(true);

        const userData = {
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            password: data.password,
        };

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const responseData = await response.json();

            if (response.ok) {
                setMessage('User successfully registered');
                Alert({
                    title: 'Registration Successful',
                    text: 'Registration successful. A verification code has been sent to your email.',
                    icon: 'success',
                    background: '#4b7af0',
                    color: 'white',
                });

                reset();
                setTimeout(() => {
                    navigate('/verify-code');
                }, 3000);

            } else {
                setMessage('Error registering user: ' + responseData.error);
                Alert({
                    title: '',
                    text: responseData.error,
                    icon: 'error',
                    background: '#4b7af0',
                    color: 'white',
                });
            }
        } catch (error) {
            setMessage('Error connecting to the API');
            Alert({
                title: 'Error',
                text: 'Error connecting to the API',
                icon: 'error',
                background: '#4b7af0',
                color: 'white',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onError = (errors) => {
        if (errors.name) {
            Alert({
                title: 'Name Field',
                text: errors.name.message,
                icon: 'error',
                background: '#4b7af0',
                color: 'white',
            });
        } else if (errors.email) {
            Alert({
                title: 'Email Field',
                text: errors.email.message,
                icon: 'error',
                background: '#4b7af0',
                color: 'white',
            });
        } else if (errors.password) {
            Alert({
                title: 'Password Field',
                text: errors.password.message,
                icon: 'error',
                background: '#4b7af0',
                color: 'white',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md sm:max-w-lg md:max-w-md">
                {/* Logo ITCA arriba del cuadro de registro */}
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
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-center relative overflow-hidden">
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
                        <h2 className="mt-3 text-3xl font-bold text-white">
                            Create Account
                        </h2>
                        <p className="text-blue-100/90 mt-2 text-lg">
                            Join us by filling the form below
                        </p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit(handleRegister, onError)}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.2 }}
                                className="mb-6"
                            >
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                                        id="name"
                                        placeholder="Ejem: Pedro Mario"
                                        {...register("name", { required: "Your full name is required" })}
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.2 }}
                                className="mb-6"
                            >
                                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                                        id="lastname"
                                        placeholder="Ejem: Alas Portillo"
                                        {...register("lastname", { required: "Your last name is required" })}
                                    />
                                </div>
                                {errors.lastname && <p className="text-red-500 text-sm mt-2">{errors.lastname.message}</p>}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.2 }}
                                className="mb-6"
                            >
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                                        id="email"
                                        placeholder="Ejem: user02@itca.edu.sv"
                                        {...register("email", { required: "Email is required" })}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.2 }}
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
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                                        id="password"
                                        placeholder="********"
                                        {...register("password", { required: "Password is required" })}
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.2 }}
                                className="mb-6"
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
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <FiArrowRight className={`transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                                            <span>Register</span>
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35, duration: 0.2 }}
                                className="text-center space-y-4"
                            >
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link
                                        to='/login'
                                        className="font-medium text-blue-600 hover:text-blue-800 transition duration-200"
                                    >
                                        Sign In
                                    </Link>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Already have a verification code?{' '}
                                    <Link
                                        to='/verify-code'
                                        className="font-medium text-blue-600 hover:text-blue-800 transition duration-200"
                                    >
                                        Verify Code
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