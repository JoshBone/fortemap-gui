const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['fortepan.download'],
  },
  experimental: {
    largePageDataBytes: 128 * 5000,
  },
  output: 'standalone',
  assetPrefix: isProd ? 'https://fmt.nektonik.com/fortemap' : undefined,
}
