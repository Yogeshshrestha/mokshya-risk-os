/**
 * Client-side auth plugin to initialize auth state on app startup
 */

export default defineNuxtPlugin(async () => {
  // Initialize auth on client side
  if (import.meta.client) {
    const auth = useAuth()
    const api = useApi()
    const token = api.getAuthToken()
    
    // If token exists, try to fetch user data
    if (token) {
      try {
        await auth.fetchUser()
      } catch {
        // If fetch fails, tokens are likely invalid
        // Clear them silently
        api.clearAuthTokens()
      }
    }
  }
})


