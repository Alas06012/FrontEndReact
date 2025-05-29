import { useState, useEffect } from 'react';
import Alert from '../Components/Alert';
import { useNavigate } from 'react-router-dom';
import LogoITCA from '../assets/LogoITCA_Web.png';
import { getUserRole } from '../Utils/auth.js';
import { API_URL } from '/config.js';

const TIMER_DURATION = 180; // 3 minutes

export default function VerifyCode() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    const [resendTimer, setResendTimer] = useState(0);
    const [verifyTimer, setVerifyTimer] = useState(0);

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
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <img src={LogoITCA} alt="ITCA Logo" />
                    <h2 className="mt-4 text-xl font-bold text-black">
                        Verify Your Account
                    </h2>
                </div>

                <hr className="my-4 border-t-2 border-gray-300" />

                <form onSubmit={handleVerify}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@itca.edu.sv"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="code" className="block text-gray-700">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g. 123456"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={verifyTimer > 0}
                            className={`w-full py-2 px-4 font-semibold rounded-md transition duration-300 ${
                                verifyTimer > 0
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-green-400'
                            }`}
                        >
                            {verifyTimer > 0
                                ? `Verify (${verifyTimer}s)`
                                : 'Verify'}
                        </button>

                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={resendTimer > 0}
                            className={`w-full py-2 px-4 font-semibold rounded-md transition duration-300 ${
                                resendTimer > 0
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-green-400'
                            }`}
                        >
                            {resendTimer > 0
                                ? `Resend (${resendTimer}s)`
                                : 'Resend Code'}
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <span
                                onClick={() => navigate('/login')}
                                className="text-blue-600 hover:underline cursor-pointer"
                            >
                                Login
                            </span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
