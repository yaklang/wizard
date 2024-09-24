// vite.config.ts
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    UnoCSS({
      configFile: "./uno.config.ts",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  server: {
    port: 1118,
    proxy: {
      "^/api": {
        target: "http://community-op-test.k8s.testuoko.com/", // test1
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    host: "0.0.0.0",
    hmr: true,
  },
});
