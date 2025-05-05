import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        port: "",
        pathname: "/account123/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "daas-files.s3.eu-west-3.amazonaws.com",
        port: "",
        pathname: "/frontend-files/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "th.bing.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.daisyui.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "deistor4v34pj.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media-hbe1-1.cdn.whatsapp.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "web.whatsapp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.geckoboard.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
