/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'three', '@react-three/fiber', '@react-three/drei'],
  },
};

export default nextConfig;
