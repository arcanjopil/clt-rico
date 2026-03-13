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
  // Allow localtunnel
  allowedDevOrigins: [
    "localhost:3000",
    "eleven-phones-type.loca.lt",
    "solid-windows-beam.loca.lt",
    "red-hands-slide.loca.lt",
    "beige-turtles-sip.loca.lt"
  ],
  experimental: {},
  generateEtags: false,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      ],
    },
  ],
};

export default nextConfig;
