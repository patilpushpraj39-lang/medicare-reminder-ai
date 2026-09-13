import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,

  tanstackStart: {
    router: {
      basepath: "/medicare-reminder-ai",
    },

    server: {
      preset: "vercel",
    },

    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
      },
    },
  },

  vite: {
    base: "/medicare-reminder-ai/",
  },
});
