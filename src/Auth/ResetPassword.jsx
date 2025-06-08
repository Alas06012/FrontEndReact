import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { API_URL } from '../../config';
import Alert from '../Components/Alert';

const ResetPassword = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const navigate = useNavigate();

    const [new_password, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (new_password !== confirmPassword) {
            Alert({
                title: 'Warning',
                text: 'Passwords do not match.',
                icon: 'warning',
                background: '#f87171',
                color: 'white',
            });
            return;
        }

       if (!new_password?.trim() || new_password.trim().length < 8) {
            Alert({
                title: 'Weak Password',
                text: `Password must be at least 8 characters long and should not contain only spaces.`,
                icon: 'warning',
                background: '#f87171',
                color: 'white',
            });
            return;
        }

        if (!token) {
            Alert({
                title: 'Error',
                text: 'Please generate a request on the Forgot Password page.',
                icon: 'error',
                background: '#f87171',
                color: 'white',
            });
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
                    background: '#4ade80',
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
                    background: '#f87171',
                    color: 'white',
                });
            }
        } catch (err) {
            Alert({
                title: 'Error',
                text: 'Unexpected error. Please try again.',
                icon: 'error',
                background: '#f87171',
                color: 'white',
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-6">
                    <LockClosedIcon className="h-12 w-12 text-blue-600" />
                    <h2 className="mt-2 text-2xl font-bold text-gray-800">
                        Reset Your Password
                    </h2>
                    <p className="text-sm text-gray-500 text-center">
                        Enter your new password and confirm it.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <input
                            type="password"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={new_password}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
