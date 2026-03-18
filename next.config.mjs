/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  allowedDevOrigins: [
    "localhost:3000",
    "eleven-phones-type.loca.lt",
    "solid-windows-beam.loca.lt",
    "red-hands-slide.loca.lt",
    "beige-turtles-sip.loca.lt",
    "true-plants-lie.loca.lt"
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
