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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <motion.header
        className="flex justify-between items-center px-8 py-4 bg-transparent shadow-md"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: { y: -100, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" },
          },
        }}
      >
        <h1 className="text-xl font-bold">Home Services</h1>
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link href="/services" className="hover:text-blue-600">
            Services
          </Link>
          <Link href="/about-us" className="hover:text-blue-600">
            About Us
          </Link>
        </nav>
        <div>
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 focus:outline-none"
              >
                <span className="font-semibold text-gray-700">
                  Welcome, {username}!
                </span>
                <Image
                  src="/images/user1.png"
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
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
                alt="Login"
                width={32}
                height={32}
                className="w-8 h-8 cursor-pointer hover:opacity-80"
              />
            </Link>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex space-x-10 px-6 py-12">
        {/* Categories */}
        <aside className="w-1/4 bg-black p-3 rounded-md border border-gray-300 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Categories</h2>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleCategoryChange("all")}
                className={`w-full text-left p-2 rounded-md ${
                  category === "all"
                    ? "bg-blue-500 text-white"
                    : "hover:text-blue-600"
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
                    className={`w-full text-left p-2 rounded-md ${
                      category === cat
                        ? "bg-blue-500 text-white"
                        : "hover:text-blue-600"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                </li>
              )
            )}
          </ul>
        </aside>

        {/* Services List */}
        <section className="w-full max-w-6xl mx-auto flex-1">
          <div className="mb-6 flex items-center justify-center w-full">
            <input
              type="text"
              placeholder="Search for services..."
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <h3 className="text-xl font-bold mb-6 text-left">
            {category.charAt(0).toUpperCase() + category.slice(1)} Services
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white border rounded-lg shadow-md overflow-hidden flex flex-col h-full"
                >
                  <div className="relative w-full h-48 flex-shrink-0">
                    {service.images.length > 0 ? (
                      <Image
                        src={service.images[0].image}
                        alt={service.title}
                        fill
                        style={{ objectFit: "cover" }}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-200 text-sm text-gray-500">
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {service.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {service.description}
                    </p>
                    <p className="text-sm text-black font-bold mt-1">
                      Location: {service.location}
                    </p>
                    <button
                      onClick={() => handleViewDetails(service.id)}
                      className="mt-auto px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-32 text-gray-500">
                No services available.
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-translucent text-center py-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Home Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

// Main page component
export default function Services() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500">Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}