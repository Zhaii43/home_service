"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const headerAnimation = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/user/login/", {
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      {/* Header */}
      <motion.header
        className="flex justify-between items-center px-6 py-4 bg-gray-900/80 backdrop-blur-md shadow-lg"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={headerAnimation}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">Home Services</h1>
        <nav className="flex gap-8 text-sm font-medium">
          <Link href="/" className="text-gray-200 hover:text-purple-400 transition-colors duration-200">Home</Link>
          <Link href="/services" className="text-gray-200 hover:text-purple-400 transition-colors duration-200">Services</Link>
          <Link href="/about-us" className="text-gray-200 hover:text-purple-400 transition-colors duration-200">About Us</Link>
        </nav>
        <div>
          <Link href="/login">
            <Image
              src="/images/user1.png"
              alt="Login/Signup"
              width={40}
              height={40}
              className="rounded-full hover:opacity-80 transition-opacity duration-200"
            />
          </Link>
        </div>
      </motion.header>

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
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Enter your password"
                />
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
              <p className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-md text-center py-6">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Home Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;