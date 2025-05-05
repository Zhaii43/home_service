"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

const headerAnimation = {
  hidden: { y: -100, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        {isLoggedIn ? (
          <div className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="font-semibold text-gray-200 hover:text-white transition-colors duration-200">
                {username}
              </span>
              <Image
                src="/images/user1.png"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-purple-500 p-0.5 hover:opacity-90 transition-opacity duration-200"
              />
            </div>
            {dropdownOpen && (
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
              alt="Login/Signup"
              width={40}
              height={40}
              className="rounded-full hover:opacity-80 transition-opacity duration-200"
            />
          </Link>
        )}
      </div>
    </motion.header>
  );
}