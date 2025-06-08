import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Alert from '../Components/Alert';
import { Link, useNavigate } from 'react-router-dom';
import LogoITCA from '../assets/LogoITCA_Web.png';
import { API_URL } from '../../config.js';

export default function Register() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // NUEVO estado de carga
    const navigate = useNavigate();

    const handleRegister = async (data) => {
        setIsLoading(true); // comienza la carga

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
                    background: '#28a745',
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
                    background: '#d62f0c',
                    color: 'white',
                });
            }
        } catch (error) {
            setMessage('Error connecting to the API');
            Alert({
                title: 'Error',
                text: 'Error connecting to the API',
                icon: 'error',
                background: '#d62f0c',
                color: 'white',
            });
        } finally {
            setIsLoading(false); // finaliza la carga SIEMPRE
        }
    };

    const onError = (errors) => {
        if (errors.name) {
            Alert({
                title: 'Name Field',
                text: errors.name.message,
                icon: 'error',
                background: '#d62f0c',
                color: 'white',
            });
        } else if (errors.email) {
            Alert({
                title: 'Email Field',
                text: errors.email.message,
                icon: 'error',
                background: '#d62f0c',
                color: 'white',
            });
        } else if (errors.password) {
            Alert({
                title: 'Password Field',
                text: errors.password.message,
                icon: 'error',
                background: '#d62f0c',
                color: 'white',
            });
        }
    };

    return (
        <div className="flex items-center justify-center text-black bg-Paleta-GrisClaro min-h-screen">
            <div className="w-full max-w-md bg-Paleta-Blanco rounded-lg shadow-lg p-8">
                <img src={LogoITCA} alt="Logo ITCA" />
                <h2 className="mt-4 text-xl font-bold text-black text-center mb-4">User Registration</h2>
                <hr className="mb-4" />
                <form onSubmit={handleSubmit(handleRegister, onError)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">First Name</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-VerdeSuave focus:border-Paleta-VerdeSuave placeholder-gray-500"
                            type="text"
                            placeholder="Ejem: Pedro Mario"
                            {...register("name", { required: "Your full name is required" })}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Last Name</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-VerdeSuave focus:border-Paleta-VerdeSuave placeholder-gray-500"
                            type="text"
                            placeholder="Ejem: Alas Portillo"
                            {...register("lastname", { required: "Your last name is required" })}
                        />
                        {errors.lastname && <p className="text-red-500 text-sm mt-2">{errors.lastname.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-VerdeSuave focus:border-Paleta-VerdeSuave placeholder-gray-500"
                            type="email"
                            placeholder="Ejem: user02@itca.edu.sv"
                            {...register("email", { required: "Email is required" })}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-VerdeSuave focus:border-Paleta-VerdeSuave placeholder-gray-500"
                            type="password"
                            placeholder="********"
                            {...register("password", { required: "Password is required" })}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>}
                    </div>
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 bg-Paleta-VerdeSuave text-white font-semibold rounded-md transition duration-300 ease-in-out flex justify-center items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Paleta-Celeste'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4 mr-2 text-white"
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
                                'Register'
                            )}
                        </button>

                        <Link to='/login' className="block text-sm mt-4 text-gray-600 hover:text-Paleta-VerdeSuave transition duration-300 ease-in-out">
                            Already have an account? Sign In
                        </Link>
                    </div>
                    <div className="text-center mt-6">
                        <Link to='/verify-code' className="block text-sm mt-4 text-gray-600 hover:text-Paleta-VerdeSuave transition duration-300 ease-in-out">
                            Already have a verification code? Verify Code
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
