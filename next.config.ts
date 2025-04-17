import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com", "example.com"],
    unoptimized: true, // 💥 QUAN TRỌNG nếu bạn dùng `next/image` và export static
  },
  output: "export", // 💥 Đây là cách mới thay cho lệnh `next export`
  trailingSlash: true, // 👍 Tốt cho static export trên Azure
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Nếu bạn chưa muốn sửa tất cả lỗi ESLint
  },
};

export default nextConfig;
