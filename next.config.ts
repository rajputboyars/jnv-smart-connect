import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// A Content-Security-Policy is set only in production. In dev, Turbopack's
// HMR client needs 'unsafe-eval'/inline scripts and websocket connections
// that a strict CSP would break.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Produces a minimal self-contained server bundle (only the deps actually
  // used) so the production Docker image doesn't need `npm install` at all.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(isProd
            ? [
                { key: "Content-Security-Policy", value: contentSecurityPolicy },
                { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
