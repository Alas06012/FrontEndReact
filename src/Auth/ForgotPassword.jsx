import { useState, useEffect } from 'react';
import Alert from '../Components/Alert';
import LogoITCA from '../assets/LogoITCA_Web.png';
import { API_URL } from '/config.js';
import { Link } from 'react-router-dom';

const TIMER_DURATION = 180; // 3 minutes

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);

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

        if (cooldown > 0) return; // Extra safety check

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
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <img src={LogoITCA} alt="ITCA Logo" />
                    <h2 className="mt-4 text-xl font-bold text-black">Forgot Your Password?</h2>
                    <p className="text-gray-600 text-sm mt-1">We’ll send instructions to reset it.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@itca.edu.sv"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cooldown > 0}
                        className={`w-full py-2 px-4 font-semibold rounded-md transition duration-300 ${
                            cooldown > 0
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-green-400'
                        }`}
                    >
                        {cooldown > 0 ? `Please wait (${cooldown}s)` : 'Send Reset Link'}
                    </button>

                    <div className="text-center mt-6">
                        <Link to='/login' className="block text-sm mt-4 text-gray-600 hover:text-blue-500 transition duration-300 ease-in-out">
                            Remembered it? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
