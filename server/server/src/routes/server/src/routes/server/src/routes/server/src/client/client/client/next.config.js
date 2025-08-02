/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'your-backend-domain.com'], // update this as needed
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
  }
};

module.exports = nextConfig;

| Key               | Description                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `reactStrictMode` | Helps catch potential problems in React during development                                       |
| `swcMinify`       | Uses the SWC compiler for faster builds                                                          |
| `images.domains`  | If you load images from external sources (e.g., backend or S3), list domains here                |
| `env`             | Defines public environment variables for use in the frontend (`NEXT_PUBLIC_` prefix is required) |




