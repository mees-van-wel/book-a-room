/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  swcMinify: true,
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.wolterskluwer.io',
      },
    ],
  },
};
