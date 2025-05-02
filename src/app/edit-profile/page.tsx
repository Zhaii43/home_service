"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
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

function EditProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    contact: "",
    address: "",
    gender: "",
    email: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const headerAnimation = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const fetchUserDetails = useCallback(async (token: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User details response:", response.data);
      setUser(response.data);
      setIsLoggedIn(true);
      setFormData({
        first_name: response.data.first_name || "",
        middle_name: response.data.middle_name || "",
        last_name: response.data.last_name || "",
        contact: response.data.contact || "",
        address: response.data.address || "",
        gender: response.data.gender || "",
        email: response.data.email || "",
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.put(
        "http://127.0.0.1:8000/api/user/update/",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      setFormSuccess("Profile updated successfully!");
      setTimeout(() => router.push("/profile"), 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to update profile:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        setFormError(error.response?.data?.error || "Failed to update profile. Please try again.");
      } else {
        console.error("Unexpected error updating profile:", error);
        setFormError("An unexpected error occurred.");
      }
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

      {/* Edit Profile Content */}
      <main className="flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="w-full max-w-2xl bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl p-8"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 tracking-tight">
            Edit Profile
          </h2>
          {formError && (
            <motion.div
              className="text-red-400 text-center mb-4 bg-red-900/20 border border-red-700 rounded-lg py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formError}
            </motion.div>
          )}
          {formSuccess && (
            <motion.div
              className="text-green-400 text-center mb-4 bg-green-900/20 border border-green-700 rounded-lg py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formSuccess}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300" htmlFor="first_name">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300" htmlFor="middle_name">
                Middle Name
              </label>
              <input
                type="text"
                id="middle_name"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Enter middle name (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300" htmlFor="last_name">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300" htmlFor="contact">
                Contact
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Enter contact number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300" htmlFor="address">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Enter address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-300"
              >
                Save Changes
              </button>
              <Link
                href="/profile"
                className="px-8 py-3 bg-gray-600/50 border border-gray-700 text-gray-200 font-semibold rounded-full shadow-lg hover:bg-gray-700 hover:scale-105 transform transition-all duration-300"
              >
                Cancel
              </Link>
            </div>
          </form>
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

export default function EditProfile() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Loading profile...</div>}>
      <EditProfileContent />
    </Suspense>
  );
}