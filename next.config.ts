import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/og-image",
        destination: "/opengraph-image",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
