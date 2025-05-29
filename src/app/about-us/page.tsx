"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import axios from "axios";
import Header from "@/component/header";
import Footer from "@/component/footer";

export default function About() {
  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUserDetails(token);
    }
  }, []);

  const fetchUserDetails = async (token: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming username might be used in Header component
      console.log("Username:", response.data.username); // Temporary logging to avoid unused response
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      <Header />

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          About Us
        </motion.h2>
        <motion.p
          className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          At Home Services, we are dedicated to providing top-notch home improvement and maintenance solutions tailored to your needs. Our skilled professionals ensure your home stays comfortable, functional, and beautiful.
        </motion.p>
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {/* Mission */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg max-w-sm text-center hover:shadow-[0_4px_20px_rgba(128,0,255,0.3)] transition-all duration-300"
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Our Mission</h3>
            <p className="text-gray-300">
              To deliver exceptional home services that enhance your living experience with professionalism, reliability, and care.
            </p>
          </motion.div>
          {/* Vision */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg max-w-sm text-center hover:shadow-[0_4px_20px_rgba(128,0,255,0.3)] transition-all duration-300"
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Our Vision</h3>
            <p className="text-gray-300">
              To be the most trusted and preferred home services provider in the industry.
            </p>
          </motion.div>
          {/* Commitment */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg max-w-sm text-center hover:shadow-[0_4px_20px_rgba(128,0,255,0.3)] transition-all duration-300"
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Our Commitment</h3>
            <p className="text-gray-300">
              Your satisfaction is our priority. We strive to exceed expectations with every service we offer.
            </p>
          </motion.div>
        </div>
        <motion.div
          className="relative max-w-4xl w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <Image
            src="/images/background.jpg"
            alt="Our Team"
            width={800}
            height={500}
            className="rounded-xl shadow-lg border border-gray-700 w-full h-auto object-cover"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent"></div>
        </motion.div>
      </main>

    <Footer />
    </div>
  );
}