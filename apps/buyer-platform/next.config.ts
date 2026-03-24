import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/utils/i18n.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  env: {
    NEXT_PUBLIC_API_HOST_URL:
      process.env.NEXT_PUBLIC_API_HOST_URL ||
      'https://marketplace-api-dev.allkons.com',
    NEXT_PUBLIC_ALLKONS_APP_ID:
      process.env.NEXT_PUBLIC_ALLKONS_APP_ID ||
      '79965560-b70a-4775-8e9c-d4fb66880b73',
  },
  images: {
    unoptimized: true,
    domains: [
      's3-apse1-allkons-dev.s3.ap-southeast-1.amazonaws.com',
      'images.unsplash.com',
      'production-shopdit.s3.ap-southeast-1.amazonaws.com',
    ],
    minimumCacheTTL: 600,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
