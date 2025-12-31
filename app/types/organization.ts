/**
 * Organization type definitions
 */

export interface OrganizationCreate {
  name: string
  description?: string
  industry?: string
  company_size?: string
  annual_revenue_usd?: number
  primary_operating_region?: string
  slug?: string
}

export interface OrganizationResponse {
  id: string
  name: string
  description?: string
  industry?: string
  company_size?: string
  annual_revenue_usd?: number
  primary_operating_region?: string
  slug: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrganizationUpdate {
  name?: string
  description?: string
  industry?: string
  company_size?: string
  annual_revenue_usd?: number
  primary_operating_region?: string
}

export interface OrganizationInvitationCreate {
  email: string
  role_id?: string
}

export interface OrganizationInvitationResponse {
  id: string
  organization_id: string
  email: string
  role_id?: string
  status: string
  invited_by: string
  expires_at: string
  created_at: string
  accepted_at?: string
}

export interface OrganizationMemberCreate {
  user_id: string
  role_id?: string
}

export interface OrganizationMemberResponse {
  id: string
  organization_id: string
  user_id: string
  role_id?: string
  is_active: boolean
  joined_at: string
  updated_at: string
}

export interface OrganizationMemberUpdate {
  role_id?: string
  is_active?: boolean
}

export interface OrganizationMemberWithUser extends OrganizationMemberResponse {
  user_email: string
  user_full_name?: string
}

export interface InvitationAccept {
  token: string
}

export interface RoleCreate {
  name: string
  description?: string
  permissions?: string[]
  organization_id?: string
}

export interface RoleResponse {
  id: string
  name: string
  description?: string
  permissions: string[]
  organization_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoleUpdate {
  name?: string
  description?: string
  permissions?: string[]
  is_active?: boolean
}

