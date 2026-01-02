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

// Helper: Get Initials for Avatars
const getInitials = (name: string | null) => {
  if (!name) return '??'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Helper: Random pastel color for avatars based on name length
const getAvatarColor = (name: string | null) => {
  const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-yellow-100 text-yellow-700', 'bg-pink-100 text-pink-700']
  const index = (name?.length || 0) % colors.length
  return colors[index]
}

// Helper: Get role name from role_id
const getRoleName = (roleId: string | null | undefined) => {
  if (!roleId) return null
  const role = roles.value.find(r => r.id === roleId)
  return role?.name || roleId
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
      
      <div v-if="isLoading" class="animate-pulse space-y-8">
        <div class="h-4 w-32 bg-gray-200 rounded"></div>
        <div class="flex justify-between items-start">
          <div class="space-y-3">
            <div class="h-10 w-64 bg-gray-200 rounded-lg"></div>
            <div class="h-4 w-96 bg-gray-200 rounded"></div>
          </div>
          <div class="h-8 w-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div class="grid grid-cols-3 gap-6">
          <div class="h-24 bg-gray-200 rounded-xl"></div>
          <div class="h-24 bg-gray-200 rounded-xl"></div>
          <div class="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <div v-else-if="org" class="space-y-8">
        
        <header class="relative z-10">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm text-gray-500">
              <li>
                <NuxtLink to="/organizations" class="hover:text-[#09423C] transition-colors flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Organizations
                </NuxtLink>
              </li>
              <li class="text-gray-300">/</li>
              <li class="font-medium text-gray-900">{{ org.name }}</li>
            </ol>
          </nav>

          <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-4 mb-2">
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#09423C] to-[#1a6b61] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#09423C]/20">
                  {{ org.name.substring(0, 1).toUpperCase() }}
                </div>
                <div>
                  <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
                    {{ org.name }}
                  </h1>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="org.industry" class="text-sm text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-sm">
                      {{ org.industry }}
                    </span>
                    <span v-if="org.is_active" class="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 border border-green-200/50 text-green-700 text-xs font-medium rounded-full ring-1 ring-inset ring-green-600/20">
                      <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Active
                    </span>
                    <span v-else class="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 border border-red-200/50 text-red-700 text-xs font-medium rounded-full ring-1 ring-inset ring-red-600/20">
                      Inactive
                    </span>
                  </div>
                </div>
              </div>
              <p v-if="org.description" class="text-gray-500 max-w-2xl mt-2 leading-relaxed">
                {{ org.description }}
              </p>
            </div>
            
            <div class="flex gap-3">
               <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
               </button>
               <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               </button>
            </div>
          </div>
        </header>

        <div class="border-b border-gray-200">
          <nav class="flex space-x-8" aria-label="Tabs">
            <button
              v-for="tab in [
                { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                { id: 'members', label: 'Team Members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { id: 'invitations', label: 'Invitations', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { id: 'roles', label: 'Roles & Permissions', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
              ]"
              :key="tab.id"
              @click="activeTab = tab.id as any"
              :class="[
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 gap-2',
                activeTab === tab.id
                  ? 'border-[#09423C] text-[#09423C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <svg class="w-5 h-5" :class="activeTab === tab.id ? 'text-[#09423C]' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
              </svg>
              {{ tab.label }}
              <span v-if="tab.id === 'members'" class="bg-gray-100 text-gray-600 ml-1 py-0.5 px-2 rounded-full text-xs">{{ members.length }}</span>
              <span v-if="tab.id === 'invitations' && invitations.length > 0" class="bg-red-100 text-red-600 ml-1 py-0.5 px-2 rounded-full text-xs">{{ invitations.length }}</span>
            </button>
          </nav>
        </div>

        <main>
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
            mode="out-in"
          >
            <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-center gap-4">
                    <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Total Members</p>
                      <p class="text-2xl font-bold text-gray-900">{{ members.length }}</p>
                    </div>
                  </div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-center gap-4">
                     <div class="p-3 bg-purple-50 text-purple-600 rounded-xl">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Pending Invites</p>
                      <p class="text-2xl font-bold text-gray-900">{{ invitations.length }}</p>
                    </div>
                  </div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-center gap-4">
                    <div class="p-3 bg-teal-50 text-teal-600 rounded-xl">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Active Roles</p>
                      <p class="text-2xl font-bold text-gray-900">{{ roles.length }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                 <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 class="font-semibold text-gray-900">Organization Details</h3>
                 </div>
                 <div class="p-6">
                    <div class="grid grid-cols-2 gap-y-6 gap-x-4">
                       <div v-if="org.primary_operating_region">
                          <dt class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Region</dt>
                          <dd class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                             <span class="w-2 h-2 rounded-full bg-indigo-500"></span> {{ org.primary_operating_region }}
                          </dd>
                       </div>
                       <div v-if="org.company_size">
                          <dt class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Company Size</dt>
                          <dd class="text-sm font-semibold text-gray-900">{{ org.company_size }} Employees</dd>
                       </div>
                       <div v-if="org.annual_revenue_usd">
                          <dt class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Annual Revenue</dt>
                          <dd class="text-sm font-semibold text-gray-900">${{ org.annual_revenue_usd.toLocaleString() }}</dd>
                       </div>
                       <div>
                          <dt class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Founded</dt>
                          <dd class="text-sm font-semibold text-gray-900">{{ formatDate(org.created_at) }}</dd>
                       </div>
                       <div class="col-span-2 pt-4 mt-2 border-t border-gray-100" v-if="org.slug">
                          <dt class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Public Identifier (Slug)</dt>
                          <dd class="flex items-center gap-2">
                             <code class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm border border-gray-200">{{ org.slug }}</code>
                          </dd>
                       </div>
                    </div>
                 </div>
              </div>

              <div class="lg:col-span-1">
                 <div class="relative overflow-hidden rounded-2xl bg-[#09423C] text-white p-6 shadow-xl h-full flex flex-col justify-between">
                    <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div class="absolute bottom-0 right-0 w-32 h-32 bg-teal-400/20 rounded-full blur-xl"></div>
                    
                    <div class="relative z-10">
                       <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                       </div>
                       <h3 class="text-xl font-bold mb-2">Security Assessment</h3>
                       <p class="text-teal-100 text-sm mb-6 leading-relaxed">
                          Evaluate your organization's controls to improve your security posture and compliance rating.
                       </p>
                    </div>
                    <NuxtLink
                       :to="`/assessment/global-questions/${organizationId}`"
                       class="relative z-10 w-full flex items-center justify-center gap-2 bg-white text-[#09423C] py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                       Start Assessment
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </NuxtLink>
                 </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'members'" class="space-y-4">
              <div class="flex justify-between items-center mb-6">
                 <div>
                    <h3 class="text-lg font-bold text-gray-900">Team Members</h3>
                    <p class="text-sm text-gray-500">Manage who has access to this organization.</p>
                 </div>
                 <button @click="showInviteModal = true" class="bg-[#09423C] hover:bg-[#07332e] text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    Invite Member
                 </button>
              </div>

              <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table class="w-full">
                  <thead class="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                      <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                     <tr v-if="members.length === 0">
                        <td colspan="5" class="px-6 py-16 text-center">
                           <div class="flex flex-col items-center justify-center">
                              <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                 <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                              </div>
                              <p class="text-gray-900 font-medium">No members yet</p>
                              <p class="text-gray-500 text-sm mt-1">Invite your first team member to get started.</p>
                           </div>
                        </td>
                     </tr>
                    <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50/80 transition-colors group">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-4">
                           <div class="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white" :class="getAvatarColor(member.user_full_name)">
                              {{ getInitials(member.user_full_name || member.user_email) }}
                           </div>
                           <div>
                              <p class="text-sm font-semibold text-gray-900">{{ member.user_full_name || 'Unknown User' }}</p>
                              <p class="text-xs text-gray-500">{{ member.user_email }}</p>
                           </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                         <span v-if="member.role_id && getRoleName(member.role_id)" class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#E3F5EB] text-[#09423C] border border-[#09423C]/20">
                           {{ getRoleName(member.role_id) }}
                         </span>
                         <span v-else class="text-gray-400 text-sm italic">No Role</span>
                      </td>
                      <td class="px-6 py-4">
                         <div class="flex items-center gap-2">
                           <div class="h-2 w-2 rounded-full" :class="member.is_active ? 'bg-green-500' : 'bg-gray-300'"></div>
                           <span class="text-sm text-gray-700 capitalize">{{ member.is_active ? 'Active' : 'Inactive' }}</span>
                         </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500">
                        {{ formatDate(member.joined_at) }}
                      </td>
                      <td class="px-6 py-4 text-right">
                         <button class="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                         </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="activeTab === 'invitations'" class="space-y-4">
               <div class="flex justify-between items-center mb-6">
                 <div>
                    <h3 class="text-lg font-bold text-gray-900">Pending Invitations</h3>
                    <p class="text-sm text-gray-500">Track sent invites and their status.</p>
                 </div>
                 <button @click="showInviteModal = true" class="bg-[#09423C] hover:bg-[#07332e] text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    Send Invite
                 </button>
              </div>

               <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                 <table class="w-full">
                  <thead class="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</th>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent Date</th>
                      <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                      <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                     <tr v-if="invitations.length === 0">
                        <td colspan="5" class="px-6 py-16 text-center">
                           <div class="flex flex-col items-center justify-center">
                              <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                 <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              </div>
                              <p class="text-gray-900 font-medium">No pending invitations</p>
                              <p class="text-gray-500 text-sm mt-1">Everyone is on board!</p>
                           </div>
                        </td>
                     </tr>
                    <tr v-for="invitation in invitations" :key="invitation.id" class="hover:bg-gray-50/80 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                           <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                           </div>
                           <p class="text-sm font-medium text-gray-900">{{ invitation.email }}</p>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span
                          :class="[
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                            invitation.status === 'accepted'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : invitation.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          ]"
                        >
                          {{ invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500">
                        {{ formatDate(invitation.created_at) }}
                      </td>
                       <td class="px-6 py-4 text-sm text-gray-500">
                        {{ formatDate(invitation.expires_at) }}
                      </td>
                      <td class="px-6 py-4 text-right">
                         <button class="text-red-600 hover:text-red-800 text-sm font-medium">Revoke</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
               </div>
            </div>

            <div v-else-if="activeTab === 'roles'" class="space-y-4">
               <div class="flex justify-between items-center mb-6">
                 <div>
                    <h3 class="text-lg font-bold text-gray-900">Roles & Permissions</h3>
                    <p class="text-sm text-gray-500">Define what users can do in the organization.</p>
                 </div>
                 <button @click="showCreateRoleModal = true" class="bg-[#09423C] hover:bg-[#07332e] text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Create New Role
                 </button>
              </div>

              <div v-if="roles.length === 0" class="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                 <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 </div>
                 <h3 class="text-lg font-semibold text-gray-900">No roles defined</h3>
                 <p class="text-gray-500 mt-1 max-w-sm mx-auto">Create granular roles to manage access to sensitive parts of your organization.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 <div
                  v-for="role in roles"
                  :key="role.id"
                  class="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#09423C]/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div class="absolute top-0 left-0 w-1 h-full bg-[#09423C] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                       <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#09423C] group-hover:bg-[#09423C] group-hover:text-white transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                       </div>
                       <div>
                          <h4 class="text-base font-bold text-gray-900">{{ role.name }}</h4>
                          <span class="text-xs text-gray-400">Created {{ formatDate(role.created_at) }}</span>
                       </div>
                    </div>
                    <span :class="['w-2.5 h-2.5 rounded-full', role.is_active ? 'bg-green-500' : 'bg-gray-300']" title="Status"></span>
                  </div>
                  
                  <p class="text-sm text-gray-600 mb-6 h-10 line-clamp-2 leading-relaxed">
                    {{ role.description || 'No description provided.' }}
                  </p>

                  <div class="space-y-3">
                    <div class="flex items-center justify-between text-xs text-gray-500 font-medium uppercase tracking-wide">
                       <span>Permissions</span>
                       <span>{{ role.permissions.length }}</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="permission in role.permissions.slice(0, 3)"
                        :key="permission"
                        class="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600"
                      >
                        {{ permission }}
                      </span>
                      <span
                        v-if="role.permissions.length > 3"
                        class="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-500"
                      >
                        +{{ role.permissions.length - 3 }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                     <button class="text-sm font-medium text-[#09423C] hover:text-[#07332e] flex items-center gap-1">
                        Edit Role <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </main>
      </div>

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

<style scoped>
/* Smooth transitions for list items */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>