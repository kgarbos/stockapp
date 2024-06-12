"use client";

import { useState } from "react";
import { auth } from "../../../firebaseConfig";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string) => {
    const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    return re.test(password);
  };

  const handleAuth = async () => {
    setError("");
    setMessage("");
    if (!validateEmail(email)) {
      setError("Invalid email format.");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, contain one uppercase letter, one special character, and one number."
      );
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email, password);
        router.push("/");
      } else {
        const userCredential = await auth.createUserWithEmailAndPassword(
          email,
          password
        );
        if (userCredential.user) {
          await userCredential.user.sendEmailVerification();
          setMessage(
            "Registration successful. Please check your email to verify your account."
          );
        }
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">
        {isLogin ? "Login" : "Register"}
      </h1>
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
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4 p-2 border border-gray-300 rounded w-full"
        />
        {!isLogin && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          />
        )}
        <button
          onClick={handleAuth}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
        >
          {isLogin ? "Login" : "Register"}
        </button>
        {isLogin && (
          <button
            onClick={() => router.push("/forgot-password")}
            className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-700 mt-4"
          >
            Forgot Password
          </button>
        )}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-700 mt-4"
        >
          {isLogin ? "Need to Register?" : "Have an Account? Login"}
        </button>
      </div>
    </div>
  );
};

export default Login;
