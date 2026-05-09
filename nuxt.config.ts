import tailwindcss from "@tailwindcss/vite";
import { useNitro } from "nuxt/kit";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  ssr: false,
  devtools: { enabled: false },

  modules: [
    "nuxt-auth-utils",
    function spaDevManifestWorkaround(_options, nuxt) {
      nuxt.hook("vite:extendConfig", (_config, context) => {
        if (!nuxt.options.dev || nuxt.options.ssr || !context.isClient) {
          return;
        }

        const nitro = useNitro();
        const clientManifestPath = pathToFileURL(
          resolve(nuxt.options.buildDir, "dist/server/client.manifest.mjs"),
        ).href;

        nitro.options.virtual ||= {};
        nitro.options._config.virtual ||= {};

        for (const virtual of [
          nitro.options.virtual,
          nitro.options._config.virtual,
        ]) {
          virtual["#build/dist/server/server.mjs"] = "export default () => {}";
          virtual["#build/dist/server/client.manifest.mjs"] =
            `export { default } from ${JSON.stringify(clientManifestPath)}`;
        }
      });
    },
    "@bg-dev/nuxt-naiveui",
    "@nuxt/image",
  ],

  future: {
    compatibilityVersion: 4,
  },

  // Nuxt 4 structure typically puts everything in /app
  // But we want to be explicit if it's failing
  // srcDir: '.',

  css: ["assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["naive-ui", "vueuc", "date-fns-tz/formatInTimeZone"],
    },
    server: {
      hmr: {
        protocol: "ws",
        host: "localhost",
      },
    },
  },

  experimental: {
    //@ts-ignore
    viteNode: false,
  },

  nitro: {
    preset: "node-server",
  },

  app: {
    head: {
      title: "iCheck Admin Panel",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
        },
      ],
    },
  },
  runtimeConfig: {
    // nuxt-auth-utils üçün standart budur:
    sessionPassword:
      process.env.NUXT_SESSION_PASSWORD ||
      "bu_chox_uzun_ve_gizli_bir_shifredir_32_simvol",

    public: {
      apiBaseUrl: "https://icheckapi.200soft.com",
    },
  },

  routeRules: {
    // Əgər /api/**-ni proxy edirsənsə, sənin server/routes/auth/login.post.ts faylınla toqquşa bilər.
    // Bunu hələlik söndür və ya dəqiqləşdir.
  },
});
