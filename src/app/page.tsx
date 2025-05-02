"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  interface PopularBusiness {
    id: number;
    service_category: string;
    service_name: string;
    location: string;
    image: string;
  }

  const fadeInAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.6 } },
  };

  const headerAnimation = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const [businesses, setBusinesses] = useState<PopularBusiness[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/business/list/");
        setBusinesses(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();

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

  const filteredBusinesses = businesses.filter((business) =>
    business.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.service_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>;

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
                    className="block px-4 py-3 text-gray200 hover:bg-gray-700 hover:text-white transition-colors duration-200"
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

      {/* Main Content */}
      <motion.main
        className="flex flex-col items-center justify-center flex-grow text-center px-4 sm:px-6 lg:px-8 py-16"
        variants={fadeInAnimation}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 tracking-tight">
          Find Home Services Near You
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl">
          Discover top-rated home service and repair professionals in your area.
        </p>

        {/* Search Bar */}
        <div className="mt-8 flex items-center justify-center w-full max-w-3xl">
          <input
            type="text"
            placeholder="Search for services..."
            className="w-full px-5 py-3 bg-gray-800/50 border border-gray-700 rounded-l-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-r-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200">
            Search
          </button>
        </div>

        {/* Categories Section */}
        <section className="mt-16 w-full max-w-5xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Service Categories</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "Cleaning", icon: "/images/mop.png", category: "cleaning" },
              { name: "Repair", icon: "/images/support.png", category: "repair" },
              { name: "Painting", icon: "/images/paintbrush.png", category: "painting" },
              { name: "Plumbing", icon: "/images/repairing.png", category: "plumbing" },
              { name: "Electric", icon: "/images/electricity.png", category: "electric" },
            ].map((category) => (
              <a
                key={category.category}
                href={`/services?category=${category.category}`}
                className="flex flex-col items-center px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 hover:scale-105 transform transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={32}
                  height={32}
                  className="mb-2"
                />
                <span className="text-gray-200 font-medium">{category.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Popular Businesses Section */}
        <section className="mt-16 w-full max-w-6xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-left">Popular Businesses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business) => (
                <motion.div
                  key={business.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-0 hover:shadow-[0_4px_20px_rgba(128,0,255,0.3)] transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="rounded-t-xl overflow-hidden w-full h-[200px] relative group">
                    <Image
                      src={business.image}
                      alt={business.service_name}
                      layout="fill"
                      objectFit="cover"
                      className="absolute top-0 left-0 w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <span className="inline-block bg-purple-500/20 text-purple-400 text-xs font-medium px-2 py-1 rounded-md mb-2">
                      {business.service_category}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-100 mb-1 text-left">{business.service_name}</h4>
                    <p className="text-sm text-gray-400 text-left">{business.location}</p>
                    <button className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-300 w-full">
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-4">No businesses found.</p>
            )}
          </div>
        </section>
      </motion.main>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-md text-center py-6">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Home Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
}