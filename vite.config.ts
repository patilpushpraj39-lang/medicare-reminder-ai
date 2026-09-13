import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,

  tanstackStart: {
    router: {
      basepath: "/medicare-reminder-ai",
    },

    pages: [{ path: "/" }, { path: "/auth" }, { path: "/reset-password" }],

    prerender: {
      enabled: true,
      crawlLinks: false,
    },

    server: {
      preset: "vercel",
    },

    spa: {
      enabled: true,
      maskPath: "/dashboard",
      prerender: {
        outputPath: "/_shell",
      },
    },
  },

  vite: {
    base: "/medicare-reminder-ai/",
  },
});
