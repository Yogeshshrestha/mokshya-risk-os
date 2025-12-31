/**
 * Organization composable for managing organization operations
 */

import type {
  OrganizationCreate,
  OrganizationResponse,
  OrganizationUpdate,
  OrganizationInvitationCreate,
  OrganizationInvitationResponse,
  OrganizationMemberCreate,
  OrganizationMemberResponse,
  OrganizationMemberUpdate,
  OrganizationMemberWithUser,
  InvitationAccept,
  RoleCreate,
  RoleResponse,
  RoleUpdate,
} from '~/types/organization'
import type { ApiError } from '~/types/auth'

export const useOrganization = () => {
  const api = useApi()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Create a new organization
   */
  const createOrganization = async (
    data: OrganizationCreate
  ): Promise<OrganizationResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationResponse>(
        '/organizations',
        {
          method: 'POST',
          requireAuth: true,
          body: JSON.stringify(data),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to create organization'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * List all organizations for the current user
   */
  const listOrganizations = async (): Promise<OrganizationResponse[]> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationResponse[]>(
        '/organizations',
        {
          method: 'GET',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to list organizations'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a specific organization by ID
   */
  const getOrganization = async (
    organizationId: string
  ): Promise<OrganizationResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationResponse>(
        `/organizations/${organizationId}`,
        {
          method: 'GET',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to get organization'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an organization
   */
  const updateOrganization = async (
    organizationId: string,
    data: OrganizationUpdate
  ): Promise<OrganizationResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationResponse>(
        `/organizations/${organizationId}`,
        {
          method: 'PATCH',
          requireAuth: true,
          body: JSON.stringify(data),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to update organization'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Invite a user to an organization
   */
  const inviteUser = async (
    organizationId: string,
    data: OrganizationInvitationCreate
  ): Promise<OrganizationInvitationResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationInvitationResponse>(
        `/organizations/${organizationId}/invitations`,
        {
          method: 'POST',
          requireAuth: true,
          body: JSON.stringify(data),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to invite user'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * List invitations for an organization
   */
  const listInvitations = async (
    organizationId: string
  ): Promise<OrganizationInvitationResponse[]> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationInvitationResponse[]>(
        `/organizations/${organizationId}/invitations`,
        {
          method: 'GET',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to list invitations'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Accept an organization invitation
   */
  const acceptInvitation = async (
    data: InvitationAccept
  ): Promise<OrganizationInvitationResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationInvitationResponse>(
        '/organizations/invitations/accept',
        {
          method: 'POST',
          requireAuth: true,
          body: JSON.stringify(data),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to accept invitation'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * List members of an organization
   */
  const listMembers = async (
    organizationId: string
  ): Promise<OrganizationMemberWithUser[]> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationMemberWithUser[]>(
        `/organizations/${organizationId}/members`,
        {
          method: 'GET',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to list members'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Add a member to an organization
   */
  const addMember = async (
    organizationId: string,
    data: OrganizationMemberCreate
  ): Promise<OrganizationMemberResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationMemberResponse>(
        `/organizations/${organizationId}/members`,
        {
          method: 'POST',
          requireAuth: true,
          body: JSON.stringify(data),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to add member'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an organization member
   */
  const updateMember = async (
    organizationId: string,
    memberId: string,
    data: OrganizationMemberUpdate
  ): Promise<OrganizationMemberResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<OrganizationMemberResponse>(
        `/organizations/${organizationId}/members/${memberId}`,
        {
          method: 'PATCH',
          requireAuth: true,
          body: JSON.stringify(data),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to update member'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Remove a member from an organization
   */
  const removeMember = async (
    organizationId: string,
    memberId: string
  ): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      await api.request(
        `/organizations/${organizationId}/members/${memberId}`,
        {
          method: 'DELETE',
          requireAuth: true,
        }
      )
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to remove member'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * List roles for an organization
   */
  const listRoles = async (
    organizationId: string
  ): Promise<RoleResponse[]> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<RoleResponse[]>(
        `/organizations/${organizationId}/roles`,
        {
          method: 'GET',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to list roles'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a role for an organization
   */
  const createRole = async (
    organizationId: string,
    data: RoleCreate
  ): Promise<RoleResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<RoleResponse>(
        `/organizations/${organizationId}/roles`,
        {
          method: 'POST',
          requireAuth: true,
          body: JSON.stringify({
            ...data,
            organization_id: organizationId,
          }),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to create role'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a specific role by ID
   */
  const getRole = async (
    organizationId: string,
    roleId: string
  ): Promise<RoleResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<RoleResponse>(
        `/organizations/${organizationId}/roles/${roleId}`,
        {
          method: 'GET',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to get role'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a role
   */
  const updateRole = async (
    organizationId: string,
    roleId: string,
    data: RoleUpdate
  ): Promise<RoleResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<RoleResponse>(
        `/organizations/${organizationId}/roles/${roleId}`,
        {
          method: 'PATCH',
          requireAuth: true,
          body: JSON.stringify(data),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to update role'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a role
   */
  const deleteRole = async (
    organizationId: string,
    roleId: string
  ): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      await api.request(
        `/organizations/${organizationId}/roles/${roleId}`,
        {
          method: 'DELETE',
          requireAuth: true,
        }
      )
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to delete role'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    createOrganization,
    listOrganizations,
    getOrganization,
    updateOrganization,
    inviteUser,
    listInvitations,
    acceptInvitation,
    listMembers,
    addMember,
    updateMember,
    removeMember,
    listRoles,
    createRole,
    getRole,
    updateRole,
    deleteRole,
    clearError,
  }
}

