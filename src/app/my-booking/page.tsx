"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Header from "@/component/header";
import Footer from "@/component/footer";
import { CalendarIcon, ClockIcon, MapPinIcon, CurrencyDollarIcon, ListBulletIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ImageType {
  id: number;
  image: string;
}

interface WorkSpecificationType {
  id: number;
  name: string;
  price: number;
}

interface ServiceType {
  id: number;
  title: string;
  location: string | null;
  images: ImageType[] | null | undefined;
  work_specifications?: WorkSpecificationType[] | null | undefined;
}

interface BookingType {
  id: number;
  service_detail: ServiceType | null;
  work_specifications: WorkSpecificationType[] | null | undefined;
  price: number;
  booking_date: string;
  booking_time: string;
  is_editable: boolean;
  status: "scheduled" | "completed";
  created_at: string;
}

interface BookingApiResponse {
  id: number;
  service_detail: {
    id: number;
    title: string;
    location: string | null;
    images: ImageType[] | null;
    work_specifications: WorkSpecificationType[] | null;
  } | null;
  work_specifications_detail: WorkSpecificationType[] | null;
  price: string | number;
  booking_date: string;
  booking_time: string;
  is_editable: boolean;
  status: "scheduled" | "completed";
  created_at: string;
}

interface WorkSpecificationApiResponse {
  id: number;
  name: string;
  price: string | number;
}

function MyBookingContent() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"scheduled" | "completed">("scheduled");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedWorkSpecs, setSelectedWorkSpecs] = useState<number[]>([]);
  const [availableWorkSpecs, setAvailableWorkSpecs] = useState<WorkSpecificationType[]>([]);

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const modalAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const generateTimeOptions = (): string[] => {
    const options: string[] = [];
    for (let hour = 9; hour <= 19; hour++) {
      options.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 19) {
        options.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return options;
  };

  const formatTimeTo12Hour = (time: string): string => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const isWithinAllowedTime = (time: string): boolean => {
    const [hour, minute] = time.split(":").map(Number);
    const totalMinutes = hour * 60 + minute;
    const startMinutes = 9 * 60;
    const endMinutes = 19 * 60;
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
  };

  const isValidRescheduleTime = (bookingDate: string, bookingTime: string): boolean => {
    const now = new Date();
    const todayPHT = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00+08:00`);
    if (bookingDateTime <= todayPHT) {
      return false;
    }
    return isWithinAllowedTime(bookingTime);
  };

  const timeUntil7PM = (bookingDate: string, bookingTime: string): string => {
    const now = new Date();
    const todayPHT = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00+08:00`);
    const sevenPM = new Date(bookingDateTime);
    sevenPM.setHours(19, 0, 0, 0);

    if (todayPHT.toDateString() !== bookingDateTime.toDateString()) {
      return isWithinAllowedTime(bookingTime) ? "Valid time" : "Time outside allowed range (9:00 AM - 7:00 PM)";
    }

    if (!isWithinAllowedTime(bookingTime)) {
      return "Time outside allowed range (9:00 AM - 7:00 PM)";
    }

    const timeDiff = sevenPM.getTime() - todayPHT.getTime();
    if (timeDiff <= 0) {
      return "Past 7:00 PM";
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m until 7:00 PM`;
  };

  const fetchBookings = useCallback(async (token: string) => {
    try {
      const response = await axios.get("https://backend-r9v8.onrender.com/api/bookings/my/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = response.data.map((booking: BookingApiResponse) => ({
        ...booking,
        price: parseFloat(String(booking.price)) || 0,
        service_detail: booking.service_detail
          ? {
              ...booking.service_detail,
              images: Array.isArray(booking.service_detail.images)
                ? booking.service_detail.images
                : [],
              work_specifications: Array.isArray(booking.service_detail.work_specifications)
                ? booking.service_detail.work_specifications.map((spec) => ({
                    ...spec,
                    price: parseFloat(String(spec.price)) || 0,
                  }))
                : [],
            }
          : null,
        work_specifications: Array.isArray(booking.work_specifications_detail)
          ? booking.work_specifications_detail.map((spec) => ({
              ...spec,
              price: parseFloat(String(spec.price)) || 0,
            }))
          : [],
      }));
      setBookings(bookingsData);
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch bookings:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        setError(
          error.response?.status === 401
            ? "Session expired. Please log in again."
            : "Failed to fetch bookings. Please try again."
        );
      } else {
        console.error("Unexpected error fetching bookings:", error);
        setError("An unexpected error occurred.");
      }
    }
  }, []);

  const fetchWorkSpecifications = useCallback(async (serviceId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Authentication token missing.");
        return;
      }
      const response = await axios.get(`https://backend-r9v8.onrender.com/api/services/${serviceId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const workSpecs = Array.isArray(response.data.work_specifications)
        ? response.data.work_specifications.map((spec: WorkSpecificationApiResponse) => ({
            ...spec,
            price: parseFloat(String(spec.price)) || 0,
          }))
        : [];
      setAvailableWorkSpecs(workSpecs);
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch work specifications:", error);
        setError("Failed to fetch work specifications.");
      } else {
        console.error("Unexpected error fetching work specifications:", error);
        setError("An unexpected error occurred.");
      }
    }
  }, []);

  const handleEditBooking = (booking: BookingType) => {
    if (!booking.is_editable) {
      setError("This booking cannot be edited.");
      return;
    }
    setSelectedBooking(booking);
    setNewDate(booking.booking_date);
    setNewTime(booking.booking_time);
    setSelectedWorkSpecs(booking.work_specifications?.map((spec) => spec.id) || []);
    if (booking.service_detail?.id) {
      fetchWorkSpecifications(booking.service_detail.id);
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    if (!newDate || !newTime || selectedWorkSpecs.length === 0) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isValidRescheduleTime(newDate, newTime)) {
      setError("Rescheduling is only allowed between 9:00 AM and 7:00 PM.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Authentication token missing.");
        return;
      }
      const totalPrice = availableWorkSpecs
        .filter((spec) => selectedWorkSpecs.includes(spec.id))
        .reduce((sum, spec) => sum + Number(spec.price), 0);
      await axios.patch(
        `https://backend-r9v8.onrender.com/api/bookings/${selectedBooking.id}/`,
        {
          booking_date: newDate,
          booking_time: newTime,
          work_specifications: selectedWorkSpecs,
          price: totalPrice,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                booking_date: newDate,
                booking_time: newTime,
                work_specifications: availableWorkSpecs.filter((spec) =>
                  selectedWorkSpecs.includes(spec.id)
                ),
                price: totalPrice,
              }
            : booking
        )
      );
      setIsModalOpen(false);
      setSelectedBooking(null);
      setNewDate("");
      setNewTime("");
      setSelectedWorkSpecs([]);
      setAvailableWorkSpecs([]);
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.detail || "Failed to update booking."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    if (!confirm("Are you certain you want to cancel this booking? This action is irreversible.")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Authentication token missing.");
        return;
      }
      await axios.delete(`https://backend-r9v8.onrender.com/api/bookings/${selectedBooking.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) => prev.filter((b) => b.id !== selectedBooking.id));
      setIsModalOpen(false);
      setSelectedBooking(null);
      setNewDate("");
      setNewTime("");
      setSelectedWorkSpecs([]);
      setAvailableWorkSpecs([]);
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.detail || "Failed to cancel booking."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleSpecChange = (specId: number, checked: boolean) => {
    setSelectedWorkSpecs((prev) =>
      checked ? [...prev, specId] : prev.filter((id) => id !== specId)
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      fetchBookings(token);
    } else {
      setIsLoggedIn(false);
      router.push("/login");
    }
  }, [fetchBookings, router]);

  useEffect(() => {
    if (activeTab === "completed") {
      const completedBookings = bookings.filter((b) => b.status === "completed");
      if (completedBookings.length > 0) {
        const viewedBookingIds = JSON.parse(localStorage.getItem("viewedIds") || "[]") as number[];
        const updatedViewedIds = [
          ...new Set([
            ...viewedBookingIds,
            ...completedBookings.map((b) => b.id),
          ]),
        ];
        localStorage.setItem("viewedIds", JSON.stringify(updatedViewedIds));
      }
    }
  }, [activeTab, bookings]);

  if (!isLoggedIn) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Redirecting to login...</div>;
  }

  const scheduledBookings = bookings.filter((b) => b.status === "scheduled");
  const completedBookings = bookings.filter((b) => b.status === "completed");

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      <Header />
      <main className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <motion.div
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
            My Bookings
          </h2>
          {error && (
            <motion.p
              className="text-red-400 text-center mb-6 bg-red-500/10 rounded-lg py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}

          <div className="flex justify-center mb-10">
            <div className="flex bg-gray-800/50 border border-gray-700 rounded-full p-1.5 shadow-md">
              <button
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "scheduled"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-inner"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
                onClick={() => setActiveTab("scheduled")}
                aria-label="View upcoming bookings"
              >
                Upcoming ({scheduledBookings.length})
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "completed"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-inner"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
                onClick={() => setActiveTab("completed")}
                aria-label="View completed bookings"
              >
                Completed ({completedBookings.length})
              </button>
            </div>
          </div>

          {isModalOpen && selectedBooking && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial="hidden"
              animate="visible"
              variants={modalAnimation}
            >
              <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Edit Booking</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      min={new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }).split("T")[0]}
                      className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Time</label>
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select time</option>
                      {generateTimeOptions().map((time) => (
                        <option key={time} value={time}>
                          {formatTimeTo12Hour(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {newDate && newTime && (
                    <div className="flex items-center text-gray-300 text-sm">
                      <ClockIcon className="h-5 w-5 text-indigo-400 mr-2" />
                      <span>Time until 7:00 PM: {timeUntil7PM(newDate, newTime)}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Work Specifications</label>
                    <div className="mt-1 max-h-40 overflow-y-auto bg-gray-700 rounded-lg p-2">
                      {availableWorkSpecs.length > 0 ? (
                        availableWorkSpecs.map((spec) => (
                          <div key={spec.id} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`spec-${spec.id}`}
                              checked={selectedWorkSpecs.includes(spec.id)}
                              onChange={(e) => handleSpecChange(spec.id, e.target.checked)}
                              className="mr-2"
                            />
                            <label htmlFor={`spec-${spec.id}`} className="text-gray-300">
                              {spec.name} (PHP {Number(spec.price).toFixed(2)})
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No work specifications available.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Total Price: PHP{" "}
                      {availableWorkSpecs
                        .filter((spec) => selectedWorkSpecs.includes(spec.id))
                        .reduce((sum, spec) => sum + Number(spec.price), 0)
                        .toFixed(2)}
                    </label>
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}
                  <div className="flex justify-between gap-3">
                    <button
                      onClick={handleUpdateBooking}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
                      disabled={selectedWorkSpecs.length === 0}
                      aria-label="Update booking"
                    >
                      Update
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300"
                      aria-label="Cancel booking"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {bookings.length === 0 ? (
            <motion.div
              className="text-center text-gray-400 bg-gray-800/30 rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-xl text-gray-300 mb-4">No bookings found</p>
              <p className="text-gray-400 mb-6">Start by booking a service to see your appointments here!</p>
              <Link
                href="/services"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 hover:scale-105 transition-all duration-300"
                aria-label="Explore services"
              >
                Explore Services
              </Link>
            </motion.div>
          ) : (
            <div>
              {activeTab === "scheduled" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {scheduledBookings.length === 0 ? (
                    <p className="text-gray-400 text-center text-lg">No upcoming bookings.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {scheduledBookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          className="relative bg-gray-800/70 border border-gray-700 rounded-2xl shadow-lg pt-10 pb-6 px-6 hover:shadow-xl hover:border-purple-500/50 transition-all duration-300"
                          variants={cardAnimation}
                          initial="hidden"
                          animate="visible"
                        >
                          <span className="absolute top-3 right-3 px-3 py-1 bg-purple-600/80 text-white text-xs font-semibold rounded-full z-10">
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                            {booking.service_detail?.images?.length ? (
                              <Image
                                src={booking.service_detail.images[0].image}
                                alt={booking.service_detail.title || "Service"}
                                fill
                                style={{ objectFit: "cover" }}
                                className="rounded-lg hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-gray-700/50 text-gray-400 rounded-lg">
                                No image available
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-4">
                            {booking.service_detail?.title || "Service unavailable"}
                          </h3>
                          <div className="space-y-3 text-gray-300 text-sm">
                            <div className="flex items-center">
                              <CalendarIcon className="h-5 w-5 text-purple-400 mr-2" />
                              <span>
                                <span className="font-semibold text-white">Date:</span> {booking.booking_date}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="h-5 w-5 text-purple-400 mr-2" />
                              <span>
                                <span className="font-semibold text-white">Time:</span> {booking.booking_time}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="h-5 w-5 text-purple-400 mr-2" />
                              <span>
                                <span className="font-semibold text-white">Location:</span>{" "}
                                {booking.service_detail?.location || "Not specified"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-5 w-5 text-purple-400 mr-2" />
                              <span>
                                <span className="font-semibold text-white">Price:</span> PHP {booking.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <ListBulletIcon className="h-5 w-5 text-purple-400 mr-2 mt-1" />
                              <div>
                                <span className="font-semibold text-white">Services:</span>{" "}
                                {booking.work_specifications?.length ? (
                                  <ul className="list-disc pl-4">
                                    {booking.work_specifications.map((spec) => (
                                      <li key={spec.id}>{spec.name}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  "None specified"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 flex space-x-2">
                            {booking.service_detail ? (
                              <Link
                                href={`/service-details?id=${booking.service_detail.id}`}
                                className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 hover:scale-105 transition-all duration-300"
                                aria-label={`View details for ${booking.service_detail.title}`}
                              >
                                View Service
                              </Link>
                            ) : (
                              <div className="flex-1" />
                            )}
                            {booking.is_editable && booking.status === "scheduled" ? (
                              <button
                                onClick={() => handleEditBooking(booking)}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 hover:scale-105 transition-all duration-300"
                                aria-label={`Edit booking for ${booking.service_detail?.title}`}
                              >
                                <PencilIcon className="h-5 w-5 inline mr-2" />
                                Edit
                              </button>
                            ) : (
                              <div className="flex-1" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {completedBookings.length === 0 ? (
                    <p className="text-gray-400 text-center text-lg">No completed bookings.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedBookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          className="relative bg-gray-800/70 border border-gray-700 rounded-2xl shadow-lg pt-10 pb-6 px-6 hover:shadow-xl hover:border-purple-500/50 transition-all duration-300"
                          variants={cardAnimation}
                          initial="hidden"
                          animate="visible"
                        >
                          <span className="absolute top-3 right-3 px-3 py-1 bg-green-600/80 text-white text-xs font-semibold rounded-full z-10">
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                            {booking.service_detail?.images?.length ? (
                              <Image
                                src={booking.service_detail.images[0].image}
                                alt={booking.service_detail.title || "Service"}
                                fill
                                style={{ objectFit: "cover" }}
                                className="rounded-lg hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-gray-700/50 text-gray-400 rounded-lg">
                                No image available
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-4">
                            {booking.service_detail?.title || "Service unavailable"}
                          </h3>
                          <div className="space-y-3 text-gray-300 text-sm">
                            <div className="flex items-center">
                              <CalendarIcon className="h-5 w-5 text-purple-400 mr-2" />
                              <span>
                                <span className="font-semibold text-white">Date:</span> {booking.booking_date}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="h-5 w-5 text-purple-400 mr-2" />
                              <span>
                                <span className="font-semibold text-white">Time:</span> {booking.booking_time}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="h-5 w-5 text-purple-400 mr-2" />
                              <span>
                                <span className="font-semibold text-white">Location:</span>{" "}
                                {booking.service_detail?.location || "Not specified"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-5 w-5 text-purple-400 mr-2" />
                              <span>
                                <span className="font-semibold text-white">Price:</span> PHP {booking.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <ListBulletIcon className="h-5 w-5 text-purple-400 mr-2 mt-1" />
                              <div>
                                <span className="font-semibold text-white">Services:</span>{" "}
                                {booking.work_specifications?.length ? (
                                  <ul className="list-disc pl-4">
                                    {booking.work_specifications.map((spec) => (
                                      <li key={spec.id}>{spec.name}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  "None specified"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 flex space-x-2">
                            {booking.service_detail ? (
                              <Link
                                href={`/service-details?id=${booking.service_detail.id}`}
                                className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 hover:scale-105 transition-all duration-300"
                                aria-label={`View details for ${booking.service_detail.title}`}
                              >
                                View Service
                              </Link>
                            ) : (
                              <div className="flex-1" />
                            )}
                            <div className="flex-1" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
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