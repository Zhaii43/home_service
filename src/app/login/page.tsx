"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Header from "@/component/header";
import Footer from "@/component/footer";
import { Eye, EyeOff } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const router = useRouter();

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const modalAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post("https://backend-r9v8.onrender.com/api/user/login/", {
        email,
        password,
      });

      const { access_token, refresh_token, message } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      alert(message);
      router.push("/");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.error || "Something went wrong");
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");
    setResetError("");
    setResetLoading(true);

    try {
      const response = await axios.post("https://backend-r9v8.onrender.com/api/user/password_reset/", {
        email: resetEmail,
      });

      setResetMessage(response.data.message);
      setResetEmail("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setResetError(error.response?.data?.error || "Something went wrong");
      } else {
        setResetError("An unexpected error occurred");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 justify-center items-center px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="w-full max-w-4xl bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
        >
          {/* Image Section */}
          <div className="w-full md:w-1/2 relative">
            <Image
              src="/images/background.jpg"
              alt="Login Banner"
              width={500}
              height={500}
              className="object-cover w-full h-full rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
            />
            <div className="absolute inset-0 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none bg-gradient-to-br from-purple-500/20 to-transparent"></div>
          </div>

          {/* Login Form Section */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 tracking-tight">
              Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-10 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errorMessage && (
                <motion.div
                  className="text-red-400 text-center bg-red-900/20 border border-red-700 rounded-lg py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {errorMessage}
                </motion.div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
<div className="flex justify-between text-sm">
  <p className="text-gray-400">
    {/* Escape the single quote in "Don't have an account?" */}
    Don&apos;t have an account?{" "}
    <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
      Sign up
    </Link>
  </p>
  <button
    type="button"
    onClick={() => setShowForgotPassword(true)}
    className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
  >
    Forgot Password?
  </button>
</div>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => setShowForgotPassword(false)}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-8 w-full max-w-md"
            variants={modalAnimation}
            initial="hidden"
            animate="visible"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">
              Reset Password
            </h2>
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="reset-email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              {resetMessage && (
                <motion.div
                  className="text-green-400 text-center bg-green-900/20 border border-green-700 rounded-lg py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {resetMessage}
                </motion.div>
              )}
              {resetError && (
                <motion.div
                  className="text-red-400 text-center bg-red-900/20 border border-red-700 rounded-lg py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {resetError}
                </motion.div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default LoginPage;