"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import axios from "axios";

interface ImageType {
  id: number;
  image: string;
}

interface ServiceType {
  id: number;
  category: string;
  title: string;
  description: string;
  location: string;
  images: ImageType[];
}

// Client-side component that uses useSearchParams and useRouter
function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "all";

  const [services, setServices] = useState<ServiceType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const headerAnimation = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserDetails(token);
    }
    fetchServices();
  }, [category]);

  const fetchUserDetails = async (token: string) => {
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
  };

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

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/service-images");
      setServices(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch services:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error("Unexpected error fetching services:", error);
      }
    }
  };

  const handleViewDetails = (serviceId: number) => {
    router.push(`/service-details?id=${serviceId}`);
  };

  const handleCategoryChange = (selectedCategory: string) => {
    router.push(`/services?category=${selectedCategory}`);
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const filteredServices = services
    .filter((service) => category === "all" || service.category === category)
    .filter((service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-3 focus:outline-none"
              >
                <span className="font-semibold text-gray-200 hover:text-white transition-colors duration-200">
                  {username}
                </span>
                <Image
                  src="/images/user1.png"
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-purple-500 p-0.5 hover:opacity-90 transition-opacity duration-200"
                />
              </button>
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

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-10 px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories */}
        <motion.aside
          className="lg:w-1/4 bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Categories</h2>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleCategoryChange("all")}
                className={`w-full text-left px-4 py-3 rounded-lg text-gray-200 font-medium transition-all duration-200 ${
                  category === "all"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                    : "hover:bg-gray-700 hover:text-purple-400"
                }`}
              >
                All Services
              </button>
            </li>
            {[...new Set(services.map((service) => service.category))].map(
              (cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-gray-200 font-medium transition-all duration-200 ${
                      category === cat
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                        : "hover:bg-gray-700 hover:text-purple-400"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                </li>
              )
            )}
          </ul>
        </motion.aside>

        {/* Services List */}
        <section className="w-full lg:flex-1">
          <motion.div
            className="mb-8 flex items-center justify-center w-full max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
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
          </motion.div>

          <motion.h3
            className="text-2xl font-bold text-white mb-6 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {category === "all" ? "All Services" : `${category.charAt(0).toUpperCase() + category.slice(1)} Services`}
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-[0_4px_20px_rgba(128,0,255,0.3)] transition-all duration-300"
                  variants={cardAnimation}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="relative w-full h-48 flex-shrink-0 group">
                    {service.images.length > 0 ? (
                      <Image
                        src={service.images[0].image}
                        alt={service.title}
                        fill
                        style={{ objectFit: "cover" }}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-700 text-sm text-gray-400">
                        No image available
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h4 className="text-lg font-semibold text-gray-100">{service.title}</h4>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{service.description}</p>
                    <p className="text-sm text-gray-300 font-medium mt-1">Location: {service.location}</p>
                    <button
                      onClick={() => handleViewDetails(service.id)}
                      className="mt-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-32 text-gray-400">
                No services available.
              </div>
            )}
          </div>
        </section>
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

// Main page component
export default function Services() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}