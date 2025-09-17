import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { dev }) => {
    // Prevent ENOENT rename errors from webpack's FS cache during dev on some systems
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
