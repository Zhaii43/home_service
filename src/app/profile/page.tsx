"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import axios from "axios";
import Header from "@/component/header";

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
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async (token: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User details response:", response.data);
      setUser(response.data);
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