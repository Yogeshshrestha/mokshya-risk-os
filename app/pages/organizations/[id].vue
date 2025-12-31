<script setup lang="ts">
import type {
  OrganizationResponse,
  OrganizationMemberWithUser,
  OrganizationInvitationResponse,
  RoleResponse
} from '~/types/organization'

const route = useRoute()
const router = useRouter()
const organization = useOrganization()
const auth = useAuth()

const organizationId = route.params.id as string

// State
const org = ref<OrganizationResponse | null>(null)
const members = ref<OrganizationMemberWithUser[]>([])
const invitations = ref<OrganizationInvitationResponse[]>([])
const roles = ref<RoleResponse[]>([])
const isLoading = ref(true)
const activeTab = ref<'overview' | 'members' | 'invitations' | 'roles'>('overview')
const showInviteModal = ref(false)
const showCreateRoleModal = ref(false)

// Fetch organization data
const fetchOrganization = async () => {
  try {
    isLoading.value = true
    org.value = await organization.getOrganization(organizationId)
  } catch (error) {
    console.error('Failed to fetch organization:', error)
    router.push('/organizations')
  } finally {
    isLoading.value = false
  }
}

const fetchMembers = async () => {
  try {
    members.value = await organization.listMembers(organizationId)
  } catch (error) {
    console.error('Failed to fetch members:', error)
  }
}

const fetchInvitations = async () => {
  try {
    invitations.value = await organization.listInvitations(organizationId)
  } catch (error) {
    console.error('Failed to fetch invitations:', error)
  }
}

const fetchRoles = async () => {
  try {
    roles.value = await organization.listRoles(organizationId)
  } catch (error) {
    console.error('Failed to fetch roles:', error)
  }
}

onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }
  fetchOrganization()
  fetchMembers()
  fetchInvitations()
  fetchRoles()
})

// Refresh data
const refreshData = () => {
  fetchMembers()
  fetchInvitations()
  fetchRoles()
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Handle invitation sent
const handleInvitationSent = () => {
  showInviteModal.value = false
  fetchInvitations()
}

// Handle role created
const handleRoleCreated = () => {
  showCreateRoleModal.value = false
  fetchRoles()
}

useSeoMeta({
  title: () => org.value ? `${org.value.name} | Mokshya OS` : 'Organization | Mokshya OS',
  description: 'Manage organization details, members, and roles'
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <UContainer class="py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-mokshya-text">Loading organization...</p>
        </div>
      </div>

      <div v-else-if="org">
        <!-- Breadcrumb -->
        <nav class="mb-6">
          <ol class="flex items-center gap-2 text-sm text-mokshya-text">
            <li>
              <NuxtLink
                to="/organizations"
                class="hover:text-mokshya-dark transition-colors"
              >
                Organizations
              </NuxtLink>
            </li>
            <li class="text-gray-400">/</li>
            <li class="font-medium text-mokshya-dark">{{ org.name }}</li>
          </ol>
        </nav>

        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-mokshya-dark mb-2">
                {{ org.name }}
              </h1>
              <p v-if="org.description" class="text-base text-mokshya-text">
                {{ org.description }}
              </p>
            </div>
            <div
              v-if="org.is_active"
              class="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg"
            >
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium text-green-700">Active</span>
            </div>
            <div v-else-if="org.is_active === false" class="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <div class="w-2 h-2 bg-red-500 rounded-full"></div>
              <span class="text-sm font-medium text-red-700">Inactive</span>
            </div>
          </div>

          <!-- Organization Details -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div v-if="org.industry" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-[#09423C]/10 rounded-lg flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-[#09423C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Industry</p>
                <p class="text-sm font-semibold text-mokshya-dark">{{ org.industry }}</p>
              </div>
            </div>
            <div v-if="org.company_size" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-[#09423C]/10 rounded-lg flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-[#09423C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Company Size</p>
                <p class="text-sm font-semibold text-mokshya-dark">{{ org.company_size }}</p>
              </div>
            </div>
            <div v-if="org.primary_operating_region" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-[#09423C]/10 rounded-lg flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-[#09423C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Region</p>
                <p class="text-sm font-semibold text-mokshya-dark">{{ org.primary_operating_region }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="flex gap-6">
            <button
              v-for="tab in [
                { id: 'overview', label: 'Overview' },
                { id: 'members', label: 'Members' },
                { id: 'invitations', label: 'Invitations' },
                { id: 'roles', label: 'Roles' }
              ]"
              :key="tab.id"
              @click="activeTab = tab.id as any"
              :class="[
                'pb-4 px-1 text-sm font-semibold border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'text-[#09423C] border-[#09423C]'
                  : 'text-mokshya-text border-transparent hover:text-[#09423C]'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div>
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-mokshya-dark mb-4">Organization Information</h3>
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm text-gray-500 mb-1">Created</dt>
                  <dd class="text-sm font-medium text-mokshya-dark">{{ formatDate(org.created_at) }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500 mb-1">Last Updated</dt>
                  <dd class="text-sm font-medium text-mokshya-dark">{{ formatDate(org.updated_at) }}</dd>
                </div>
                <div v-if="org.slug">
                  <dt class="text-sm text-gray-500 mb-1">Slug</dt>
                  <dd class="text-sm font-medium text-mokshya-dark">{{ org.slug }}</dd>
                </div>
                <div v-if="org.annual_revenue_usd">
                  <dt class="text-sm text-gray-500 mb-1">Annual Revenue</dt>
                  <dd class="text-sm font-medium text-mokshya-dark">
                    ${{ org.annual_revenue_usd.toLocaleString() }}
                  </dd>
                </div>
              </dl>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 bg-[#09423C]/10 rounded-lg flex items-center justify-center">
                    <svg
                      class="w-5 h-5 text-[#09423C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-mokshya-dark">{{ members.length }}</p>
                    <p class="text-sm text-gray-500">Members</p>
                  </div>
                </div>
              </div>
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 bg-[#09423C]/10 rounded-lg flex items-center justify-center">
                    <svg
                      class="w-5 h-5 text-[#09423C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-mokshya-dark">{{ invitations.length }}</p>
                    <p class="text-sm text-gray-500">Invitations</p>
                  </div>
                </div>
              </div>
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 bg-[#09423C]/10 rounded-lg flex items-center justify-center">
                    <svg
                      class="w-5 h-5 text-[#09423C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-mokshya-dark">{{ roles.length }}</p>
                    <p class="text-sm text-gray-500">Roles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Members Tab -->
          <div v-if="activeTab === 'members'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-mokshya-dark">Members</h3>
              <button
                @click="showInviteModal = true"
                class="px-4 py-2 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Invite Member
              </button>
            </div>

            <div v-if="members.length === 0" class="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p class="text-mokshya-text">No members yet</p>
            </div>

            <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-mokshya-dark uppercase tracking-wider">
                      Member
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-mokshya-dark uppercase tracking-wider">
                      Role
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-mokshya-dark uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-mokshya-dark uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="member in members"
                    :key="member.id"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-6 py-4">
                      <div>
                        <p class="text-sm font-medium text-mokshya-dark">
                          {{ member.user_full_name || 'Unknown' }}
                        </p>
                        <p class="text-sm text-gray-500">{{ member.user_email }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm text-mokshya-text">
                        {{ member.role_id ? 'Assigned' : 'No role' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          member.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        ]"
                      >
                        {{ member.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      {{ formatDate(member.joined_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Invitations Tab -->
          <div v-if="activeTab === 'invitations'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-mokshya-dark">Invitations</h3>
              <button
                @click="showInviteModal = true"
                class="px-4 py-2 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Send Invitation
              </button>
            </div>

            <div v-if="invitations.length === 0" class="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p class="text-mokshya-text">No pending invitations</p>
            </div>

            <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-mokshya-dark uppercase tracking-wider">
                      Email
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-mokshya-dark uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-mokshya-dark uppercase tracking-wider">
                      Expires
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-mokshya-dark uppercase tracking-wider">
                      Sent
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="invitation in invitations"
                    :key="invitation.id"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-6 py-4">
                      <p class="text-sm font-medium text-mokshya-dark">{{ invitation.email }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          invitation.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : invitation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        ]"
                      >
                        {{ invitation.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      {{ formatDate(invitation.expires_at) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      {{ formatDate(invitation.created_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Roles Tab -->
          <div v-if="activeTab === 'roles'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-mokshya-dark">Roles</h3>
              <button
                @click="showCreateRoleModal = true"
                class="px-4 py-2 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Role
              </button>
            </div>

            <div v-if="roles.length === 0" class="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p class="text-mokshya-text">No roles defined</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="role in roles"
                :key="role.id"
                class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-4">
                  <h4 class="text-lg font-semibold text-mokshya-dark">{{ role.name }}</h4>
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      role.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ role.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p v-if="role.description" class="text-sm text-mokshya-text mb-4">
                  {{ role.description }}
                </p>
                <div v-if="role.permissions.length > 0" class="mb-4">
                  <p class="text-xs text-gray-500 mb-2">Permissions:</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="permission in role.permissions.slice(0, 3)"
                      :key="permission"
                      class="px-2 py-1 bg-gray-100 rounded text-xs text-mokshya-text"
                    >
                      {{ permission }}
                    </span>
                    <span
                      v-if="role.permissions.length > 3"
                      class="px-2 py-1 bg-gray-100 rounded text-xs text-mokshya-text"
                    >
                      +{{ role.permissions.length - 3 }} more
                    </span>
                  </div>
                </div>
                <p class="text-xs text-gray-500">
                  Created {{ formatDate(role.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <InviteUserModal
        v-model="showInviteModal"
        :organization-id="organizationId"
        @invited="handleInvitationSent"
      />
      <CreateRoleModal
        v-model="showCreateRoleModal"
        :organization-id="organizationId"
        @created="handleRoleCreated"
      />
    </UContainer>
  </div>
</template>

