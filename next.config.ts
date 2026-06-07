import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Turbopack root is dev-only; setting it breaks PM2 cluster `next start`.
  ...(process.env.NODE_ENV === "development"
    ? {
        turbopack: {
          root: projectRoot,
        },
      }
    : {}),
};

export default nextConfig;
