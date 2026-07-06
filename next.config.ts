import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: ["unpdf", "mammoth"],
};

export default nextConfig;
