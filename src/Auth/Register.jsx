import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Alert from '../Components/Alert';
import { Link, useNavigate } from 'react-router-dom';
import LogoITCA from '../assets/LogoITCA_Web.png';
import { API_URL } from '/config.js';
// Se añaden los iconos de ojo
import { FiUser, FiMail, FiLock, FiLogIn, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Register() {
    // Se añade 'watch' para poder observar el valor de otros campos
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    // Estado para controlar la visibilidad de las contraseñas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 'watch' nos permite acceder al valor del campo 'password' en tiempo real para la validación
    const password = watch("password", "");

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
        // La validación de react-hook-form ya mostrará los mensajes bajo cada campo.
        // Este bloque de alertas podría ser redundante, pero lo mantengo si es tu preferencia.
        const firstError = Object.values(errors)[0];
        if (firstError) {
             Alert({
                title: 'Validation Error',
                text: firstError.message,
                icon: 'error',
                background: '#4b7af0',
                color: 'white',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
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

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                        scale: { delay: 0.1, duration: 0.5 }
                    }}
                    className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-center relative overflow-hidden">
                        {/* ... Animaciones de burbujas (sin cambios) ... */}
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
                        <form onSubmit={handleSubmit(handleRegister, onError)} noValidate>
                            {/* --- Name & Lastname --- */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {/* First Name */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.2 }}>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            id="name"
                                            placeholder="e.g., John"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                            {...register("name", { required: "Your first name is required" })}
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                </motion.div>
                                {/* Last Name */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.2 }}>
                                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            id="lastname"
                                            placeholder="e.g., Doe"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                            {...register("lastname", { required: "Your last name is required" })}
                                        />
                                    </div>
                                    {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname.message}</p>}
                                </motion.div>
                            </div>
                            
                            {/* --- Email --- */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.2 }} className="mb-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="e.g., user@itca.edu.sv"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </motion.div>

                            {/* --- Password --- */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.2 }} className="mb-6">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="********"
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600">
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </motion.div>

                            {/* --- Confirm Password --- */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.2 }} className="mb-6">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        placeholder="********"
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        {...register("confirmPassword", {
                                            required: "Please confirm your password",
                                            validate: value => value === password || "The passwords do not match"
                                        })}
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600">
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                            </motion.div>

                            {/* --- Submit Button --- */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.2 }}>
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`text-white w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex justify-center items-center space-x-2 ${isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-md'}`}
                                    whileHover={!isLoading ? { scale: 1.01 } : {}}
                                    whileTap={!isLoading ? { scale: 0.99 } : {}}
                                    onHoverStart={() => !isLoading && setIsHovered(true)}
                                    onHoverEnd={() => setIsHovered(false)}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                                            <span>Registering...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiArrowRight className={`transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                                            <span>Register</span>
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </form>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.2 }} className="text-center space-y-4 mt-8">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to='/login' className="font-medium text-blue-600 hover:text-blue-800 transition">
                                    Sign In
                                </Link>
                            </p>
                            <p className="text-sm text-gray-600">
                                Already have a verification code?{' '}
                                <Link to='/verify-code' className="font-medium text-blue-600 hover:text-blue-800 transition">
                                    Verify Code
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}