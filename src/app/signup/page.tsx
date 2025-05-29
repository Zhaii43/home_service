"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/component/header";
import Footer from "@/component/footer";
import { Eye, EyeOff } from "lucide-react";

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
  // New state for password visibility
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm_password: false,
  });

  const router = useRouter();

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

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:8000/api/user/register/", formData);
      setSuccessMessage("Account created successfully! Redirecting...");
      setShowPasswords({
        password: false,
        confirm_password: false,
      });
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
      <Header />
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
              <div key={key} className={key.includes("password") ? "relative" : ""}>
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
                    type={
                      key === "password"
                        ? showPasswords.password
                          ? "text"
                          : "password"
                        : key === "confirm_password"
                        ? showPasswords.confirm_password
                          ? "text"
                          : "password"
                        : key === "email"
                        ? "email"
                        : "text"
                    }
                    name={key}
                    value={formData[key] as string}
                    onChange={handleChange}
                    required={key !== "middle_name"} // Make middle_name optional
                    className={`mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                      key.includes("password") ? "pr-10" : ""
                    }`}
                    placeholder={`Enter your ${key.replace("_", " ")}${key === "middle_name" ? " (optional)" : ""}`}
                  />
                )}
                {key.includes("password") && (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(key as keyof typeof showPasswords)}
                    className="absolute right-3 top-10 text-gray-400 hover:text-gray-200"
                  >
                    {showPasswords[key as keyof typeof showPasswords] ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
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

      <Footer />
    </div>
  );
};

export default SignupPage;