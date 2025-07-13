/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
