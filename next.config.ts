import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const githubPagesExport = process.env.GITHUB_PAGES_EXPORT === "1";

const nextConfig: NextConfig = {
  output: githubPagesExport ? "export" : undefined,
  trailingSlash: githubPagesExport,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
