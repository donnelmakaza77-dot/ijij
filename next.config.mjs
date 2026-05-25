/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // passkit-generator uses native Node.js fs — keep it server-side only
  experimental: {
    serverComponentsExternalPackages: ['passkit-generator'],
  },
}

export default nextConfig
