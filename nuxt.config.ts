// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/hints',
    '@nuxt/image'
  ],

  devtools: {
    enabled: true
  },

  devServer: {
    port: 8080
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true },
    '/google/callback': { ssr: false }
  },

  compatibilityDate: '2025-01-15',

  // SSR configuration to handle reka-ui compatibility
  ssr: true,

  vite: {
    ssr: {
      // Include reka-ui in SSR bundle to handle it properly
      noExternal: ['reka-ui', '@nuxt/ui']
    }
  },

  // Build configuration for SSR compatibility
  build: {
    transpile: ['reka-ui']
  },

  // Component auto-import configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ]
})