import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  // server: {
  //   host: "127.0.0.1",
  //   port: 5173,
  //   strictPort: true,
  //   hmr: {
  //     host: "127.0.0.1",
  //     protocol: "ws",
  //   },
  // },
  // preview: {
  //   host: "127.0.0.1",
  //   port: 4173,
  //   strictPort: true,
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.{jpg,png,jpeg}"],
});
