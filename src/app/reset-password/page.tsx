"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/component/header";
import Footer from "@/component/footer";
import { Eye, EyeOff } from "lucide-react";

// Move all logic into a separate component
const ResetPasswordContent: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid or missing reset token");
    }
  }, [searchParams]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://backend-r9v8.onrender.com/api/user/password_reset_confirm/", {
        token,
        password,
      });

      setMessage(response.data.message);
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Something went wrong");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      <Header />
      <main className="flex flex-1 justify-center items-center px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl p-8"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 tracking-tight">
            Reset Password
          </h2>
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-200"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {message && (
              <motion.div
                className="text-green-400 text-center bg-green-900/20 border border-green-700 rounded-lg py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {message}
              </motion.div>
            )}
            {error && (
              <motion.div
                className="text-red-400 text-center bg-red-900/20 border border-red-700 rounded-lg py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

// Wrap the content in Suspense to fix the useSearchParams error
const ResetPasswordPage: React.FC = () => (
  <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-white">Loading...</div>}>
    <ResetPasswordContent />
  </Suspense>
);

export default ResetPasswordPage;