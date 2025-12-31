/**
 * Authentication composable for managing auth state and operations
 */

import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  OAuth2TokenResponse,
  GoogleAuthUrlResponse,
  RefreshTokenResponse,
  VerifyEmailResponse,
  ResendVerificationEmailRequest,
  ResendVerificationEmailResponse,
  User,
  UpdateUserRequest,
  ApiError,
} from '~/types/auth'

const API_BASE_URL = 'https://riskos-stage-api.mokshya.ai/api/v1'

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const api = useApi()

  /**
   * Register a new user
   */
  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      api.setAuthTokens(response.accessToken, response.refreshToken)
      user.value = response.user

      // Note: User may need to verify email after registration
      // The API should handle sending verification email automatically

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Registration failed'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login user (OAuth2 password grant)
   * OAuth2 password grant typically uses form-encoded data
   */
  const login = async (data: LoginRequest): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // OAuth2 password grant format - use form-encoded data
      const formData = new URLSearchParams()
      formData.append('grant_type', 'password')
      formData.append('username', data.email) // API expects 'username' but we use email
      formData.append('password', data.password)

      // Make direct fetch call with form-encoded data
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
          statusCode: response.status,
        }))
        throw errorData
      }

      // Handle OAuth2 token response (snake_case)
      const tokenResponse = await response.json() as OAuth2TokenResponse
      
      // Store tokens using camelCase for internal consistency
      api.setAuthTokens(tokenResponse.access_token, tokenResponse.refresh_token)
      
      // Fetch user data after successful login
      await fetchUser()
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Login failed'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh access token (OAuth2 format)
   */
  const refreshToken = async (): Promise<RefreshTokenResponse> => {
    const refreshTokenValue = api.getRefreshToken()
    if (!refreshTokenValue) {
      throw { message: 'No refresh token available', statusCode: 401 }
    }

    try {
      // OAuth2 refresh token typically uses form-encoded data
      const formData = new URLSearchParams()
      formData.append('grant_type', 'refresh_token')
      formData.append('refresh_token', refreshTokenValue)

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        throw { message: 'Token refresh failed', statusCode: response.status }
      }

      const tokenResponse = await response.json() as OAuth2TokenResponse
      
      // Store tokens using camelCase for internal consistency
      api.setAuthTokens(tokenResponse.access_token, tokenResponse.refresh_token)
      
      return {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
      }
    } catch (err) {
      api.clearAuthTokens()
      user.value = null
      throw err
    }
  }

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      await api.request('/auth/logout', {
        method: 'POST',
        requireAuth: true,
      })
    } catch (err) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', err)
    } finally {
      api.clearAuthTokens()
      user.value = null
      isLoading.value = false
    }
  }

  /**
   * Fetch current user data
   */
  const fetchUser = async (): Promise<User> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<User>('/users/me', {
        method: 'GET',
        requireAuth: true,
      })

      user.value = response
      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch user data'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user data
   */
  const updateUser = async (data: UpdateUserRequest): Promise<User> => {
    isLoading.value = true
    error.value = null

    try {
      // API expects full_name and avatar_url
      const updatePayload: Record<string, string> = {}
      if (data.full_name !== undefined) {
        updatePayload.full_name = data.full_name
      }
      if (data.avatar_url !== undefined) {
        updatePayload.avatar_url = data.avatar_url
      }

      const response = await api.request<User>('/users/me', {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify(updatePayload),
      })

      user.value = response
      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to update user data'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify email with token
   */
  const verifyEmail = async (token: string): Promise<VerifyEmailResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<VerifyEmailResponse>(
        '/auth/verify/email',
        {
          method: 'POST',
          body: JSON.stringify({ token }),
        }
      )

      // Refresh user data to get updated verification status
      if (user.value && response.verified) {
        await fetchUser()
      }

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Email verification failed'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resend verification email
   */
  const resendVerificationEmail = async (
    data: ResendVerificationEmailRequest
  ): Promise<ResendVerificationEmailResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<ResendVerificationEmailResponse>(
        '/auth/verify/email',
        {
          method: 'POST',
          body: JSON.stringify({ email: data.email }),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to resend verification email'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Initiate Google OAuth flow
   * Fetches the auth URL from the API and redirects to Google
   */
  const loginWithGoogle = async () => {
    if (!import.meta.client) return

    try {
      isLoading.value = true
      error.value = null

      // Get the callback URL - must match the route path that Google redirects to
      const callbackUrl = `${window.location.origin}/google/callback`
      
      // Fetch the Google auth URL from the API (POST request)
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirect_uri: callbackUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
          statusCode: response.status,
        }))
        throw errorData
      }

      const data = await response.json() as GoogleAuthUrlResponse
      
      // Store state and redirect_uri in sessionStorage for verification in callback
      if (data.state) {
        sessionStorage.setItem('google_oauth_state', data.state)
      }
      // Store the redirect_uri to use the exact same one in callback
      sessionStorage.setItem('google_oauth_redirect_uri', callbackUrl)

      // Redirect to Google OAuth
      if (data.auth_url) {
        window.location.href = data.auth_url
      } else {
        throw { message: 'Auth URL not provided by server' }
      }
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to initiate Google login'
      isLoading.value = false
      throw apiError
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    error: readonly(error),
    register,
    login,
    logout,
    refreshToken,
    fetchUser,
    updateUser,
    verifyEmail,
    resendVerificationEmail,
    loginWithGoogle,
    clearError,
  }
}


