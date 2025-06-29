import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sanity from "@sanity/astro";
import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    sanity({
      projectId: "hngg8xd3",
      dataset: "production",
    }),
    react(),
  ],
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  server: {
    host: true,
    port: 4321
  }
});
