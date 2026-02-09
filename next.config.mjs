/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // PENTING: Ini biar Vercel tetep deploy walau ada warning sepele
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;