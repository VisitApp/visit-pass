import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Static export → plain HTML/CSS/JS in ./out for S3 hosting
  output: "export",
  // S3 has no Next.js image optimizer; serve images as-is
  images: { unoptimized: true },
  // Emit /route/index.html so S3 website routing resolves cleanly
  trailingSlash: true,

  // Dev-only proxy to dodge CORS while testing locally (no server in prod export).
  // Prod hits the API directly → backend must send Access-Control-Allow-Origin.
  ...(isDev && {
    async rewrites() {
      return [
        {
          source: "/proxy/:path*",
          destination:
            "https://enrolment-portal.getvisitapp.net/optin/opt-in/visitapp/:path*",
        },
      ];
    },
  }),

  // LocatorJS: Option+click any element in the browser to jump to its source.
  // Dev-only — never inject into the production export shipped to S3.
  ...(isDev && {
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
  }),
};

export default nextConfig;
