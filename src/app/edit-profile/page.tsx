"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import Header from "@/component/header";
import Footer from "@/component/footer";
import { Eye, EyeOff } from "lucide-react";

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

interface UpdateUserPayload {
  first_name: string;
  middle_name: string;
  last_name: string;
  contact: string;
  address: string;
  gender: string;
  email: string;
  current_password?: string;
  password?: string;
  confirm_password?: string;
}

function EditProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    contact: "",
    address: "",
    gender: "",
    email: "",
    current_password: "",
    password: "",
    confirm_password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    password: false,
    confirm_password: false,
  });

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const fetchUserDetails = useCallback(async (token: string) => {
    try {
      const response = await axios.get("https://backend-r9v8.onrender.com/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User details response:", response.data);
      setUser(response.data);
      setFormData({
        first_name: response.data.first_name || "",
        middle_name: response.data.middle_name || "",
        last_name: response.data.last_name || "",
        contact: response.data.contact || "",
        address: response.data.address || "",
        gender: response.data.gender || "",
        email: response.data.email || "",
        current_password: "",
        password: "",
        confirm_password: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Client-side validation for passwords
    if (formData.password || formData.confirm_password || formData.current_password) {
      if (!formData.current_password) {
        setFormError("Current password is required to update password.");
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setFormError("New password and confirm password do not match.");
        return;
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setFormError(
          "New password must be at least 8 characters long, contain at least one uppercase letter, and one special character (!@#$%^&*)."
        );
        return;
      }
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const payload: UpdateUserPayload = {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        contact: formData.contact,
        address: formData.address,
        gender: formData.gender,
        email: formData.email,
      };
      if (formData.current_password && formData.password && formData.confirm_password) {
        payload.current_password = formData.current_password;
        payload.password = formData.password;
        payload.confirm_password = formData.confirm_password;
      }

      const response = await axios.put(
        "https://backend-r9v8.onrender.com/api/user/update/",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      setFormSuccess("Profile updated successfully!");
      setFormData((prev) => ({
        ...prev,
        current_password: "",
        password: "",
        confirm_password: "",
      }));
      setShowPasswords({
        current_password: false,
        password: false,
        confirm_password: false,
      });
      setTimeout(() => router.push("/profile"), 1000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        console.error("Failed to update profile:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        // Check for specific current_password error
        if (error.response.data.current_password) {
          setFormError(error.response.data.current_password);
        } else {
          setFormError(error.response.data.error || "Failed to update profile. Please try again.");
        }
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
      <Header />

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
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300" htmlFor="current_password">
                Current Password
              </label>
              <input
                type={showPasswords.current_password ? "text" : "password"}
                id="current_password"
                name="current_password"
                value={formData.current_password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 pr-10"
                placeholder="Enter current password (optional)"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current_password")}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-200"
              >
                {showPasswords.current_password ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300" htmlFor="password">
                New Password
              </label>
              <input
                type={showPasswords.password ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 pr-10"
                placeholder="Enter new password (optional)"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("password")}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-200"
              >
                {showPasswords.password ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300" htmlFor="confirm_password">
                Confirm New Password
              </label>
              <input
                type={showPasswords.confirm_password ? "text" : "password"}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 pr-10"
                placeholder="Confirm new password (optional)"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm_password")}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-200"
              >
                {showPasswords.confirm_password ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-200"
              >
                Save Changes
              </button>
              <Link
                href="/profile"
                className="px-8 py-3 bg-gray-600/50 border border-gray-700 text-gray-200 font-semibold rounded-full shadow-lg hover:bg-gray-700 hover:scale-105 transform transition-all duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
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