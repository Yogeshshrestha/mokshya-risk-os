/**
 * Authentication and User type definitions
 */

export interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface OAuth2TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface GoogleAuthUrlResponse {
  auth_url: string
  state: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  message: string
  verified: boolean
}

export interface ResendVerificationEmailRequest {
  email: string
}

export interface ResendVerificationEmailResponse {
  message: string
  success: boolean
}

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  auth_provider?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface UpdateUserRequest {
  full_name?: string
  avatar_url?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}


