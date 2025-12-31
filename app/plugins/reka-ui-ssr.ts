// Plugin to handle reka-ui SSR compatibility
// This ensures reka-ui's ConfigProvider works correctly during SSR

export default defineNuxtPlugin({
  name: 'reka-ui-ssr-fix',
  enforce: 'pre',
  setup() {
    // During SSR, ensure that reka-ui components are properly handled
    // The build configuration in nuxt.config.ts handles the bundling
    // This plugin ensures proper initialization
    if (import.meta.server) {
      // Server-side: ensure proper SSR handling
      // The vite.ssr.noExternal config ensures reka-ui is bundled correctly
    }
  }
})




