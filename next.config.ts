import { NextConfig } from "next";

const nextConfig: NextConfig = {
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