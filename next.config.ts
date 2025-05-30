/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backend-r9v8.onrender.com",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;