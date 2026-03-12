/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable source maps in production to speed up build
  productionBrowserSourceMaps: false,
  // Disable strict mode to avoid double-renders in dev that might confuse
  reactStrictMode: false,
};

export default nextConfig;
