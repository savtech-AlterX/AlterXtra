import type { NextConfig } from "next";

// Set only for the GitHub Pages export (see scripts/build-gh-pages.sh) — a
// free static host with no server, so this build drops the API routes
// (they can't run there) and serves from a /AlterXtra/ subpath instead of
// the domain root, since a project page lives at
// <owner>.github.io/<repo>/ rather than its own domain.
const isGhPagesBuild = process.env.GITHUB_PAGES_BUILD === "1";

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
    // Static export can't run Next's server-side image optimizer.
    ...(isGhPagesBuild ? { unoptimized: true } : {}),
  },
  ...(isGhPagesBuild
    ? {
        output: "export",
        basePath: "/AlterXtra",
        assetPrefix: "/AlterXtra/",
      }
    : {}),
};

export default nextConfig;
