/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@conflux-devkit/utility'],
  output: 'standalone',
  trailingSlash: true,
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/modals',
      '@mantine/notifications',
      '@tabler/icons-react',
    ],
  },
  // Fix SSR issues
  reactStrictMode: false,
  swcMinify: true,
};

module.exports = nextConfig;
