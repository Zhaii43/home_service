"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import Header from "@/component/header";

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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const modalAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const fetchServiceDetails = useCallback(async () => {
    if (!serviceId) {
      console.error("No serviceId provided in URL");
      return;
    }
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

  const handleBookingSubmit = async () => {
    setBookingError(null); // Clear previous errors

    if (!isLoggedIn) {
      setBookingError("Please log in to make a booking.");
      return;
    }

    if (!serviceId) {
      setBookingError("Invalid service ID.");
      console.error("Booking failed: serviceId is missing");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setBookingError("Please select both date and time.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setBookingError("Authentication token is missing. Please log in again.");
      console.error("Booking failed: No access token found");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/bookings/",
        {
          service: parseInt(serviceId, 10),
          booking_date: selectedDate,
          booking_time: selectedTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Booking created successfully:", response.data);
      setBookingSuccess(true);
      setBookingError(null);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingSuccess(false);
        setSelectedDate("");
        setSelectedTime("");
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        console.error("Booking error details:", {
          status: error.response?.status,
          data: errorData,
          message: error.message,
        });
        if (error.response?.status === 401) {
          setBookingError("Session expired. Please log in again.");
        } else if (errorData?.non_field_errors?.includes(
          "The fields service, booking_date, booking_time must make a unique set."
        )) {
          setBookingError(
            `This time slot (${selectedTime} on ${selectedDate}) is already booked for this service. Please choose a different time or date.`
          );
        } else if (errorData?.detail) {
          setBookingError(errorData.detail);
        } else if (errorData?.non_field_errors) {
          setBookingError(errorData.non_field_errors.join(" "));
        } else if (errorData?.service || errorData?.booking_date || errorData?.booking_time) {
          setBookingError("Invalid booking details. Please check your inputs.");
        } else {
          setBookingError("Failed to create booking. Please try again.");
        }
      } else {
        console.error("Unexpected booking error:", error);
        setBookingError("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
    }
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId, fetchServiceDetails]);

  if (!service) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      <Header />
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
              onClick={() => {
                setIsBookingModalOpen(true);
                setBookingError(null); // Reset error when opening modal
              }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-purple-800 hover:scale-105 transform transition-all duration-300"
            >
              Book Now
            </button>
          </div>
        </motion.div>

        {/* Booking Modal */}
        {isBookingModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalAnimation}
          >
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
                Book Your Appointment
              </h2>
              {bookingSuccess ? (
                <p className="text-green-400 text-center">
                  Booking confirmed for {selectedDate} at {selectedTime}!
                </p>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 font-semibold">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 font-semibold">
                      Select Time
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a time</option>
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  {bookingError && (
                    <p className="text-red-400 mb-4">{bookingError}</p>
                  )}
                  <p className="text-gray-400 mb-6 text-sm">
                    Note: Once confirmed, this booking cannot be changed or canceled.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setIsBookingModalOpen(false);
                        setBookingError(null); // Reset error when closing modal
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBookingSubmit}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

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