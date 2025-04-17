import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com", "example.com"],
  },
  output: "export", // ✅ chỉ cần nếu dùng Next.js 13+
  reactStrictMode: true,
};

export default nextConfig;
