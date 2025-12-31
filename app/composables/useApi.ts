/**
 * API client composable for making HTTP requests
 */

const API_BASE_URL = 'https://riskos-stage-api.mokshya.ai/api/v1'

interface RequestOptions extends RequestInit {
  requireAuth?: boolean
}

export const useApi = () => {
  const getAuthToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem('accessToken')
    }
    return null
  }

  const getRefreshToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem('refreshToken')
    }
    return null
  }

  const setAuthTokens = (accessToken: string, refreshToken: string) => {
    if (import.meta.client) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    }
  }

  const clearAuthTokens = () => {
    if (import.meta.client) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  const request = async <T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const { requireAuth = false, ...fetchOptions } = options

    const headers: HeadersInit = {
      ...fetchOptions.headers,
    }

    // Only set Content-Type for requests with body (POST, PUT, PATCH)
    // But don't override if Content-Type is already explicitly set
    const hasBody = fetchOptions.body !== undefined
    const hasContentType = headers['Content-Type'] || (fetchOptions.headers && 'Content-Type' in fetchOptions.headers)
    if (hasBody && !hasContentType) {
      headers['Content-Type'] = 'application/json'
    }

    if (requireAuth) {
      const token = getAuthToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    const url = `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && requireAuth) {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          try {
            // Try to refresh the token (OAuth2 format)
            const formData = new URLSearchParams()
            formData.append('grant_type', 'refresh_token')
            formData.append('refresh_token', refreshToken)
            
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData.toString(),
            })

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()
              // Handle OAuth2 response format (snake_case)
              const accessToken = refreshData.access_token || refreshData.accessToken
              const newRefreshToken = refreshData.refresh_token || refreshData.refreshToken
              setAuthTokens(accessToken, newRefreshToken)

              // Retry the original request with new token
              const newAccessToken = refreshData.access_token || refreshData.accessToken
              headers.Authorization = `Bearer ${newAccessToken}`
              const retryResponse = await fetch(url, {
                ...fetchOptions,
                headers,
              })

              if (!retryResponse.ok) {
                const errorData = await retryResponse.json().catch(() => ({
                  message: retryResponse.statusText,
                  statusCode: retryResponse.status,
                }))
                throw errorData
              }

              return await retryResponse.json()
            } else {
              // Refresh failed, clear tokens and throw error
              clearAuthTokens()
              throw { message: 'Session expired. Please login again.', statusCode: 401 }
            }
          } catch (error) {
            clearAuthTokens()
            throw error
          }
        } else {
          throw { message: 'Authentication required', statusCode: 401 }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
          statusCode: response.status,
        }))
        throw errorData
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return {} as T
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          message: 'Network error: Unable to connect to the server. Please check your connection.',
          statusCode: 0,
        }
      }
      throw error
    }
  }

  return {
    request,
    getAuthToken,
    getRefreshToken,
    setAuthTokens,
    clearAuthTokens,
  }
}


