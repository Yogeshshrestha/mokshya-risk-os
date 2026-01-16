import { defineStore } from 'pinia'
import type {
  OrganizationResponse,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationInvitationResponse,
  OrganizationInvitationCreate,
  OrganizationMemberResponse,
  OrganizationMemberCreate,
  OrganizationMemberUpdate,
  RoleResponse,
  RoleCreate,
  RoleUpdate
} from '~/types/organization'

interface OrganizationState {
  organizations: OrganizationResponse[]
  currentOrganization: OrganizationResponse | null
  members: OrganizationMemberResponse[]
  invitations: OrganizationInvitationResponse[]
  roles: RoleResponse[]
  
  loading: boolean
  error: string | null
  
  membersLoading: boolean
  membersError: string | null
  
  invitationsLoading: boolean
  invitationsError: string | null
  
  rolesLoading: boolean
  rolesError: string | null
  
  lastFetched: number | null
  cacheDuration: number
}

export const useOrganizationStore = defineStore('organization', {
  state: (): OrganizationState => ({
    organizations: [],
    currentOrganization: null,
    members: [],
    invitations: [],
    roles: [],
    
    loading: false,
    error: null,
    
    membersLoading: false,
    membersError: null,
    
    invitationsLoading: false,
    invitationsError: null,
    
    rolesLoading: false,
    rolesError: null,
    
    lastFetched: null,
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    isStale: (state) => {
      if (!state.lastFetched) return true
      return Date.now() - state.lastFetched > state.cacheDuration
    },
    
    organizationById: (state) => (id: string) => {
      return state.organizations.find(org => org.id === id) || null
    }
  },

  actions: {
    async fetchOrganizations(forceRefresh = false) {
      if (!forceRefresh && !this.isStale && this.organizations.length > 0) {
        return this.organizations
      }

      this.loading = true
      this.error = null

      try {
        const organization = useOrganization()
        const data = await organization.listOrganizations()
        this.organizations = data
        this.lastFetched = Date.now()
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch organizations'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOrganization(organizationId: string, forceRefresh = false) {
      // Check if we have it in cache
      const cached = this.organizationById(organizationId)
      if (!forceRefresh && cached && !this.isStale) {
        this.currentOrganization = cached
        return cached
      }

      this.loading = true
      this.error = null

      try {
        const organization = useOrganization()
        const data = await organization.getOrganization(organizationId)
        
        // Update in organizations array
        const index = this.organizations.findIndex(org => org.id === organizationId)
        if (index >= 0) {
          this.organizations[index] = data
        } else {
          this.organizations.push(data)
        }
        
        this.currentOrganization = data
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch organization'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createOrganization(data: OrganizationCreate) {
      this.loading = true
      this.error = null

      try {
        const organization = useOrganization()
        const newOrg = await organization.createOrganization(data)
        this.organizations.push(newOrg)
        return newOrg
      } catch (error: any) {
        this.error = error.message || 'Failed to create organization'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateOrganization(organizationId: string, data: OrganizationUpdate) {
      this.loading = true
      this.error = null

      try {
        const organization = useOrganization()
        const updated = await organization.updateOrganization(organizationId, data)
        
        // Update in organizations array
        const index = this.organizations.findIndex(org => org.id === organizationId)
        if (index >= 0) {
          this.organizations[index] = updated
        }
        
        if (this.currentOrganization?.id === organizationId) {
          this.currentOrganization = updated
        }
        
        return updated
      } catch (error: any) {
        this.error = error.message || 'Failed to update organization'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMembers(organizationId: string) {
      this.membersLoading = true
      this.membersError = null

      try {
        const organization = useOrganization()
        const data = await organization.listMembers(organizationId)
        this.members = data
        return data
      } catch (error: any) {
        this.membersError = error.message || 'Failed to fetch members'
        throw error
      } finally {
        this.membersLoading = false
      }
    },

    async addMember(organizationId: string, data: OrganizationMemberCreate) {
      this.membersLoading = true
      this.membersError = null

      try {
        const organization = useOrganization()
        const member = await organization.addMember(organizationId, data)
        this.members.push(member)
        return member
      } catch (error: any) {
        this.membersError = error.message || 'Failed to add member'
        throw error
      } finally {
        this.membersLoading = false
      }
    },

    async updateMember(organizationId: string, memberId: string, data: OrganizationMemberUpdate) {
      this.membersLoading = true
      this.membersError = null

      try {
        const organization = useOrganization()
        const updated = await organization.updateMember(organizationId, memberId, data)
        
        const index = this.members.findIndex(m => m.id === memberId)
        if (index >= 0) {
          this.members[index] = updated
        }
        
        return updated
      } catch (error: any) {
        this.membersError = error.message || 'Failed to update member'
        throw error
      } finally {
        this.membersLoading = false
      }
    },

    async removeMember(organizationId: string, memberId: string) {
      this.membersLoading = true
      this.membersError = null

      try {
        const organization = useOrganization()
        await organization.removeMember(organizationId, memberId)
        this.members = this.members.filter(m => m.id !== memberId)
      } catch (error: any) {
        this.membersError = error.message || 'Failed to remove member'
        throw error
      } finally {
        this.membersLoading = false
      }
    },

    async fetchInvitations(organizationId: string) {
      this.invitationsLoading = true
      this.invitationsError = null

      try {
        const organization = useOrganization()
        const data = await organization.listInvitations(organizationId)
        this.invitations = data
        return data
      } catch (error: any) {
        this.invitationsError = error.message || 'Failed to fetch invitations'
        throw error
      } finally {
        this.invitationsLoading = false
      }
    },

    async inviteUser(organizationId: string, data: OrganizationInvitationCreate) {
      this.invitationsLoading = true
      this.invitationsError = null

      try {
        const organization = useOrganization()
        const invitation = await organization.inviteUser(organizationId, data)
        this.invitations.push(invitation)
        return invitation
      } catch (error: any) {
        this.invitationsError = error.message || 'Failed to invite user'
        throw error
      } finally {
        this.invitationsLoading = false
      }
    },

    async cancelInvitation(organizationId: string, invitationId: string) {
      this.invitationsLoading = true
      this.invitationsError = null

      try {
        const organization = useOrganization()
        await organization.cancelInvitation(organizationId, invitationId)
        this.invitations = this.invitations.filter(inv => inv.id !== invitationId)
      } catch (error: any) {
        this.invitationsError = error.message || 'Failed to cancel invitation'
        throw error
      } finally {
        this.invitationsLoading = false
      }
    },

    async fetchRoles(organizationId: string) {
      this.rolesLoading = true
      this.rolesError = null

      try {
        const organization = useOrganization()
        const data = await organization.listRoles(organizationId)
        this.roles = data
        return data
      } catch (error: any) {
        this.rolesError = error.message || 'Failed to fetch roles'
        throw error
      } finally {
        this.rolesLoading = false
      }
    },

    async createRole(organizationId: string, data: RoleCreate) {
      this.rolesLoading = true
      this.rolesError = null

      try {
        const organization = useOrganization()
        const role = await organization.createRole(organizationId, data)
        this.roles.push(role)
        return role
      } catch (error: any) {
        this.rolesError = error.message || 'Failed to create role'
        throw error
      } finally {
        this.rolesLoading = false
      }
    },

    async updateRole(organizationId: string, roleId: string, data: RoleUpdate) {
      this.rolesLoading = true
      this.rolesError = null

      try {
        const organization = useOrganization()
        const updated = await organization.updateRole(organizationId, roleId, data)
        
        const index = this.roles.findIndex(r => r.id === roleId)
        if (index >= 0) {
          this.roles[index] = updated
        }
        
        return updated
      } catch (error: any) {
        this.rolesError = error.message || 'Failed to update role'
        throw error
      } finally {
        this.rolesLoading = false
      }
    },

    async deleteRole(organizationId: string, roleId: string) {
      this.rolesLoading = true
      this.rolesError = null

      try {
        const organization = useOrganization()
        await organization.deleteRole(organizationId, roleId)
        this.roles = this.roles.filter(r => r.id !== roleId)
      } catch (error: any) {
        this.rolesError = error.message || 'Failed to delete role'
        throw error
      } finally {
        this.rolesLoading = false
      }
    },

    setCurrentOrganization(organization: OrganizationResponse | null) {
      this.currentOrganization = organization
    },

    clearOrganizations() {
      this.organizations = []
      this.currentOrganization = null
      this.members = []
      this.invitations = []
      this.roles = []
      this.lastFetched = null
    }
  }
})
