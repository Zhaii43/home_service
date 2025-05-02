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
    <div className="flex flex-col min-h-screen">
      <motion.header
        className="flex justify-between items-center px-8 py-4 bg-transparent shadow-md"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }}
      >
        <h1 className="text-xl font-bold">Home Services</h1>
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link href="/services" className="hover:text-blue-600">
            Services
          </Link>
          <Link href="/about-us" className="hover:text-blue-600">
            About Us
          </Link>
        </nav>
        <div>
          <Link href="/login">
            <Image
              src="/images/user1.png"
              alt="Login/Signup"
              width={32}
              height={32}
              className="cursor-pointer hover:opacity-80"
            />
          </Link>
        </div>
      </motion.header>

      <main className="flex flex-col items-center justify-center flex-grow text-center p-8">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl text-center font-bold mb-6 text-gray-800">Sign Up</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(formData) as Array<keyof typeof formData>).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {key.replace("_", " ")}
                </label>
                {key === "gender" ? (
                  <select
                    name={key}
                    value={formData[key] as string}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-black rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
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
                    className="mt-1 block w-full px-4 py-2 border border-black rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder={`Enter your ${key.replace("_", " ")}`}
                  />
                )}
                {errors[key] && <p className="text-red-500 text-sm">{errors[key]}</p>}
              </div>
            ))}
            <div className="col-span-full mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
              {successMessage && <p className="text-green-500 mt-4 text-sm">{successMessage}</p>}
            </div>
            {errors.general && <p className="text-red-500 mt-4 text-sm">{errors.general}</p>}
          </form>
          <div className="mt-4 text-sm text-black">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;