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
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <motion.header
        className="flex justify-between items-center px-8 py-4 bg-transparent shadow-md"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={headerAnimation}
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
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="font-semibold text-gray-700">Welcome, {username}!</span>
                <Image
                  src="/images/user1.png"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-48">
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link href="/my-booking" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
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
                alt="Login/Signup"
                width={32}
                height={32}
                className="cursor-pointer hover:opacity-80"
              />
            </Link>
          )}
        </div>
      </motion.header>
      
      <motion.main
        className="flex flex-col items-center justify-center flex-grow text-center p-8"
        variants={fadeInAnimation}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h2 className="text-4xl font-bold mb-4">Find Home Services/Repair Near You</h2>
        <p className="text-lg mb-2 text-gray-600">Explore Best Home Service & Repair near you.</p>

        {/* Search Bar */}
        <div className="mt-8 flex items-center justify-center w-full">
          <input
            type="text"
            placeholder="Search for services..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Search
          </button>
        </div>
        
        {/* Categories Section */}
        <section className="mt-12 w-full max-w-4xl text-center">
          <div className="flex flex-wrap justify-center gap-4">
            {/* Cleaning */}
            <a
              href="/services?category=cleaning"
              className="flex flex-col items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 hover:scale-105 transform transition duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
              <Image
                src="/images/mop.png"
                alt="Cleaning"
                width={32}
                height={32}
                className="mb-2"
              />
              Cleaning
            </a>
            {/* Repair */}
            <a
              href="/services?category=repair"
              className="flex flex-col items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 hover:scale-105 transform transition duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
              <Image
                src="/images/support.png"
                alt="Repair"
                width={32}
                height={32}
                className="mb-2"
              />
              Repair
            </a>
            {/* Painting */}
            <a
              href="/services?category=painting"
              className="flex flex-col items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 hover:scale-105 transform transition duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
              <Image
                src="/images/paintbrush.png"
                alt="Painting"
                width={32}
                height={32}
                className="mb-2"
              />
              Painting
            </a>
            {/* Plumbing */}
            <a
              href="/services?category=plumbing"
              className="flex flex-col items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 hover:scale-105 transform transition duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
              <Image
                src="/images/repairing.png"
                alt="Plumbing"
                width={32}
                height={32}
                className="mb-2"
              />
              Plumbing
            </a>
            {/* Electric */}
            <a
              href="/services?category=electric"
              className="flex flex-col items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 hover:scale-105 transform transition duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
              <Image
                src="/images/electricity.png"
                alt="Electric"
                width={32}
                height={32}
                className="mb-2"
              />
              Electric
            </a>
          </div>
        </section>

        {/* Popular Businesses Section */}
        <section className="mt-16 w-full max-w-6xl mx-auto">
          <h3 className="text-xl font-bold mb-6 text-left">Popular Businesses</h3>
          <div className="grid grid-cols-1 sm:grid-cols- sticks2 lg:grid-cols-4 gap-5">
            {filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business) => (
                <div key={business.id} className="bg-white border rounded-xl shadow-lg p-0 hover:shadow-[0_4px_20px_rgba(128,0,255,0.3)] transition-shadow duration-300">
                  <div className="rounded-xl overflow-hidden w-full h-[200px] relative hover:scale-105 transform transition duration-300">
                    <Image 
                      src={business.image} 
                      alt={business.service_name} 
                      layout="fill" 
                      objectFit="cover" 
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <span className="inline-block bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-md mb-2">
                      {business.service_category}
                    </span>
                    <h4 className="text-lg font-semibold mb-1 text-gray-800 text-left">{business.service_name}</h4>
                    <p className="text-sm text-gray-500 text-left">{business.location}</p>
                    <button className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 hover:scale-105 transform transition duration-300 w-full">
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-4">No businesses found.</p>
            )}
          </div>
        </section>
      </motion.main>

      <footer className="bg-translucent text-center py-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Home Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
}