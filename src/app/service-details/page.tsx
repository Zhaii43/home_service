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
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
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
        <h1 className="text-xl font-bold">Home Services</h1>
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <Link href="/services" className="hover:text-blue-600">Services</Link>
          <Link href="/about-us" className="hover:text-blue-600">About Us</Link>
        </nav>
        <div>
          {isLoggedIn ? (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="font-semibold text-white">Welcome, {username}!</span>
                <Image
                  src="/images/user1.png"
                  alt="User"
                  width={32}
                  height={32}
                  className="w-8 h-8 cursor-pointer hover:opacity-80"
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

      {/* Service Details */}
      <div className="flex flex-col items-center min-h-screen bg-black p-8">
        {/* Hero Section */}
        <div className="w-full max-w-4xl bg-transparent rounded-xl shadow-lg overflow-hidden flex">
          {/* Left side: Image */}
          <div className="relative w-1/2 h-64">
            {service.images.length > 0 ? (
              <Image
                src={service.images[0].image}
                alt={service.title}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-t-xl"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
                No image available
              </div>
            )}
          </div>

          {/* Right side: Description */}
          <div className="w-1/2 p-5">
            <h1 className="text-4xl font-bold text-white mb-3">{service.title}</h1>
            <p className="text-lg text-white mb-2">{service.description}</p>
            <p className="text-md text-gray-600 mb-5 flex items-center">
              <span className="font-semibold text-white">Location:</span>
              <span className="ml-2 text-purple-600">{service.location}</span>
            </p>
            {/* Book Now Button */}
            <div className="mt-4">
              <button
                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition duration-300"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="w-full max-w-6xl mt-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.images.map((image) => (
              <div
                key={image.id}
                className="relative w-full h-64 bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <Image
                  src={image.image}
                  alt={service.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetails() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500">Loading service details...</div>}>
      <ServiceDetailsContent />
    </Suspense>
  );
}