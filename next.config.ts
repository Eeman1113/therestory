import type { NextConfig } from "next";
import path from "node:path";

const isProd = process.env.NODE_ENV === "production";
const repoBase = "/therestory";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? repoBase : "",
  assetPrefix: isProd ? repoBase : "",
  env: { NEXT_PUBLIC_BASE_PATH: isProd ? repoBase : "" },
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
