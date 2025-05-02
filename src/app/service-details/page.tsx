"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface ImageType {
  id: number;
  image: string;
}

interface ServiceType {
  id: number;
  category: string;
  title: string;
  description: string;
  images: ImageType[];
  location: string;
}

function ServiceDetailsContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id");

  const [service, setService] = useState<ServiceType | null>(null);
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

  const fetchUserDetails = useCallback(async (token: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(response.data.username);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch user details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error("Unexpected error fetching user details:", error);
      }
    }
  }, []);

  const fetchServiceDetails = useCallback(async () => {
    if (!serviceId) return;
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/services/${serviceId}`
      );
      setService(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch service details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error("Unexpected error fetching service details:", error);
      }
    }
  }, [serviceId]);

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
      setUsername(null);
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserDetails(token);
    }
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId, fetchUserDetails, fetchServiceDetails]);

  if (!service) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>;
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
                  {username}
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

      {/* Service Details */}
      <main className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <motion.div
          className="w-full max-w-5xl bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
        >
          {/* Left side: Image */}
          <div className="relative w-full lg:w-1/2 h-80 lg:h-auto">
            {service.images.length > 0 ? (
              <Image
                src={service.images[0].image}
                alt={service.title}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-700 text-gray-400">
                No image available
              </div>
            )}
            <div className="absolute inset-0 rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none bg-gradient-to-br from-purple-500/20 to-transparent"></div>
          </div>

          {/* Right side: Description */}
          <div className="w-full lg:w-1/2 p-8">
            <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 tracking-tight">
              {service.title}
            </h1>
            <p className="text-lg text-gray-300 mb-4">{service.description}</p>
            <p className="text-md text-gray-300 mb-6 flex items-center">
              <span className="font-semibold text-white">Location:</span>
              <span className="ml-2 text-purple-400">{service.location}</span>
            </p>
            <button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-300"
            >
              Book Now
            </button>
          </div>
        </motion.div>

        {/* Image Gallery */}
        <motion.div
          className="w-full max-w-6xl mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
            Gallery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.images.map((image) => (
              <motion.div
                key={image.id}
                className="relative w-full h-64 rounded-xl shadow-lg overflow-hidden group"
                variants={cardAnimation}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
              >
                <Image
                  src={image.image}
                  alt={service.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent group-hover:bg-purple-500/30 transition-all duration-300"></div>
              </motion.div>
            ))}
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

export default function ServiceDetails() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Loading service details...</div>}>
      <ServiceDetailsContent />
    </Suspense>
  );
}