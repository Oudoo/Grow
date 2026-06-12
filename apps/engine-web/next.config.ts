import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "path";

// The web app runs with cwd = apps/web/, but the canonical .env lives at the
// monorepo root. Next only auto-loads .env from the app directory, so load the
// root file explicitly — otherwise AUTH_SECRET/DATABASE_URL/AI keys are missing
// at runtime and Auth.js throws "MissingSecret" (server configuration error).
config({ path: resolve(process.cwd(), "../../.env") });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@growengine/db", "@growengine/core"],
  serverExternalPackages: ["postgres", "ioredis", "bullmq", "minio", "nodemailer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
};

export default nextConfig;
