/** @type {import('next').NextConfig} */
import path from "path";

const __dirname = new URL(".", import.meta.url).pathname;

const nextConfig = {
  experimental: {
    ppr: true,
    serverComponentsExternalPackages: ["isolated-vm", "esbuild"],
  },

  webpack: (config, { dev }) => {
    const rpcLoader = {
      loader: dev ? "./build/loader-dev.mjs" : "./build/loader-prod.mjs",
      options: {},
      test: /\.(js|jsx|ts|tsx)$/,
      include: path.resolve(__dirname, "./rpc"),
    };

    config.module.rules.push(rpcLoader);
    return config;
  },
};

export default nextConfig;
