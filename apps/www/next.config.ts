import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fully static site (no server features) — export to plain HTML/JS for
  // Cloudflare Pages. Switch to the OpenNext adapter if server features land.
  output: "export",
};

export default nextConfig;
