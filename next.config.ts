/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any, { isServer }: any) => {
    // Only on the client side
    if (!isServer) {
      // Don't attempt to load these packages on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        "aws-sdk": false,
        "mock-aws-s3": false,
        nock: false,
        "fs.realpath": false,
      };
    }
    return config;
  },
  experimental: {
    // Fix for turbopack issues
    turbo: {
      rules: {
        // Resolve HTML files properly with Turbopack
        "*.html": ["raw-loader"],
      },
    },
  },
  eslint:{
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;