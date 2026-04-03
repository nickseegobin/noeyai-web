const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nicks180.sg-host.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'noeyai.local',
        pathname: '/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;