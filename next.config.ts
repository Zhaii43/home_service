/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.pinimg.com'], // For external image hosts like Pinterest
    remotePatterns: [
      {
        protocol: 'https', // Use HTTPS for your backend
        hostname: 'backend-r9v8.onrender.com', // Corrected hostname without protocol
        port: '', // Leave empty for default HTTPS port (443)
        pathname: '/media/**', // Path for media files
      },
    ],
  },
};

export default nextConfig;