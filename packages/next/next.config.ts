import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['127.0.0.1', '172.20.112.1'],
  output: 'standalone'
};

export default nextConfig;
