/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'strapi.yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
