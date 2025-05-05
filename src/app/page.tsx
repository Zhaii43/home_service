"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "../component/header";

export default function Home() {
  const fadeInAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.6 } },
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      <Header />
      {/* Main Content */}
      <motion.main
        className="flex flex-col items-center justify-center flex-grow text-center px-4 sm:px-6 lg:px-8 py-16"
        variants={fadeInAnimation}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 tracking-tight">
          Find Home Services Near You
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 mb-2 max-w-2xl">
          Discover top-rated home service and repair professionals in your area.
        </p>

        {/* Categories Section */}
        <section className="mt-10 w-full max-w-5xl">
          <h3 className="text-2xl font-bold text-white mb- text-center">Service Categories</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "Cleaning", icon: "/images/mop.png", category: "cleaning" },
              { name: "Repair", icon: "/images/support.png", category: "repair" },
              { name: "Painting", icon: "/images/paintbrush.png", category: "painting" },
              { name: "Plumbing", icon: "/images/repairing.png", category: "plumbing" },
              { name: "Electric", icon: "/images/electricity.png", category: "electric" },
            ].map((category) => (
              <a
                key={category.category}
                href={`/services?category=${category.category}`}
                className="flex flex-col items-center px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 hover:scale-105 transform transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={32}
                  height={32}
                  className="mb-2"
                />
                <span className="text-gray-200 font-medium">{category.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* About Us Section */}
        <section className="mt-20 w-full max-w-6xl">
          <motion.div
            className="flex flex-col lg:flex-row items-center gap-8"
            variants={fadeInAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Left Side: Image */}
            <div className="lg:w-1/2">
              <Image
                src="/images/247.png"
                alt="Home Services"
                width={600}
                height={400}
                className="rounded-xl object-cover w-full h-[400px]"
              />
            </div>
            {/* Right Side: Description */}
            <div className="lg:w-1/2 p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Why Choose Our Home Services?</h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Connect with trusted professionals for all your home needs, from plumbing and electrical work to cleaning and repairs. Our platform makes it easy to find reliable, top-rated service providers in your area, ensuring quality and convenience every time.
              </p>
              {/* Get Started Button */}
              {!isLoggedIn && (
                <Link 
                  href="/login" 
                  className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-300"
                >
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        </section>
      </motion.main>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-md text-center py-6">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Home Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
}