"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";

export default function About() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const headerAnimation = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserDetails(token);
    }
  }, []);

  const fetchUserDetails = async (token: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(response.data.username);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await axios.post("http://127.0.0.1:8000/api/user/logout/", {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsLoggedIn(false);
      setUsername(null);
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      {/* Header */}
      <motion.header
        className="flex justify-between items-center px-6 py-4 bg-gray-900/80 backdrop-blur-md shadow-lg"
        initial="hidden"
        animate="visible"
        variants={headerAnimation}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">Home Services</h1>
        <nav className="flex gap-8 text-sm font-medium">
          <Link href="/" className="text-gray-200 hover:text-purple-400 transition-colors duration-200">Home</Link>
          <Link href="/services" className="text-gray-200 hover:text-purple-400 transition-colors duration-200">Services</Link>
          <Link href="/about-us" className="text-gray-200 hover:text-purple-400 transition-colors duration-200">About Us</Link>
        </nav>
        <div>
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-3 focus:outline-none"
              >
                <span className="font-semibold text-gray-200 hover:text-white transition-colors duration-200">
                  {username}
                </span>
                <Image
                  src="/images/user1.png"
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-purple-500 p-0.5 hover:opacity-90 transition-opacity duration-200"
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-56 z-10">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-t-lg"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/my-booking"
                    className="block px-4 py-3 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                  >
                    My Booking
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Image
                src="/images/user1.png"
                alt="Login"
                width={40}
                height={40}
                className="rounded-full hover:opacity-80 transition-opacity duration-200"
              />
            </Link>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          About Us
        </motion.h2>
        <motion.p
          className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          At Home Services, we are dedicated to providing top-notch home improvement and maintenance solutions tailored to your needs. Our skilled professionals ensure your home stays comfortable, functional, and beautiful.
        </motion.p>
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {/* Mission */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg max-w-sm text-center hover:shadow-[0_4px_20px_rgba(128,0,255,0.3)] transition-all duration-300"
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Our Mission</h3>
            <p className="text-gray-300">
              To deliver exceptional home services that enhance your living experience with professionalism, reliability, and care.
            </p>
          </motion.div>
          {/* Vision */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg max-w-sm text-center hover:shadow-[0_4px_20px_rgba(128,0,255,0.3)] transition-all duration-300"
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Our Vision</h3>
            <p className="text-gray-300">
              To be the most trusted and preferred home services provider in the industry.
            </p>
          </motion.div>
          {/* Commitment */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg max-w-sm text-center hover:shadow-[0_4px_20px_rgba(128,0,255,0.3)] transition-all duration-300"
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Our Commitment</h3>
            <p className="text-gray-300">
              Your satisfaction is our priority. We strive to exceed expectations with every service we offer.
            </p>
          </motion.div>
        </div>
        <motion.div
          className="relative max-w-4xl w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <Image
            src="/images/background.jpg"
            alt="Our Team"
            width={800}
            height={500}
            className="rounded-xl shadow-lg border border-gray-700 w-full h-auto object-cover"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent"></div>
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
}