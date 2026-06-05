import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export → plain HTML/CSS/JS in ./out for S3 hosting
  output: "export",
  // S3 has no Next.js image optimizer; serve images as-is
  images: { unoptimized: true },
  // Emit /route/index.html so S3 website routing resolves cleanly
  trailingSlash: true,

  turbopack: {
    rules: {
      "**/*.{tsx,jsx}": {
        loaders: [
          {
            loader: "@locator/webpack-loader",
            options: { env: "development" },
          },
        ],
      },
    },
  },
};

export default nextConfig;
