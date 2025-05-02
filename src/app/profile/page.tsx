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
      console.log("User details response:", response.data); // Debug log
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
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <motion.header
        className="flex justify-between items-center px-8 py-4 bg-transparent shadow-md"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: { y: -100, opacity: 0 },
          visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
        }}
      >
        <h1 className="text-xl font-bold text-white">Home Services</h1>
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-purple-600 text-white">Home</Link>
          <Link href="/services" className="hover:text-purple-600 text-white">Services</Link>
          <Link href="/about-us" className="hover:text-purple-600 text-white">About Us</Link>
        </nav>
        <div>
          {isLoggedIn ? (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="font-semibold text-white">Welcome, {user.username}!</span>
                <Image
                  src="/images/user1.png"
                  alt="User"
                  width={32}
                  height={32}
                  className="w-8 h-8 cursor-pointer hover:opacity-80 rounded-full"
                />
              </div>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg w-48">
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
                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
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

      {/* Profile Content */}
      <main className="flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold text-center mb-6">User Profile</h2>
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/images/user1.png"
              alt="Profile"
              width={120}
              height={120}
              className="rounded-full mb-4"
            />
            <h3 className="text-xl font-semibold">
              {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
            </h3>
            <p className="text-gray-400">@{user.username}</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <p className="text-lg">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.trim()
                  : "Not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Contact</label>
              <p className="text-lg">{user.contact || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Address</label>
              <p className="text-lg">{user.address || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Gender</label>
              <p className="text-lg">{user.gender || "Not provided"}</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/edit-profile"
              className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition duration-300"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-translucent text-center py-4">
        <p className="ext-sm text-gray-600">
          © {new Date().getFullYear()} Home Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}