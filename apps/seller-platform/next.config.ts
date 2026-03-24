import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  reactCompiler: true,
};

export default nextConfig;
