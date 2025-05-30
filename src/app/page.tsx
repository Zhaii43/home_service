"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Header from "../component/header";
import Footer from "../component/footer";
import { Home as HomeIcon, Layers, Search, Users, Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

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
  rating?: number;
}

interface TestimonialType {
  id: number;
  name: string;
  text: string;
  rating: number;
  avatar: string;
}

export default function Home() {
  const fadeInAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.6 } },
  };

  const bannerAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const [services, setServices] = useState<ServiceType[]>([]);
  const [category, setCategory] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials: TestimonialType[] = [
    {
      id: 1,
      name: "Carl Christian",
      text: "\"The plumbing service was fantastic! Quick, professional, and affordable.\"",
      rating: 5,
      avatar: "/images/carl.jpg",
    },
    {
      id: 2,
      name: "Ralph Villarojo",
      text: "\"I had an amazing experience with the cleaning service. Highly recommend!\"",
      rating: 4,
      avatar: "/images/ralph.jpg",
    },
    {
      id: 3,
      name: "Brian Labago",
      text: "\"The renovation team transformed my home beautifully. Great work!\"",
      rating: 5,
      avatar: "/images/brian.jpg",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
    }

    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get("https://backend-r9v8.onrender.com/api/service-images");
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory);
  };

  const filteredServices = services.filter(
    (service) => category === "all" || service.category === category
  );

const uniqueCategories = [...new Set(services.map((service) => service.category))]
  .filter((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase()))
  .slice(0, 6);

  const featuredServices = services
    .filter((service) => service.rating && service.rating >= 4)
    .slice(0, 3);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      <Header />
      {/* Image with Overlay Text Below Header */}
      <motion.div
        className="w-full relative mb-8 px-4 sm:px-0"
        variants={bannerAnimation}
        initial="hidden"
        animate="visible"
      >
        <Image
          src="/images/homeee.png"
          alt="Home Services Banner"
          width={1200}
          height={400}
          className="w-full h-[200px] sm:h-[400px] object-cover rounded-xl opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center tracking-wide px-4">
            Discover Trusted Home Services
          </h1>
        </div>
      </motion.div>

      {/* Featured Services Section */}
      {featuredServices.length > 0 && (
        <motion.section
          className="px-4 sm:px-6 lg:px-8 py-12"
          variants={fadeInAnimation}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-white tracking-tight">
            Featured Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <motion.div
                key={service.id}
                className="bg-gradient-to-br from-gray-800 to-gray-85 border border-gray-700/30 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-500 ease-out relative"
                initial="hidden"
                animate="visible"
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.4, ease: "easeOut" },
                }}
              >
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-purple-600/80 text-white px-2 py-1 rounded-full text-sm font-semibold">
                  <Star className="w-4 h-4" />
                  {service.rating || 4.5}
                </div>
                <div className="relative w-full h-48 sm:h-56 flex-shrink-0 group z-10">
                  {service.images.length > 0 ? (
                    <>
                      <Image
                        src={service.images[0].image}
                        alt={service.title}
                        fill
                        style={{ objectFit: "cover" }}
                        className="object-cover transition-transform duration-600 ease-out rounded-t-2xl group-hover:scale-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-all duration-600 ease-out group-hover:from-purple-900/60 group-hover:to-transparent group-hover:shadow-[0_10px_20px_rgba(128,0,255,0.3)] rounded-t-2xl" />
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 text-sm text-gray-300 font-medium">
                      No Image Available
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-2 truncate">{service.title}</h4>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2 leading-relaxed">{service.description}</p>
                  <p className="text-sm text-gray-200 font-medium mb-4 truncate">
                    <span className="text-purple-400">Location:</span> {service.location}
                  </p>
                  <Link
                    href={`/service-details?id=${service.id}`}
                    className="mt-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 hover:scale-105 transform transition-all duration-300 text-center"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      <motion.main
        className="flex flex-col lg:flex-row flex-grow px-4 sm:px-6 lg:px-8 py-12 bg-transparent"
        variants={fadeInAnimation}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <aside className="w-full lg:w-72 mb-6 lg:mb-0 lg:pr-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700/30 lg:sticky lg:top-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(128,0,255,0.2)]">
          <div className="flex items-center gap-3 mb-6">
            <HomeIcon className="w-6 h-6 text-purple-400 animate-pulse" />
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">Explore Services</h3>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                category === "all"
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg"
                  : "text-gray-200 hover:bg-gray-700/70 hover:text-white"
              }`}
            >
              <Layers className="w-5 h-5" />
              All Categories
            </button>

            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  category === cat
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg"
                    : "text-gray-200 hover:bg-gray-700/70 hover:text-white"
                }`}
              >
                <Users className="w-5 h-5" />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 lg:pl-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-white tracking-tight">
            Discover Top Home Services
          </h2>
          <p className="text-sm sm:text-base text-gray-200 mb-4 max-w-2xl leading-relaxed">
            Connect with trusted professionals for all your home needs, from repairs to renovations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              // Group services by category and limit to 5 per category
              const groupedServices = filteredServices.reduce((acc, service) => {
                if (!acc[service.category]) {
                  acc[service.category] = [];
                }
                acc[service.category].push(service);
                return acc;
              }, {} as { [key: string]: ServiceType[] });

              // Limit to 5 services per category
              const limitedServices = Object.values(groupedServices)
                .flatMap((services) => services.slice(0, 5))
                .sort((a, b) => a.category.localeCompare(b.category));

              return limitedServices.length > 0 ? (
                limitedServices.map((service) => (
                  <motion.div
                    key={service.id}
                    className="bg-gradient-to-br from-gray-800 to-gray-85 border border-gray-700/30 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-500 ease-out"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{
                      scale: 1.05,
                      y: -10,
                      transition: { duration: 0.4, ease: "easeOut" },
                    }}
                  >
                    <div className="relative w-full h-36 sm:h-48 flex-shrink-0 group z-10">
                      {service.images.length > 0 ? (
                        <>
                          <Image
                            src={service.images[0].image}
                            alt={service.title}
                            fill
                            style={{ objectFit: "cover" }}
                            className="object-cover transition-transform duration-600 ease-out rounded-t-2xl group-hover:scale-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-all duration-600 ease-out group-hover:from-purple-900/60 group-hover:to-transparent group-hover:shadow-[0_10px_20px_rgba(128,0,255,0.3)] rounded-t-2xl" />
                        </>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 text-xs sm:text-sm text-gray-300 font-medium">
                          No Image Available
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                      <h4 className="text-base sm:text-lg font-bold text-white mb-1 truncate">{service.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-300 mb-2 line-clamp-2 leading-relaxed">{service.description}</p>
                      <p className="text-xs sm:text-sm text-gray-200 font-medium mb-3 truncate">
                        <span className="text-purple-400">Location:</span> {service.location}
                      </p>
                      <Link
                        href={`/service-details?id=${service.id}`}
                        className="mt-auto px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 hover:scale-105 transform transition-all duration-300 text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center h-36 text-gray-300 text-sm sm:text-base font-medium bg-gray-800/30 rounded-xl">
                  No services available for this category.
                </div>
              );
            })()}
          </div>
        </section>
      </motion.main>

      {/* Combined Testimonial and Call-to-Action Section */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-12 bg-transparent border-t border-gray-700/30"
        variants={fadeInAnimation}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Testimonial Carousel */}
          <div className="lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-white tracking-tight">
              What Our Customers Say
            </h2>
            <div className="relative max-w-xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  className="bg-gradient-to-br from-gray-800 to-gray-85 border border-gray-700/30 rounded-2xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-shadow duration-300"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex justify-center mb-4">
                    <Image
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-purple-500 shadow-md"
                    />
                  </div>
                  <Quote className="w-6 h-6 text-purple-400 mx-auto mb-4 opacity-70" />
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-base sm:text-lg text-gray-200 mb-4 leading-relaxed font-medium">
                    {testimonials[currentTestimonial].text}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    - {testimonials[currentTestimonial].name}
                  </p>
                </motion.div>
              </AnimatePresence>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-purple-600/90 text-white p-3 rounded-full hover:bg-purple-700 hover:scale-110 transition-all duration-300 hover:animate-pulse"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-purple-600/90 text-white p-3 rounded-full hover:bg-purple-700 hover:scale-110 transition-all duration-300 hover:animate-pulse"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? "bg-purple-500 scale-125" : "bg-gray-600"
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Call-to-Action Banner */}
          <div className="lg:w-1/2 relative bg-transparent text-white text-center p-6 sm:p-8 rounded-2xl flex flex-col justify-center shadow-2xl overflow-hidden">
            <Image
              src="/images/aboutus.jpg"
              alt="CTA Background"
              fill
              style={{ objectFit: "cover" }}
              className="absolute inset-0 opacity-14 mix-blend-overlay"
            />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 tracking-tight">
                Elevate Your Home Today
              </h2>
              <p className="text-base sm:text-lg mb-4 leading-relaxed font-medium">
                Join thousands of satisfied homeowners and book top-rated professionals for seamless, high-quality home services.
              </p>
              <p className="text-sm font-semibold mb-4 flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Trusted by 10,000+ Homeowners
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href={isLoggedIn ? "/services" : "/signup"}
                  className="inline-block px-6 py-2 bg-white text-purple-700 font-semibold rounded-xl shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                >
                  {isLoggedIn ? "Explore Services" : "Sign Up Now"}
                </Link>
                <Link
                  href="/about-us"
                  className="inline-block px-6 py-2 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section
        className="w-full flex justify-center items-center bg-transparent py-8"
        variants={fadeInAnimation}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 max-w-6xl mx-auto px-4"
          variants={fadeInAnimation}
        >
          <div className="w-full lg:w-1/2">
            <Image
              src="/images/247.png"
              alt="Home Services"
              width={500}
              height={400}
              className="rounded-2xl object-cover w-full h-[200px] sm:h-[300px] lg:h-[400px] shadow-lg"
            />
          </div>
          <div className="w-full lg:w-1/2 p-4 sm:p-6 flex flex-col justify-center">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight">
              Why Choose Us?
            </h3>
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed mb-6 max-w-prose">
              Our platform connects you with verified, top-rated professionals for all your home service needs. Enjoy seamless booking, transparent pricing, and exceptional quality with every service.
            </p>
            <ul className="space-y-3 text-gray-200 text-sm sm:text-base">
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400" />
                Verified Professionals
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400" />
                Transparent Pricing
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400" />
                24/7 Customer Support
              </li>
            </ul>
            {!isLoggedIn && (
              <Link
                href="/login"
                className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-300 mt-6 self-start"
              >
                Get Started
              </Link>
            )}
          </div>
        </motion.div>
      </motion.section>
      <Footer />
    </div>
  );
}