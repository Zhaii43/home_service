"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import axios from "axios";

interface UserType {
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  username: string;
  contact?: string;
  address?: string;
  gender?: string;
  email: string;
}

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async (token: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User details response:", response.data);
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch user details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        setError("Failed to load profile. Please try again.");
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/login");
        }
      } else {
        console.error("Unexpected error fetching user details:", error);
        setError("An unexpected error occurred.");
      }
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await axios.post("http://127.0.0.1:8000/api/user/logout", {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsLoggedIn(false);
      setUser(null);
      router.push("/login");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    } else {
      fetchUserDetails(token);
    }
  }, [router, fetchUserDetails]);

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      {/* Header */}
      <motion.header
        className="flex justify-between items-center px-6 py-4 bg-gray-900/80 backdrop-blur-md shadow-lg"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: { y: -100, opacity: 0 },
          visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
        }}
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
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="font-semibold text-gray-200 hover:text-white transition-colors duration-200">
                  {user.username}
                </span>
                <Image
                  src="/images/user1.png"
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-purple-500 p-0.5 hover:opacity-90 transition-opacity duration-200"
                />
              </div>
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

      {/* Profile Content */}
      <main className="flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <motion.div
          className="w-full max-w-3xl bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-10 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl font-bold text-center mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
            Your Profile
          </h2>
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Image
                src="/images/user1.png"
                alt="Profile"
                width={128}
                height={128}
                className="rounded-full border-4 border-purple-500/50 shadow-lg"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent"></div>
            </div>
            <h3 className="text-2xl font-semibold mt-4 tracking-wide">
              {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
            </h3>
            <p className="text-gray-400 text-sm mt-1">@{user.username}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 tracking-wide">Full Name</label>
              <p className="text-lg text-gray-100 mt-1">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.trim()
                  : "Not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 tracking-wide">Email</label>
              <p className="text-lg text-gray-100 mt-1">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 tracking-wide">Contact</label>
              <p className="text-lg text-gray-100 mt-1">{user.contact || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 tracking-wide">Address</label>
              <p className="text-lg text-gray-100 mt-1">{user.address || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 tracking-wide">Gender</label>
              <p className="text-lg text-gray-100 mt-1">{user.gender || "Not provided"}</p>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/edit-profile"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-300"
            >
              Edit Profile
            </Link>
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
}

export default function Profile() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}