"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    username: "",
    contact: "",
    address: "",
    gender: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:8000/api/user/register/", formData);
      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
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
      <main className="flex flex-col items-center justify-center flex-grow px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="w-full max-w-3xl bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl p-8"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 tracking-tight">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(formData) as Array<keyof typeof formData>).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 capitalize">
                  {key.replace("_", " ")}
                </label>
                {key === "gender" ? (
                  <select
                    name={key}
                    value={formData[key] as string}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input
                    type={key.includes("password") ? "password" : key === "email" ? "email" : "text"}
                    name={key}
                    value={formData[key] as string}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder={`Enter your ${key.replace("_", " ")}`}
                  />
                )}
                {errors[key] && (
                  <p className="text-red-400 text-sm mt-1">{errors[key]}</p>
                )}
              </div>
            ))}
            <div className="col-span-full mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
              {successMessage && (
                <motion.p
                  className="text-green-400 mt-4 text-sm text-center bg-green-900/20 border border-green-700 rounded-lg py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {successMessage}
                </motion.p>
              )}
              {errors.general && (
                <motion.p
                  className="text-red-400 mt-4 text-sm text-center bg-red-900/20 border border-red-700 rounded-lg py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.general}
                </motion.p>
              )}
            </div>
          </form>
          <div className="mt-4 text-sm text-gray-400 text-center">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                Login here
              </Link>
            </p>
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

export default SignupPage;