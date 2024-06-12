"use client";

import { useState, Suspense } from "react";
import { auth } from "../../../firebaseConfig";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordComponent = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const validatePassword = (password: string) => {
    const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    return re.test(password);
  };

  const handleResetPassword = async () => {
    setError("");
    setMessage("");
    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters long, contain one uppercase letter, one special character, and one number."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const oobCode = searchParams.get("oobCode");
      if (oobCode) {
        await auth.confirmPasswordReset(oobCode, newPassword);
        setMessage(
          "Password reset successful. You can now log in with your new password."
        );
        router.push("/login");
      } else {
        setError("Invalid or expired reset link.");
      }
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
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <button
          onClick={handleResetPassword}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ResetPasswordComponent />
  </Suspense>
);

export default ResetPasswordPage;
