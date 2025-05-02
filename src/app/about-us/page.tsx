"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link"; // Import the Link component
import axios from "axios";

export default function About() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const headerAnimation = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
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
    <div className="flex flex-col min-h-screen">
      <motion.header
        className="flex justify-between items-center px-8 py-4 bg-transparent shadow-md"
        initial="hidden"
        animate="visible"
        variants={headerAnimation}
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
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 focus:outline-none"
              >
                <span className="font-semibold text-gray-700">
                  Welcome, {username}!
                </span>
                <Image
                  src="/images/user1.png"
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/my-booking"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    My Booking
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
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
                width={32}
                height={32}
                className="w-8 h-8 cursor-pointer hover:opacity-80"
              />
            </Link>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow text-center p-8">
        <h2 className="text-3xl font-bold mb-6 text-white">About Us</h2>
        <p className="text-lg text-white mb-6 text-center max-w-3xl">
          At Home Services, we are dedicated to providing top-notch home improvement and maintenance solutions tailored to your needs. Our skilled professionals ensure your home stays comfortable, functional, and beautiful.
        </p>
        <div className="flex flex-wrap justify-center gap-12 mb-12">
          {/* Mission */}
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Our Mission</h3>
            <p className="text-gray-700">
              To deliver exceptional home services that enhance your living experience with professionalism, reliability, and care.
            </p>
          </div>
          {/* Vision */}
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Our Vision</h3>
            <p className="text-gray-700">
              To be the most trusted and preferred home services provider in the industry.
            </p>
          </div>
          {/* Commitment */}
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Our Commitment</h3>
            <p className="text-gray-700">
              Your satisfaction is our priority. We strive to exceed expectations with every service we offer.
            </p>
          </div>
        </div>
        <Image
          src="/images/background.jpg" // Replace with the actual image path
          alt="Our Team"
          width={600}
          height={400}
          className="rounded-lg shadow-lg"
        />
      </main>

      {/* Footer */}
      <footer className="bg-translucent text-center py-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Home Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
