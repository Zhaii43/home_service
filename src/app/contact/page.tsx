"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import Header from "@/component/header";
import Footer from "@/component/footer";

const formAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setStatus(null);

  const data = new FormData();
  data.append("name", formData.name);
  data.append("email", formData.email);
  data.append("subject", formData.subject);
  data.append("message", formData.message);
  if (image) {
    data.append("image", image);
  }

  console.log("Submitting form data:", { ...formData, image: image?.name });

  try {
    const response = await axios.post("https://backend-r9v8.onrender.com/api/contact/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setStatus(response.data.message);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setImage(null);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      setStatus(error.response.data.error || "An error occurred. Please try again.");
    } else if (error instanceof Error) {
      console.error("Unexpected error:", error.message);
      setStatus("An unexpected error occurred. Please try again.");
    } else {
      setStatus("An unknown error occurred.");
    }
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <motion.div
          className="max-w-lg w-full bg-gray-800/95 p-8 rounded-xl shadow-2xl"
          initial="hidden"
          animate="visible"
          variants={formAnimation}
        >
          <h1 className="text-3xl font-bold text-purple-300 mb-6 text-center">
            Contact Us
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="mt-1 w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                placeholder="What's this about?"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="mt-1 w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                placeholder="Your message here..."
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-300">
                Attach Image (Optional)
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              {image && <p className="mt-2 text-sm text-gray-400">{image.name}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
                isSubmitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white`}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
          {status && (
            <p
              className={`mt-4 text-center ${
                status.includes("successfully") ? "text-green-400" : "text-red-400"
              }`}
            >
              {status}
            </p>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}