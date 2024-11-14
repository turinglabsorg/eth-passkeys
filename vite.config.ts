import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), nodePolyfills()],
  base: "/eth-passkeys/",
  build: {
    outDir: "demo",
  },
});
