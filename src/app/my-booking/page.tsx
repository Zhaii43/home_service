"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Header from "@/component/header";

interface ImageType {
  id: number;
  image: string;
}

interface ServiceType {
  id: number;
  title: string;
  location: string | null;
  images: ImageType[];
}

interface BookingType {
  id: number;
  service_detail: ServiceType | null; // Match API response field name
  booking_date: string;
  booking_time: string;
  is_editable: boolean;
  status: "scheduled" | "completed";
  created_at: string;
}

function MyBookingContent() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"scheduled" | "completed">("scheduled");

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const fetchBookings = useCallback(async (token: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/bookings/my/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched bookings:", response.data);
      setBookings(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch bookings:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error("Unexpected error fetching bookings:", error);
      }
      setError("Failed to fetch bookings.");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      fetchBookings(token);
    } else {
      router.push("/login");
    }
  }, [fetchBookings, router]);

  if (!isLoggedIn) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Redirecting to login...</div>;
  }

  const scheduledBookings = bookings.filter((booking) => booking.status === "scheduled");
  const completedBookings = bookings.filter((booking) => booking.status === "completed");

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      <Header />
      {/* Main Content */}
      <main className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <motion.div
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
            My Bookings
          </h2>
          {error && (
            <p className="text-red-400 text-center mb-6">{error}</p>
          )}

          {/* Navigation Bar */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-800/50 border border-gray-700 rounded-full p-1">
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === "scheduled"
                    ? "bg-gradient-to-r from-purple-linked600 to-purple-700 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("scheduled")}
              >
                Booked (Upcoming)
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === "completed"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("completed")}
              >
                Completed
              </button>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center text-gray-400">
              <p className="text-lg">No bookings found.</p>
              <Link
                href="/services"
                className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
              >
                Book a Service
              </Link>
            </div>
          ) : (
            <div>
              {activeTab === "scheduled" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {scheduledBookings.length === 0 ? (
                    <p className="text-gray-400 text-center">No upcoming bookings.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {scheduledBookings.map((booking) => {
                        if (!booking.service_detail) {
                          console.warn(`Booking ID ${booking.id} has no service data`);
                          return (
                            <motion.div
                              key={booking.id}
                              className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg p-6"
                              variants={cardAnimation}
                              initial="hidden"
                              animate="visible"
                            >
                              <div className="text-gray-400 text-center">
                                Service unavailable
                              </div>
                              <p className="text-gray-300 mb-2">
                                <span className="font-semibold text-white">Date:</span> {booking.booking_date}
                              </p>
                              <p className="text-gray-300 mb-2">
                                <span className="font-semibold text-white">Time:</span> {booking.booking_time}
                              </p>
                              <p className="text-sm text-gray-400">
                                {booking.is_editable ? "Editable" : "Non-editable"}
                              </p>
                            </motion.div>
                          );
                        }
                        return (
                          <motion.div
                            key={booking.id}
                            className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg p-6"
                            variants={cardAnimation}
                            initial="hidden"
                            animate="visible"
                          >
                            <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                              {booking.service_detail.images && booking.service_detail.images.length > 0 ? (
                                <Image
                                  src={booking.service_detail.images[0].image}
                                  alt={booking.service_detail.title}
                                  fill
                                  style={{ objectFit: "cover" }}
                                  className="rounded-lg"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-700 text-gray-400 rounded-lg">
                                  No image available
                                </div>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{booking.service_detail.title}</h3>
                            <p className="text-gray-300 mb-2">
                              <span className="font-semibold text-white">Date:</span> {booking.booking_date}
                            </p>
                            <p className="text-gray-300 mb-2">
                              <span className="font-semibold text-white">Time:</span> {booking.booking_time}
                            </p>
                            <p className="text-gray-300 mb-4">
                              <span className="font-semibold text-white">Location:</span>{" "}
                              {booking.service_detail.location || "Not specified"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {booking.is_editable ? "Editable" : "Non-editable"}
                            </p>
                            <Link
                              href={`/services?id=${booking.service_detail.id}`}
                              className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
                            >
                              View Service
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === "completed" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {completedBookings.length === 0 ? (
                    <p className="text-gray-400 text-center">No completed bookings.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedBookings.map((booking) => {
                        if (!booking.service_detail) {
                          console.warn(`Booking ID ${booking.id} has no service data`);
                          return (
                            <motion.div
                              key={booking.id}
                              className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg p-6"
                              variants={cardAnimation}
                              initial="hidden"
                              animate="visible"
                            >
                              <div className="text-gray-400 text-center">
                                Service unavailable
                              </div>
                              <p className="text-gray-300 mb-2">
                                <span className="font-semibold text-white">Date:</span> {booking.booking_date}
                              </p>
                              <p className="text-gray-300 mb-2">
                                <span className="font-semibold text-white">Time:</span> {booking.booking_time}
                              </p>
                              <p className="text-sm text-gray-400">
                                {booking.is_editable ? "Editable" : "Non-editable"}
                              </p>
                            </motion.div>
                          );
                        }
                        return (
                          <motion.div
                            key={booking.id}
                            className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg p-6"
                            variants={cardAnimation}
                            initial="hidden"
                            animate="visible"
                          >
                            <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                              {booking.service_detail.images && booking.service_detail.images.length > 0 ? (
                                <Image
                                  src={booking.service_detail.images[0].image}
                                  alt={booking.service_detail.title}
                                  fill
                                  style={{ objectFit: "cover" }}
                                  className="rounded-lg"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-700 text-gray-400 rounded-lg">
                                  No image available
                                </div>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{booking.service_detail.title}</h3>
                            <p className="text-gray-300 mb-2">
                              <span className="font-semibold text-white">Date:</span> {booking.booking_date}
                            </p>
                            <p className="text-gray-300 mb-2">
                              <span className="font-semibold text-white">Time:</span> {booking.booking_time}
                            </p>
                            <p className="text-gray-300 mb-4">
                              <span className="font-semibold text-white">Location:</span>{" "}
                              {booking.service_detail.location || "Not specified"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {booking.is_editable ? "Editable" : "Non-editable"}
                            </p>
                            <Link
                              href={`/services?id=${booking.service_detail.id}`}
                              className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
                            >
                              View Service
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
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

export default function MyBooking() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Loading bookings...</div>}>
      <MyBookingContent />
    </Suspense>
  );
}