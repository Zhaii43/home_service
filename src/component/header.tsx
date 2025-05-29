"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

interface BookingType {
  id: number;
  status: "scheduled" | "completed";
}

// Interface for API response structure in fetchBookings
interface BookingApiResponse {
  id: number;
  status: "scheduled" | "completed";
}

const headerAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

const logoHover = {
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
};

const dropdownAnimation = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const notificationAnimation = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newCompletedBookings, setNewCompletedBookings] = useState<BookingType[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserDetails(token);
      fetchBookings(token);
    }
  }, []);

  useEffect(() => {
    if (pathname === "/my-booking" && showNotification) {
      // Notification persists until manually closed or completed tab is visited
    }
  }, [pathname, showNotification]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  // Set initial mount flag to false after first render
  useEffect(() => {
    setIsInitialMount(false);
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

  const fetchBookings = async (token: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/bookings/my/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = response.data.map((booking: BookingApiResponse) => ({
        id: booking.id,
        status: booking.status,
      }));

      const viewedBookingIds = JSON.parse(localStorage.getItem("viewedIds") || "[]") as number[];

      const completedBookings = bookingsData.filter((booking: BookingType) => booking.status === "completed");
      const newCompleted = completedBookings.filter(
        (booking: BookingType) => !viewedBookingIds.includes(booking.id)
      );

      setNewCompletedBookings(newCompleted);
      setShowNotification(newCompleted.length > 0);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
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
      localStorage.removeItem("viewedIds");
      setIsLoggedIn(false);
      setUsername(null);
      setShowNotification(false);
      window.location.href = "/login";
    }
  };

  const handleNotificationClose = () => {
    const viewedBookingIds = JSON.parse(localStorage.getItem("viewedIds") || "[]") as number[];
    const updatedViewedIds = [
      ...viewedBookingIds,
      ...newCompletedBookings.map((booking) => booking.id),
    ];
    localStorage.setItem("viewedIds", JSON.stringify(updatedViewedIds));
    setShowNotification(false);
  };

  return (
    <>
      {/* Add padding to the top of the body to account for fixed header */}
      <style jsx global>{`
        body {
          padding-top: 64px;
        }
        header {
          opacity: 1 !important;
        }
      `}</style>

      <motion.header
        className="flex justify-between items-center px-4 sm:px-16 py-4 bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg z-50 fixed w-full top-0"
        initial={isInitialMount ? "hidden" : false}
        animate={isInitialMount ? "visible" : false}
        variants={headerAnimation}
        role="banner"
      >
        <Link href="/" aria-label="Home">
          <motion.div variants={logoHover} whileHover="hover">
            <Image
              src="/images/mechanic.png"
              alt="Home Services Logo"
              width={48}
              height={36}
              className="drop-shadow-md transition-opacity duration-300"
              priority
            />
          </motion.div>
        </Link>

        {/* Hamburger Menu Button for Mobile */}
        <button
          className="sm:hidden text-white hover:text-indigo-300 transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-8 w-8" />
          ) : (
            <Bars3Icon className="h-8 w-8" />
          )}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex gap-10 text-base font-medium font-['Inter'] text-white items-center">
          <Link
            href="/"
            className="relative text-white hover:text-indigo-300 transition-colors duration-300 group"
          >
            Home
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300 ease-in-out" />
          </Link>
          <Link
            href="/services"
            className="relative text-white hover:text-indigo-300 transition-colors duration-300 group"
          >
            Services
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300 ease-in-out" />
          </Link>
          <Link
            href="/about-us"
            className="relative text-white hover:text-indigo-300 transition-colors duration-300 group"
          >
            About Us
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300 ease-in-out" />
          </Link>
          <Link
            href="/contact"
            className="relative text-white hover:text-indigo-300 transition-colors duration-300 group"
          >
            Contact
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300 ease-in-out" />
          </Link>
        </nav>

        {/* User Profile/Login */}
        <div className="relative">
          {isLoggedIn ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 sm:gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label={`Toggle user menu for ${username}`}
                aria-expanded={dropdownOpen}
              >
                <span className="font-medium text-white hover:text-indigo-300 transition-colors duration-200 text-sm sm:text-base">
                  {username}
                </span>
                <Image
                  src="/images/user1.png"
                  alt="User Profile"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-indigo-400 p-0.5 hover:scale-105 transition-transform duration-200"
                />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-3 bg-gray-800/95 border border-gray-700 rounded-lg shadow-xl w-48 sm:w-56 z-50 backdrop-blur-md"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownAnimation}
                    role="menu"
                  >
                    <Link
                      href="/profile"
                      className="block px-5 py-3 text-white hover:bg-indigo-700/50 hover:text-white transition-colors duration-200 rounded-t-lg"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/my-booking"
                      className="block px-5 py-3 text-white hover:bg-indigo-700/50 hover:text-white transition-colors duration-200"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-5 py-3 text-white hover:bg-indigo-700/50 hover:text-white transition-colors duration-200 rounded-b-lg"
                      role="menuitem"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login" aria-label="Sign in">
              <Image
                src="/images/user1.png"
                alt="Sign In"
                width={40}
                height={40}
                className="rounded-full hover:scale-105 transition-transform duration-200"
              />
            </Link>
          )}
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="sm:hidden fixed top-[64px] left-0 w-full h-[calc(100vh-64px)] bg-gray-800/95 border-t border-gray-700 z-40 backdrop-blur-md overflow-y-auto"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            role="navigation"
          >
            <nav className="flex flex-col items-center gap-6 py-10 text-lg font-medium font-['Inter'] text-white">
              <Link
                href="/"
                className="text-white hover:text-indigo-300 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/services"
                className="text-white hover:text-indigo-300 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/about-us"
                className="text-white hover:text-indigo-300 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-indigo-300 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    href="/profile"
                    className="text-white hover:text-indigo-300 transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/my-booking"
                    className="text-white hover:text-indigo-300 transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-indigo-300 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="fixed top-[80px] sm:top-[96px] right-4 sm:right-16 bg-indigo-600/90 text-white rounded-lg p-4 sm:p-5 shadow-lg z-50 max-w-[90%] sm:max-w-md"
            variants={notificationAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="alert"
          >
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {newCompletedBookings.length} Booking{newCompletedBookings.length > 1 ? "s" : ""} Completed
                </h3>
                <p className="text-xs sm:text-sm mt-1">
                  View details in your bookings section.
                </p>
              </div>
              <button
                onClick={handleNotificationClose}
                className="text-white hover:text-gray-200 transition-colors duration-200"
                aria-label="Close notification"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}