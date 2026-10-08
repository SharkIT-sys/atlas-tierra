import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replace(/\\/g, "/");
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(path))
            return "react-vendor";
          if (path.includes("/src/data/") && path.endsWith(".json"))
            return "catalog";
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "icons/*.png", "shields/*"],
      manifest: {
        name: "Atlas Tierra — Organización del Ejército",
        short_name: "Atlas Tierra",
        lang: "es",
        description: "Atlas educativo de unidades y dependencias orgánicas",
        theme_color: "#172d2a",
        background_color: "#f5f6f4",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json,woff2}"],
        maximumFileSizeToCacheInBytes: 4000000,
      },
    }),
  ],
});
