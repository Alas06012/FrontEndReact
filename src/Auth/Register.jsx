import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Alert from '../Components/Alert'; // Importa el componente Alert
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import LogoITCA from '../assets/LogoITCA_Web.png'

export default function Register() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (data) => {
        const userData = {
            name: data.name,
            lastname: data.lastname,
            carnet: data.carnet,
            email: data.email,
            password: data.password,
        };

        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const responseData = await response.json();
            console.log(responseData);

            if (response.ok) {
                setMessage('Usuario registrado exitosamente');
                Alert({
                    title: 'Registro Exitoso',
                    text: 'Usuario registrado exitosamente',
                    icon: 'success',
                    background: '#28a745',
                    color: 'white',
                });

                reset();
                // Esperar 3 segundos antes de redirigir
                setTimeout(() => {
                    // Redirigir al login
                    navigate('/login')
                }, 3000); // 3000 ms = 3 segundos

            } else {
                setMessage('Error al registrar usuario: ' + responseData.error);
                Alert({
                    title: '',
                    text: responseData.error,
                    icon: 'error',
                    background: '#d62f0c',
                    color: 'white',
                });
            }
        } catch (error) {
            // console.error('Error:', error);
            setMessage('Error al conectar con la API');
            Alert({
                title: 'Error',
                text: 'Error al conectar con la API',
                icon: 'error',
                background: '#d62f0c',
                color: 'white',
            });
        }
    };

    const onError = (errors) => {
        if (errors.name) {
            Alert({
                title: 'Campo Nombre',
                text: errors.name.message,
                icon: 'error',
                background: '#d62f0c',
                color: 'white',
            });
        } else if (errors.email) {
            Alert({
                title: 'Campo Email',
                text: errors.email.message,
                icon: 'error',
                background: '#d62f0c',
                color: 'white',
            });
        } else if (errors.password) {
            Alert({
                title: 'Campo Contraseña',
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
                <h2 className="mt-4 text-xl font-bold text-black text-center mb-4">Registro de Usuarios</h2>
                <hr className="mb-4" />
                <form onSubmit={handleSubmit(handleRegister, onError)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Nombres</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-VerdeSuave focus:border-Paleta-VerdeSuave placeholder-gray-500"
                            type="text"
                            placeholder="Ejem: Pedro Mario"
                            {...register("name", { required: "Tu nombre completo es obligatorio" })}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Apellidos</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-VerdeSuave focus:border-Paleta-VerdeSuave placeholder-gray-500"
                            type="text"
                            placeholder="Ejem: Alas Portillo"
                            {...register("lastname", { required: "Tu apellido es obligatorio" })}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Carnet</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-VerdeSuave focus:border-Paleta-VerdeSuave placeholder-gray-500"
                            type="text"
                            placeholder="Ejem: 123656"
                            {...register("carnet", { required: "Tu numero de carnet es obligatorio" })}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-VerdeSuave focus:border-Paleta-VerdeSuave placeholder-gray-500"
                            type="email"
                            placeholder="Ejem: user02@itca.edu.sv"
                            {...register("email", { required: "El email es obligatorio" })}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Contraseña</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-VerdeSuave focus:border-Paleta-VerdeSuave placeholder-gray-500"
                            type="password"
                            placeholder="********"
                            {...register("password", { required: "La contraseña es obligatoria" })}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>}
                    </div>
                    <div className="text-center">
                        <button type="submit" className="w-full py-2 px-4 bg-Paleta-VerdeSuave text-white font-semibold rounded-md hover:bg-Paleta-Celeste transition duration-300 ease-in-out">
                            Registrar
                        </button>
                        <Link to='/login' className="block text-sm mt-4 text-gray-600 hover:text-Paleta-VerdeSuave transition duration-300 ease-in-out">
                            ¿Ya tienes una cuenta? Ingresa
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
