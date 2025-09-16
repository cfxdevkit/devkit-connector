/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: [
    '@conflux-wallet/client',
    '@conflux-wallet/wagmi-connector',
    '@conflux-wallet/types',
    '@conflux-wallet/core'
  ],
  env: {
    NEXT_PUBLIC_CONFLUX_ESPACE_RPC: process.env.NEXT_PUBLIC_CONFLUX_ESPACE_RPC,
    NEXT_PUBLIC_CONFLUX_CORE_RPC: process.env.NEXT_PUBLIC_CONFLUX_CORE_RPC,
    NEXT_PUBLIC_WALLET_SERVER_URL: process.env.NEXT_PUBLIC_WALLET_SERVER_URL,
  },
}

module.exports = nextConfig
