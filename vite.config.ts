import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      srcDir: "./src",
      manifest: {
        short_name: "SvelteKit PWA",
        name: "SvelteKit PWA",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#7480ff",
        background_color: "#1d232a",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:33333",
        rewriteWsOrigin: true,
        ws: true,
      },
      "/api": {
        target: "http://localhost:33333",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
