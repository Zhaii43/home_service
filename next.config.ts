import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "https://backend-r9v8.onrender.com",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
