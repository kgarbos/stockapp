"use client";

import { useState } from 'react';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'next/navigation';

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handlePasswordReset = async () => {
    setError('');
    setMessage('');
    if (!validateEmail(email)) {
      setError('Invalid email format.');
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-500 mb-4">{message}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <button
          onClick={handlePasswordReset}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
        >
          Send Password Reset Email
        </button>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-700 mt-4"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;