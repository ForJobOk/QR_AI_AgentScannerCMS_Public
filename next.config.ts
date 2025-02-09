import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Next.js を完全な静的サイトとしてエクスポート
  distDir: "build", // 出力ディレクトリを "dist" に変更
  trailingSlash: true, // 末尾にスラッシュを追加
};


export default nextConfig;
