import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Alert from '../Components/Alert'; // Importa el componente Alert
import { Link } from 'react-router-dom';
import { setTokens } from '../Utils/auth.js';
import LogoITCA from '../assets/LogoITCA_Web.png'

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {

            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setTokens(data.access_token, data.refresh_token);
                navigate('/dashboard');
            } else {
                Alert({
                    title: 'Error',
                    text: 'Email o Password Invalidos',
                    icon: 'error',
                    background: '#803cae',
                    color: 'white',
                });
            }
        } catch (error) {
            Alert({
                title: 'Error',
                text: 'Error al iniciar sesión',
                icon: 'error',
                background: '#803cae',
                color: 'white',
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-Paleta-GrisClaro">
            <div className="w-full max-w-sm bg-Paleta-Blanco rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <img src={LogoITCA} alt="Logo ITCA" />
                    <h2 className="mt-4 text-3xl font-bold text-black">
                        Login!
                    </h2>
                </div>

                <hr className="my-4 border-t-2 border-gray-300" />

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700">Nombre de Usuario</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ejemplo: user01@itca.edu.sv"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="**********"
                            required
                        />
                    </div>

                    <div className="text-center">
                        <button type="submit" className="w-full py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md hover:bg-Paleta-VerdeSuave transition duration-300 ease-in-out">
                            Ingresar
                        </button>
                        <Link to='/register' className="block text-sm mt-4 text-gray-600 hover:text-Paleta-Celeste transition duration-300 ease-in-out">
                            ¿No tienes una cuenta? Regístrate
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
