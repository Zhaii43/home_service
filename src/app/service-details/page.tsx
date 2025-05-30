"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import Header from "@/component/header";
import Footer from "@/component/footer";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import { useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import QRCode from "qrcode";
import Link from "next/link";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
});

interface ImageType {
  id: number;
  image: string;
}

interface WorkSpecificationType {
  id: number;
  name: string;
  price: number;
}

interface ReplyType {
  id: number;
  user: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface ReviewType {
  id: number;
  user: string;
  rating: number;
  rating_label: string;
  comment: string;
  replies: ReplyType[];
  created_at: string;
  updated_at: string;
}

interface ServiceType {
  id: number;
  category: string;
  title: string;
  description: string;
  images: ImageType[];
  location: string;
  work_specifications: WorkSpecificationType[];
  reviews: ReviewType[];
}

interface LocationMarkerProps {
  setPosition: (position: [number, number]) => void;
  setAddress: (address: string) => void;
}

const MapEvents: React.FC<LocationMarkerProps> = ({ setPosition, setAddress }) => {
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(null);

  const map = useMapEvents({
    click(e: { latlng: { lat: number; lng: number } }) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      setPosition([lat, lng]);
      axios
        .get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then((response) => {
          setAddress(response.data?.display_name || "Unknown location");
        })
        .catch((error: AxiosError) => {
          console.error("Error fetching address:", error);
          setAddress("Failed to fetch address");
        });
    },
  });

  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 0);
    }
  }, [map]);

  return markerPosition ? <Marker position={markerPosition} /> : null;
};

const cardAnimation: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const modalAnimation: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

const itemAnimation: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

const qrScanAnimation: Variants = {
  initial: { y: -100, opacity: 0.5 },
  animate: {
    y: 100,
    opacity: 0.8,
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 1.5,
      ease: "linear",
    },
  },
};

const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Manila",
  });

  for (let hour = 9; hour <= 19; hour++) {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    const formattedTime = formatter.format(date).replace(":", ":");
    options.push(formattedTime);
  }
  return options;
};

const formatTimeTo12Hour = (time: string): string => {
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hour), parseInt(minute));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(date);
};

const convertTo24Hour = (time: string): string => {
  const [timePart, modifier] = time.split(" ");
  const [hours, minutes] = timePart.split(":");
  let hourNum = parseInt(hours);

  if (modifier === "PM" && hourNum !== 12) {
    hourNum += 12;
  } else if (modifier === "AM" && hourNum === 12) {
    hourNum = 0;
  }

  return `${hourNum.toString().padStart(2, "0")}:${minutes}`;
};

const ServiceDetailsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id");

  const [service, setService] = useState<ServiceType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedWorkSpecs, setSelectedWorkSpecs] = useState<number[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showMap, setShowMap] = useState<boolean>(false);
  const [position, setPosition] = useState<[number, number]>([10.3157, 123.8854]);
  const [address, setAddress] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMounted, setRatingVisible] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [ratingLabel, setRatingLabel] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [replyComment, setReplyComment] = useState<{ [key: number]: string }>({});
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState<number | null>(null);
  const [isDeletingReply, setIsDeletingReply] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("N/A");

  const RATING_LABEL_OPTIONS = [
    { value: "Poor", label: "Poor" },
    { value: "Needs Improvement", label: "Needs Improvement" },
    { value: "Average", label: "Average" },
    { value: "Good Job", label: "Good Job" },
    { value: "Excellent Job", label: "Excellent Job" },
  ];

  useEffect(() => {
    const fetchUserEmail = async () => {
      const storedEmail = localStorage.getItem("email");
      if (storedEmail) {
        setUserEmail(storedEmail);
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        setUserEmail("N/A");
        return;
      }

      try {
        const response = await axios.get("https://backend-r9v8.onrender.com/api/users/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const email = response.data.email || "N/A";
        setUserEmail(email);
        localStorage.setItem("email", email);
      } catch {
        setUserEmail("N/A");
      }
    };

    fetchUserEmail();
  }, [isLoggedIn]);

  useEffect(() => {
    setRatingVisible(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && isMounted) {
      import("leaflet")
        .then((L) => {
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          });
        })
        .catch((error) => {
          console.error("Failed to load Leaflet:", error);
        });
    }
  }, [isMounted]);

  const fetchServiceDetails = useCallback(async () => {
    if (!serviceId) {
      setBookingError("No service ID provided");
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};
      const response = await axios.get<ServiceType>(
        `https://backend-r9v8.onrender.com/api/services/${serviceId}/`,
        config
      );
      setService({
        ...response.data,
        work_specifications: response.data.work_specifications?.map((spec: WorkSpecificationType) => ({
          ...spec,
          price: parseFloat(spec.price?.toString() || "0"),
        })) || [],
        reviews: response.data.reviews || [],
      });
    } catch {
      setBookingError("Failed to fetch service details");
    }
  }, [serviceId]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
    }
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId, fetchServiceDetails]);

  const totalPrice: number = selectedWorkSpecs.reduce((sum, specId) => {
    const spec = service?.work_specifications?.find((s) => s.id === specId);
    return sum + (spec ? spec.price : 0);
  }, 0);

  useEffect(() => {
    if (bookingSuccess && service && totalPrice > 0) {
      const qrData = JSON.stringify({
        bookingId: serviceId || "N/A",
        service: service.title || "Unknown",
        date: selectedDate || "N/A",
        time: selectedTime || "N/A",
        price: totalPrice.toFixed(2),
        address: address || "N/A",
        email: userEmail,
      });
      QRCode.toDataURL(
        qrData,
        { width: 200, margin: 1 },
        (error, url) => {
          if (error) {
            setQrCodeUrl("https://qrcode-project.s3.amazonaws.com/qr-code.png");
          } else if (url) {
            setQrCodeUrl(url);
          }
        }
      );
      setIsPaymentModalOpen(true);
    }
  }, [bookingSuccess, service, totalPrice, serviceId, selectedDate, selectedTime, address, userEmail]);

  const handleWorkSpecToggle = (specId: number): void => {
    setSelectedWorkSpecs((prev) =>
      prev.includes(specId)
        ? prev.filter((id) => id !== specId)
        : [...prev, specId]
    );
  };

  const handleNextToMap = (): void => {
    if (!selectedDate || !selectedTime) {
      setBookingError("Please select a date and time.");
      return;
    }
    if (selectedWorkSpecs.length === 0) {
      setBookingError("Please select at least one work specification.");
      return;
    }
    setBookingError(null);
    setShowMap(true);
  };

  const handleSearchAddress = async (): Promise<void> => {
    if (!searchQuery) {
      setBookingError("Please enter an address to search.");
      return;
    }
    try {
      const response = await axios.get<{ lat: string; lon: string; display_name: string }[]>(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      if (response.data && response.data.length > 0) {
        const { lat, lon, display_name } = response.data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setAddress(display_name);
      } else {
        setBookingError("No results found for the address.");
      }
    } catch {
      setBookingError("Failed to search address.");
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Booking Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .receipt { max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px; }
              .receipt h2 { text-align: center; color: #6b46c1; }
              .receipt p { margin: 10px 0; }
              .receipt .label { font-weight: bold; }
              .qr-code { text-align: center; margin: 20px 0; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="receipt">
              <h2>Booking Receipt</h2>
              <p><span class="label">Service:</span> ${service?.title || "N/A"}</p>
              <p><span class="label">Date:</span> ${selectedDate || "N/A"}</p>
              <p><span class="label">Time:</span> ${formatTimeTo12Hour(selectedTime) || "N/A"}</p>
              <p><span class="label">Services Booked:</span> ${
                selectedWorkSpecs
                  .map((id) => service?.work_specifications?.find((spec) => spec.id === id)?.name)
                  .filter(Boolean)
                  .join(", ") || "None"
              }</p>
              <p><span class="label">Address:</span> ${address || "N/A"}</p>
              <p><span class="label">Email:</span> ${userEmail}</p>
              <p><span class="label">Total Price:</span> PHP ${totalPrice.toFixed(2)}</p>
              <div class="qr-code">
                <img src="${qrCodeUrl || "https://qrcode-project.s3.amazonaws.com/qr-code.png"}" alt="QR Code" />
              </div>
              <p style="text-align: center;">
                <button onclick="window.print()" class="no-print">Print Receipt</button>
              </p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleMockPayment = () => {
    setPaymentConfirmed(true);
    setTimeout(() => {
      setIsPaymentModalOpen(false);
      setIsBookingModalOpen(false);
      setBookingSuccess(false);
      setSelectedDate("");
      setSelectedTime("");
      setSelectedWorkSpecs([]);
      setShowMap(false);
      setAddress("");
      setSearchQuery("");
      setPosition([10.3157, 123.8854]);
      setQrCodeUrl("");
      setPaymentConfirmed(false);
    }, 2000);
  };

  const handleRetryQRCode = () => {
    const qrData = JSON.stringify({
      bookingId: serviceId || "N/A",
      service: service?.title || "N/A",
      date: selectedDate || "N/A",
      time: selectedTime || "N/A",
      price: totalPrice.toFixed(2),
      address: address || "N/A",
      email: userEmail,
    });
    QRCode.toDataURL(
      qrData,
      { width: 200, margin: 1 },
      (error, url) => {
        if (error) {
          setQrCodeUrl("https://qrcode-project.s3.amazonaws.com/qr-code.png");
        } else if (url) {
          setQrCodeUrl(url);
        }
      }
    );
  };

  const handleBookingSubmit = async (): Promise<void> => {
    setBookingError(null);

    if (!isLoggedIn) {
      setBookingError("Please log in to make a booking.");
      return;
    }

    if (!serviceId || isNaN(parseInt(serviceId))) {
      setBookingError("Invalid service ID.");
      console.error("Booking failed: serviceId is missing or invalid");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setBookingError("Please select a date and time.");
      return;
    }

    if (selectedWorkSpecs.length === 0) {
      setBookingError("Please select at least one work specification.");
      return;
    }

    if (!address) {
      setBookingError("Please select a location on the map or search for an address.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setBookingError("Authentication token is missing. Please log in again.");
      console.error("Booking failed: No access token found");
      return;
    }

    // Ensure time is in 24-hour format (HH:MM)
    const timeIn24Hour = selectedTime.includes("AM") || selectedTime.includes("PM")
      ? convertTo24Hour(selectedTime)
      : selectedTime;

    const payload = {
      service: parseInt(serviceId, 10),
      booking_date: selectedDate,
      booking_time: timeIn24Hour,
      work_specifications: selectedWorkSpecs,
      price: totalPrice,
      address,
      latitude: position[0],
      longitude: position[1],
    };

    console.log("Booking payload:", payload); // Debug log

    if (!payload.service || payload.service <= 0) {
      setBookingError("Invalid service ID in payload.");
      console.error("Booking failed: Invalid service in payload");
      return;
    }
    if (!payload.booking_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setBookingError("Invalid date format. Use YYYY-MM-DD.");
      console.error("Booking failed: Invalid booking_date format");
      return;
    }
    if (!payload.booking_time.match(/^\d{2}:\d{2}$/)) {
      setBookingError("Invalid time format. Use HH:MM.");
      console.error("Booking failed: Invalid booking_time format");
      return;
    }
    if (payload.work_specifications.some((id: number) => id <= 0)) {
      setBookingError("Invalid work specification IDs.");
      console.error("Booking failed: Invalid work_specifications");
      return;
    }
    if (payload.price < 0) {
      setBookingError("Invalid total price.");
      console.error("Booking failed: Invalid price");
      return;
    }

    try {
      const response = await axios.post(
        "https://backend-r9v8.onrender.com/api/bookings/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Booking created successfully:", response.data);
      setBookingSuccess(true);
      setBookingError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData: unknown = error.response?.data;
        console.error("Booking error details:", {
          status: error.response?.status,
          data: errorData,
          message: error.message,
          headers: error.response?.headers,
        });

        if (!error.response) {
          setBookingError("Network error: Could not reach the server. Please check your connection.");
        } else if (error.response.status === 400) {
          const hasNonFieldErrors =
            errorData &&
            typeof errorData === "object" &&
            "non_field_errors" in errorData &&
            Array.isArray((errorData as { non_field_errors?: string[] }).non_field_errors);

          if (hasNonFieldErrors) {
            setBookingError(
              (errorData as { non_field_errors?: string[] }).non_field_errors?.join(" ") ||
              "Invalid booking details. Please check your input."
            );
          } else {
            setBookingError(
              (errorData &&
                typeof errorData === "object" &&
                "detail" in errorData
                ? (errorData as { detail?: string }).detail
                : undefined) ||
              (errorData &&
                typeof errorData === "object" &&
                "non_field_errors" in errorData
                ? (errorData as { non_field_errors?: string[] }).non_field_errors?.join(" ")
                : undefined) ||
              (errorData &&
                typeof errorData === "object" &&
                "work_specifications" in errorData
                ? (errorData as { work_specifications?: string[] }).work_specifications?.join(" ")
                : undefined) ||
              (errorData &&
                typeof errorData === "object" &&
                "address" in errorData
                ? (errorData as { address?: string[] }).address?.join(" ")
                : undefined) ||
              "Invalid booking details. Please check your input."
            );
          }
        } else if (error.response.status === 401) {
          setBookingError("Session expired. Please log in again.");
        } else if (error.response.status === 403) {
          setBookingError("You are not authorized to make this booking.");
        } else if (error.response.status === 404) {
          setBookingError("Service not found.");
        } else if (error.response.status === 500) {
          setBookingError(
            "A server error occurred. Please try again later or contact support if the issue persists."
          );
        } else {
          setBookingError(
            `Unexpected error (Status ${error.response.status}): ${
              (errorData && typeof errorData === "object" && "detail" in errorData
                ? (errorData as { detail?: string }).detail
                : error.message) || "Please try again later."
            }`
          );
        }
      } else {
        console.error("Unexpected error:", error);
        setBookingError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setReviewError("Please log in to submit a review.");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setReviewError("Please select a rating between 1 and 5.");
      return;
    }
    if (!ratingLabel) {
      setReviewError("Please select a descriptive rating label.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setReviewError("Authentication token missing. Please log in again.");
      return;
    }

    const payload = {
      service: parseInt(serviceId!, 10),
      rating,
      rating_label: ratingLabel,
      comment,
    };

    try {
      if (editingReviewId) {
        await axios.patch(`https://backend-r9v8.onrender.com/api/reviews/${editingReviewId}/`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        await axios.post(`https://backend-r9v8.onrender.com/api/services/${serviceId}/reviews/`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
      setRating(0);
      setRatingLabel("");
      setComment("");
      setEditingReviewId(null);
      setReviewError(null);
      fetchServiceDetails();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        setReviewError(
          errorData?.detail ||
          errorData?.non_field_errors?.join(" ") ||
          errorData?.rating_label?.join(" ") ||
          "Failed to submit review."
        );
      } else {
        setReviewError("An unexpected error occurred.");
      }
    }
  };

  const handleReviewDelete = async (reviewId: number) => {
    if (!isLoggedIn) {
      setReviewError("Please log in to delete a review.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setReviewError("Invalid token. Please log in again.");
      return;
    }

    if (!confirm("Confirm delete review?")) {
      return;
    }

    setIsDeletingReview(reviewId);
    try {
      await axios.delete(`https://backend-r9v8.onrender.com/api/reviews/${reviewId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviewError(null);
      fetchServiceDetails();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        const status = error.response?.status;
        if (
          status === 403 ||
          status === 404 ||
          errorData?.detail === "No Review matches the given query."
        ) {
          setReviewError("You can't delete the comment. This is not your account");
        } else {
          setReviewError(errorData?.detail || "Failed to delete review.");
        }
      } else {
        setReviewError("An unexpected error occurred.");
      }
    } finally {
      setIsDeletingReview(null);
    }
  };

  const handleReviewEdit = (review: ReviewType) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setRatingLabel(review.rating_label);
    setComment(review.comment);
    setReviewError(null);
  };

  const handleReplySubmit = async (e: React.FormEvent, reviewId: number) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setReplyError("Please log in to submit a reply.");
      return;
    }
    if (!replyComment[reviewId]?.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setReplyError("Authentication token.");
      return;
    }

    const payload = {
      review: reviewId,
      comment: replyComment[reviewId],
    };

    try {
      if (editingReplyId) {
        await axios.patch(`https://backend-r9v8.onrender.com/api/replies/${editingReplyId}/`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        await axios.post(`https://backend-r9v8.onrender.com/api/reviews/${reviewId}/replies/`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
      setReplyComment((prev) => ({ ...prev, [reviewId]: "" }));
      setEditingReplyId(null);
      setReplyError(null);
      fetchServiceDetails();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        setReplyError(
          errorData?.detail ||
          errorData?.non_field_errors?.join(" ") ||
          "Failed to submit reply."
        );
      } else {
        setReplyError("An unexpected error occurred.");
      }
    }
  };

  const handleReplyEdit = (reply: ReplyType, reviewId: number) => {
    setEditingReplyId(reply.id);
    setReplyComment((prev) => ({ ...prev, [reviewId]: reply.comment }));
    setReplyError(null);
  };

  const handleReplyDelete = async (replyId: number) => {
    if (!isLoggedIn) {
      setReplyError("Please log in to delete a reply.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setReplyError("Authentication token missing.");
      return;
    }

    if (!confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    setIsDeletingReply(replyId);
    try {
      await axios.delete(`https://backend-r9v8.onrender.com/api/replies/${replyId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReplyError(null);
      fetchServiceDetails();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        setReplyError(
          errorData?.detail ||
          errorData?.non_field_errors?.join(" ") ||
          "Failed to delete reply."
        );
      } else {
        setReplyError("An unexpected error occurred.");
      }
    } finally {
      setIsDeletingReply(null);
    }
  };

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        {bookingError || "Loading..."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-800/80 rounded-2xl shadow-xl overflow-hidden border border-gray-700"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
        >
          <div className="relative h-[400px] lg:h-auto">
            {service.images?.length > 0 ? (
              <Image
                src={service.images[0].image}
                alt={service.title}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none bg-gray-700"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-700 text-gray-400">
                No image available
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-transparent rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none" />
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                {service.title}
              </h1>
              <p className="text-gray-300 mb-4 text-base leading-relaxed">{service.description}</p>
              <p className="text-gray-300 mb-4">
                <span className="font-semibold text-white">Location:</span>{" "}
                <span className="text-purple-400">{service.location}</span>
              </p>
              {!isLoggedIn && (
                <p className="text-yellow-400 text-sm mt-2">
                  <span className="font-semibold">Note:</span> Please log in to book this service.
                </p>
              )}
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  setIsLoginPromptOpen(true);
                  return;
                }
                setIsBookingModalOpen(true);
                setBookingError(null);
              }}
              className="mt-6 w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              Book Now
            </button>
          </div>
        </motion.div>

        {isLoginPromptOpen && isMounted && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
            initial="hidden"
            animate="visible"
            variants={modalAnimation}
          >
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Login Required</h2>
              <p className="text-gray-300 mb-6 text-base">
                You need to be logged in to make a reservation.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsLoginPromptOpen(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <Link href="/login">
                  <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors">
                    Log In
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {isBookingModalOpen && isMounted && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
            initial="hidden"
            animate="visible"
            variants={modalAnimation}
          >
            <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full shadow-2xl border border-indigo-500/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                  Book Appointment
                </h2>
                <button
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    setBookingError(null);
                    setShowMap(false);
                  }}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {bookingSuccess ? (
                <motion.div
                  className="text-center"
                  initial="hidden"
                  animate="visible"
                  variants={itemAnimation}
                >
                  {isPaymentModalOpen && (
                    <motion.div
                      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
                      initial="hidden"
                      animate="visible"
                      variants={modalAnimation}
                    >
                      <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full shadow-2xl border border-indigo-500/30">
                        {!paymentConfirmed ? (
                          <>
                            <h2 className="text-xl font-semibold text-white mb-4">Scan to Pay</h2>
                            <p className="text-gray-300 mb-4 text-sm">
                              Scan the QR code with your mobile device to complete payment.
                            </p>
                            <div className="relative flex justify-center mb-6">
                              {qrCodeUrl ? (
                                <div className="relative w-48 h-48">
                                  <Image
                                    src={qrCodeUrl}
                                    alt="QR Code"
                                    fill
                                    style={{ objectFit: "contain" }}
                                    className="border-2 border-indigo-200 rounded-lg"
                                    sizes="192px"
                                    priority={false}
                                  />
                                  <motion.div
                                    className="absolute top-0 left-0 right-0 h-1 bg-indigo-400/80"
                                    variants={qrScanAnimation}
                                    initial="initial"
                                    animate="animate"
                                  />
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-red-500 text-sm mb-3">Failed to generate QR code.</p>
                                  <button
                                    onClick={handleRetryQRCode}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-500 text-sm"
                                  >
                                    Retry QR Code
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-300 mb-6 text-base font-semibold">
                              Total: PHP {totalPrice.toFixed(2)}
                            </p>
                            <button
                              onClick={() => setTimeout(() => handleMockPayment(), 500)}
                              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm"
                            >
                              Simulate QR Scan
                            </button>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <p className="text-green-400 mb-6 text-base font-semibold">
                              Payment Confirmed!
                            </p>
                            <button
                              onClick={handlePrintReceipt}
                              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                            >
                              Print Receipt
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : showMap ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-semibold">Select Location</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        placeholder="Enter address"
                        className="flex-1 px-4 py-2 bg-gray-800 rounded-lg border border-gray-600 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400 text-sm"
                        title="Address search"
                      />
                      <button
                        onClick={handleSearchAddress}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Address: {address || "Click map to select a location"}
                  </p>
                  <div className="h-64 w-full rounded-lg overflow-hidden border-2 border-indigo-200/30">
                    {isMounted && (
                      <MapContainer
                        center={position as LatLngExpression}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <MapEvents setPosition={setPosition} setAddress={setAddress} />
                      </MapContainer>
                    )}
                  </div>
                  {bookingError && (
                    <motion.p
                      className="text-red-500 text-sm font-semibold bg-red-900/20 p-2 rounded"
                      initial="hidden"
                      animate="visible"
                      variants={itemAnimation}
                    >
                      {bookingError}
                    </motion.p>
                  )}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowMap(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBookingSubmit}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex flex-col h-[70vh]">
                  <div className="flex-1 overflow-y-auto space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-semibold">Choose Services</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-48 overflow-y-auto pr-2 bg-gray-800/30 rounded-lg p-2">
                        {service.work_specifications?.length > 0 ? (
                          service.work_specifications.map((spec: WorkSpecificationType) => (
                            <motion.button
                              key={spec.id}
                              onClick={() => handleWorkSpecToggle(spec.id)}
                              className={`flex justify-between items-center p-3 rounded-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200 text-sm ${
                                selectedWorkSpecs.includes(spec.id) ? "border-indigo-500 bg-indigo-900/20" : ""
                              }`}
                              variants={itemAnimation}
                              initial="hidden"
                              animate="visible"
                              title={`Select ${spec.name} for PHP ${spec.price.toFixed(2)}`}
                            >
                              <span className="text-white">{spec.name}</span>
                              <span className="text-gray-400 flex items-center gap-2">
                                PHP {spec.price.toFixed(2)}
                                {selectedWorkSpecs.includes(spec.id) && (
                                  <CheckCircleIcon className="h-5 w-5 text-indigo-400" />
                                )}
                              </span>
                            </motion.button>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm col-span-2">No services available</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-indigo-500/30">
                      <h3 className="text-white font-semibold mb-3 text-base">Booking Summary</h3>
                      {selectedWorkSpecs.length > 0 ? (
                        <div className="space-y-3">
                          {selectedWorkSpecs.map((id: number) => {
                            const spec = service.work_specifications?.find(
                              (s: WorkSpecificationType) => s.id === id
                            );
                            return (
                              spec && (
                                <motion.div
                                  key={id}
                                  className="flex justify-between text-gray-300 text-sm"
                                  variants={itemAnimation}
                                  initial="hidden"
                                  animate="visible"
                                >
                                  <span>{spec.name}</span>
                                  <span>PHP {spec.price.toFixed(2)}</span>
                                </motion.div>
                              )
                            );
                          })}
                          <div className="border-t border-gray-600 pt-3 mt-3">
                            <div className="flex justify-between text-white font-semibold text-base">
                              <span>Total</span>
                              <span>PHP {totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Select services to see summary</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2 text-sm font-semibold">Date</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSelectedDate(e.target.value)
                          }
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-600 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400 text-sm"
                          required
                          title="Select appointment date"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 text-sm font-semibold">Time (PHT)</label>
                        <select
                          value={selectedTime}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setSelectedTime(e.target.value)
                          }
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-600 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400 text-sm"
                          required
                          title="Select appointment time"
                        >
                          <option value="">Select time</option>
                          {generateTimeOptions().map((time: string) => (
                            <option key={time} value={time}>
                              {formatTimeTo12Hour(time)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {bookingError && (
                      <motion.p
                        className="text-red-500 text-sm font-semibold bg-red-900/20 p-2 rounded"
                        initial="hidden"
                        animate="visible"
                        variants={itemAnimation}
                      >
                        {bookingError}
                      </motion.p>
                    )}
                    <p className="text-gray-400 text-sm">
                      Note: Bookings are non-refundable and cannot be changed once confirmed.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => {
                        setIsBookingModalOpen(false);
                        setBookingError(null);
                        setShowMap(false);
                      }}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNextToMap}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
            Gallery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.images?.map((image: ImageType) => (
              <motion.div
                key={image.id}
                className="relative h-64 rounded-lg shadow-lg overflow-hidden"
                variants={cardAnimation}
                initial="hidden"
                animate="visible"
              >
                <Image
                  src={image.image}
                  alt={service.title}
                  fill
                  style={{ objectFit: "contain" }}
                  className="hover:scale-105 transition-transform duration-300 bg-gray-700"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-12 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
            Customer Reviews
          </h2>
          {isLoggedIn && (
            <form onSubmit={handleReviewSubmit} className="mb-8 bg-gray-800/50 p-6 rounded-xl shadow-lg">
              <h3 className="text-white font-semibold mb-4 text-base">
                {editingReviewId ? "Edit Your Review" : "Write a Review"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-semibold">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl ${rating >= star ? "text-yellow-400" : "text-gray-400"} hover:text-yellow-300 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-semibold">Rating Label</label>
                  <div className="flex flex-wrap gap-2">
                    {RATING_LABEL_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRatingLabel(option.value)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          ratingLabel === option.value
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        } transition-colors`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 text-sm font-semibold">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comment..."
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-600 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400 text-sm"
                />
              </div>
              {reviewError && <p className="text-red-500 text-sm mb-3">{reviewError}</p>}
              <div className="flex justify-end gap-3">
                {editingReviewId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReviewId(null);
                      setRating(0);
                      setRatingLabel("");
                      setComment("");
                      setReviewError(null);
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
                >
                  {editingReviewId ? "Update Review" : "Submit Review"}
                </button>
              </div>
            </form>
          )}
          <div className="space-y-6">
            {service.reviews?.length > 0 ? (
              service.reviews.map((review: ReviewType) => (
                <motion.div
                  key={review.id}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-600 shadow-lg"
                  variants={cardAnimation}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <div>
                      <p className="text-white font-semibold text-base">{review.user}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} className={i <= review.rating ? "text-yellow-400" : "text-gray-400"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-indigo-400 text-sm">{review.rating_label}</span>
                      </div>
                    </div>
                    {isLoggedIn && (
                      <div className="flex gap-3 mt-2 sm:mt-0">
                        <button
                          onClick={() => handleReviewEdit(review)}
                          className="text-indigo-400 hover:text-indigo-300 text-sm"
                          disabled={isDeletingReview === review.id}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleReviewDelete(review.id)}
                          className="text-red-500 hover:text-red-400 text-sm"
                          disabled={isDeletingReview === review.id}
                        >
                          {isDeletingReview === review.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{review.comment}</p>
                  <p className="text-gray-500 text-xs">
                    Posted on {new Date(review.created_at).toLocaleDateString()}
                  </p>
                  {review.replies?.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {review.replies.map((reply: ReplyType) => (
                        <motion.div
                          key={reply.id}
                          className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-indigo-500"
                          variants={itemAnimation}
                          initial="hidden"
                          animate="visible"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-white font-semibold text-sm">{reply.user}</p>
                            {isLoggedIn && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleReplyEdit(reply, review.id)}
                                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                                  disabled={isDeletingReply === reply.id}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleReplyDelete(reply.id)}
                                  className="text-red-500 hover:text-red-400 text-sm"
                                  disabled={isDeletingReply === reply.id}
                                >
                                  {isDeletingReply === reply.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">{reply.comment}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Replied on {new Date(reply.created_at).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {isLoggedIn && (
                    <form
                      onSubmit={(e) => handleReplySubmit(e, review.id)}
                      className="mt-4"
                    >
                      <textarea
                        value={replyComment[review.id] || ""}
                        onChange={(e) =>
                          setReplyComment((prev) => ({
                            ...prev,
                            [review.id]: e.target.value,
                          }))
                        }
                        placeholder="Write a reply..."
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400 text-sm"
                      />
                      {replyError && <p className="text-red-500 text-sm mt-2">{replyError}</p>}
                      <div className="flex justify-end gap-3 mt-3">
                        {editingReplyId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReplyId(null);
                              setReplyComment((prev) => ({ ...prev, [review.id]: "" }));
                              setReplyError(null);
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm"
                        >
                          {editingReplyId ? "Update Reply" : "Post Reply"}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-gray-400 text-center text-base">No reviews yet.</p>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const ServiceDetailsPage = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>}>
    <ServiceDetailsContent />
  </Suspense>
);

export default ServiceDetailsPage;