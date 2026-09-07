import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This site lives nested inside the AlterXtra repo, which has its own
  // package-lock.json one level up — without this, Turbopack guesses that
  // outer lockfile marks the project root and watches/resolves from there.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Serves modern, smaller formats automatically wherever the browser
    // supports them — this is the "compress your images" checklist item;
    // next/image handles resizing and re-encoding per-request on top of it.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
