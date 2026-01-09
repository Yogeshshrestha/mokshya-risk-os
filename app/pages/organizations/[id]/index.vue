<script setup lang="ts">
import type {
  OrganizationResponse,
  OrganizationMemberWithUser,
  OrganizationInvitationResponse,
  RoleResponse
} from '~/types/organization'
import type { GlobalQuestionnaireScoreResponse } from '~/types/global-questionnaire'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const organization = useOrganization()
const questionnaire = useGlobalQuestionnaire()
const auth = useAuth()

const organizationId = route.params.id as string

// State
const org = ref<OrganizationResponse | null>(null)
const members = ref<OrganizationMemberWithUser[]>([])
const invitations = ref<OrganizationInvitationResponse[]>([])
const roles = ref<RoleResponse[]>([])
const score = ref<GlobalQuestionnaireScoreResponse | null>(null)
const isLoading = ref(true)
const activeTab = ref<'overview' | 'members' | 'invitations' | 'roles'>('overview')
const showInviteModal = ref(false)
const showCreateRoleModal = ref(false)
const selectedPersona = ref('cro')

// Fetch score
const fetchScore = async () => {
  try {
    score.value = await questionnaire.getOrganizationScore(organizationId)
  } catch (error) {
    console.error('Failed to fetch score:', error)
  }
}

// Fetch organization data
const fetchOrganization = async () => {
  try {
    isLoading.value = true
    org.value = await organization.getOrganization(organizationId)
    await fetchScore()
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
  <div class="flex h-screen bg-[#f8fbfb] overflow-hidden">
    <DashboardSidebar />
    
    <div class="flex-1 flex flex-col min-w-0">
      <DashboardHeader 
        title="Organization Profile"
        v-model:persona="selectedPersona"
      />
      
      <main class="flex-1 overflow-y-auto py-8">
        <div v-if="isLoading" class="animate-pulse space-y-6 px-4 sm:px-6 lg:px-8 mx-auto">
        <div class="h-4 w-24 sm:w-32 bg-gray-200 rounded"></div>
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div class="space-y-3 flex-1">
            <div class="h-8 sm:h-10 w-full sm:w-64 bg-gray-200 rounded-lg"></div>
            <div class="h-4 w-full sm:w-96 bg-gray-200 rounded"></div>
          </div>
          <div class="h-8 w-full sm:w-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div class="h-20 sm:h-24 bg-gray-200 rounded-xl"></div>
          <div class="h-20 sm:h-24 bg-gray-200 rounded-xl"></div>
          <div class="h-20 sm:h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <div v-else-if="org" class="px-4 sm:px-6 lg:px-8 mx-auto space-y-8">
        
        <header class="relative z-10 bg-white border border-[#e8f3f2] rounded-[24px] p-6 sm:p-8 shadow-sm">
          <nav class="mb-6">
            <ol class="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-[#4f9690] uppercase tracking-wider overflow-x-auto">
              <li class="flex-shrink-0">
                <NuxtLink to="/organizations" class="hover:text-[#09423C] transition-colors flex items-center gap-1">
                  Organizations
                </NuxtLink>
              </li>
              <li class="text-gray-300 flex-shrink-0">/</li>
              <li class="text-[#0e1b1a] truncate font-extrabold">{{ org.name }}</li>
            </ol>
          </nav>

          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-4 sm:gap-6 mb-4">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] bg-[#e8f3f2] flex items-center justify-center text-[#09423C] text-2xl sm:text-3xl font-extrabold shadow-sm flex-shrink-0 border border-white">
                  {{ org.name.substring(0, 1).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0e1b1a] tracking-tight truncate mb-2">
                    {{ org.name }}
                  </h1>
                  <div class="flex flex-wrap items-center gap-2">
                    <span v-if="org.industry" class="text-xs font-bold text-[#4f9690] bg-[#f8fbfb] border border-[#e8f3f2] px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {{ org.industry }}
                    </span>
                    <span v-if="org.is_active" class="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                      <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Active
                    </span>
                    <span v-else class="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                      <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      Inactive
                    </span>
                  </div>
                </div>
              </div>
              <p v-if="org.description" class="text-[15px] text-[#4f9690] max-w-2xl leading-relaxed font-medium">
                {{ org.description }}
              </p>
            </div>
            
            <div class="flex items-center gap-3 flex-shrink-0">
               <NuxtLink 
                  v-if="score"
                  :to="`/organizations/${organizationId}/dashboard`"
                  class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#09423C] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-lg shadow-[#09423C]/20 text-sm sm:text-base whitespace-nowrap"
               >
                  <UIcon :name="score.answered_questions === score.total_questions ? 'i-lucide-layout-dashboard' : 'i-lucide-clipboard-check'" class="size-5" />
                  {{ score.answered_questions === score.total_questions ? 'View Dashboard' : 'View Risk Intelligence' }}
               </NuxtLink>
               <button class="p-3.5 text-[#4f9690] hover:text-[#09423C] hover:bg-[#e8f3f2] rounded-xl transition-all border border-[#e8f3f2]">
                  <UIcon name="i-lucide-settings" class="size-5" />
               </button>
            </div>
          </div>
        </header>

        <!-- Tabs Navigation -->
        <div class="flex items-center gap-2 p-1 bg-gray-100/50 rounded-2xl w-fit border border-[#e8f3f2] overflow-x-auto max-w-full">
          <button
            v-for="tab in [
              { id: 'overview', label: 'Overview', icon: 'i-lucide-layout-grid' },
              { id: 'members', label: 'Team Members', icon: 'i-lucide-users' },
              { id: 'invitations', label: 'Invitations', icon: 'i-lucide-mail' },
              { id: 'roles', label: 'Roles & Permissions', icon: 'i-lucide-shield-check' }
            ]"
            :key="tab.id"
            @click="activeTab = tab.id as any"
            :class="[
              'flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white text-[#09433e] shadow-sm border border-[#e8f3f2]'
                : 'text-[#6b8a87] hover:text-[#09433e] hover:bg-white/50'
            ]"
          >
            <UIcon :name="tab.icon" class="size-4.5 flex-shrink-0" />
            <span>{{ tab.label }}</span>
            <span v-if="tab.id === 'members'" class="bg-[#09433e]/10 text-[#09433e] px-2 py-0.5 rounded-full text-[11px] ml-1">{{ members.length }}</span>
            <span v-if="tab.id === 'invitations' && invitations.length > 0" class="bg-rose-50 text-red-600 px-2 py-0.5 rounded-full text-[11px] ml-1">{{ invitations.length }}</span>
          </button>
        </div>

        <div class="pt-6">
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
            mode="out-in"
          >
            <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              
              <!-- Security Assessment Section -->
              <div class="lg:col-span-1 order-1 lg:order-3">
                 <div class="relative overflow-hidden rounded-2xl bg-[#09423C] text-white p-8 shadow-xl h-full flex flex-col justify-between group">
                    <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                    <div class="absolute bottom-0 right-0 w-32 h-32 bg-teal-400/20 rounded-full blur-xl"></div>
                    
                    <div class="relative z-10">
                       <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/10">
                          <UIcon name="i-lucide-clipboard-check" class="size-6 text-white" />
                       </div>
                       <h3 class="text-xl font-extrabold mb-3">Security Assessment</h3>
                       <p class="text-teal-50 text-[14px] mb-8 leading-relaxed font-medium opacity-90">
                          Evaluate your organization's controls to improve your security posture and compliance rating.
                       </p>
                    </div>
                    
                    <div class="relative z-10 space-y-4">
                      <!-- Progress Mini-bar -->
                      <div v-if="score" class="space-y-2">
                        <div class="flex justify-between text-[11px] font-extrabold uppercase tracking-wider text-teal-100">
                          <span>Progress</span>
                          <span>{{ score.answered_questions }}/{{ score.total_questions }}</span>
                        </div>
                        <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div class="h-full bg-white transition-all duration-500" :style="{ width: `${(score.answered_questions / score.total_questions) * 100}%` }"></div>
                        </div>
                      </div>

                      <NuxtLink
                         :to="`/organizations/${organizationId}/assessment`"
                         class="w-full flex items-center justify-center gap-2 bg-white text-[#09423C] py-3 px-4 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-sm text-sm"
                      >
                         {{ score && score.answered_questions > 0 ? 'Continue' : 'Start' }} Assessment
                         <UIcon name="i-lucide-arrow-right" class="size-4" />
                      </NuxtLink>
                    </div>
                 </div>
              </div>

              <!-- Stats Cards -->
              <div class="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 order-2 lg:order-1">
                <div class="bg-white p-6 rounded-2xl border border-[#e8f3f2] shadow-sm hover:shadow-md transition-all">
                  <div class="flex items-center gap-4">
                    <div class="p-3 bg-[#e8f3f2] text-[#4f9690] rounded-xl flex-shrink-0">
                      <UIcon name="i-lucide-users" class="size-6" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-[#4f9690] uppercase tracking-wider">Total Members</p>
                      <p class="text-2xl font-extrabold text-[#0e1b1a]">{{ members.length }}</p>
                    </div>
                  </div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-[#e8f3f2] shadow-sm hover:shadow-md transition-all">
                  <div class="flex items-center gap-4">
                     <div class="p-3 bg-[#fff7ed] text-[#ea580c] rounded-xl flex-shrink-0">
                      <UIcon name="i-lucide-mail" class="size-6" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-[#4f9690] uppercase tracking-wider">Pending Invites</p>
                      <p class="text-2xl font-extrabold text-[#0e1b1a]">{{ invitations.length }}</p>
                    </div>
                  </div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-[#e8f3f2] shadow-sm hover:shadow-md transition-all">
                  <div class="flex items-center gap-4">
                    <div class="p-3 bg-[#f0f9ff] text-[#0284c7] rounded-xl flex-shrink-0">
                      <UIcon name="i-lucide-shield-check" class="size-6" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-[#4f9690] uppercase tracking-wider">Active Roles</p>
                      <p class="text-2xl font-extrabold text-[#0e1b1a]">{{ roles.length }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Organization Details -->
              <div class="lg:col-span-2 bg-white rounded-2xl border border-[#e8f3f2] overflow-hidden shadow-sm order-3 lg:order-2">
                 <div class="px-6 py-4 border-b border-[#e8f3f2] flex justify-between items-center bg-[#f8fbfb]/50">
                    <h3 class="text-sm font-bold text-[#0e1b1a] uppercase tracking-wider">Organization Details</h3>
                 </div>
                 <div class="p-6 sm:p-8">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-8">
                       <div v-if="org.primary_operating_region">
                          <dt class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-[1px] mb-2">Region</dt>
                          <dd class="text-base font-bold text-[#0e1b1a] flex items-center gap-2">
                             <UIcon name="i-lucide-map-pin" class="size-4 text-[#09423C]" /> <span class="truncate">{{ org.primary_operating_region }}</span>
                          </dd>
                       </div>
                       <div v-if="org.company_size">
                          <dt class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-[1px] mb-2">Company Size</dt>
                          <dd class="text-base font-bold text-[#0e1b1a] flex items-center gap-2">
                            <UIcon name="i-lucide-users-2" class="size-4 text-[#09423C]" /> {{ org.company_size }} Employees
                          </dd>
                       </div>
                       <div v-if="org.annual_revenue_usd">
                          <dt class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-[1px] mb-2">Annual Revenue</dt>
                          <dd class="text-base font-bold text-[#0e1b1a] flex items-center gap-2">
                            <UIcon name="i-lucide-banknote" class="size-4 text-[#09423C]" /> ${{ org.annual_revenue_usd.toLocaleString() }}
                          </dd>
                       </div>
                       <div>
                          <dt class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-[1px] mb-2">Founded</dt>
                          <dd class="text-base font-bold text-[#0e1b1a] flex items-center gap-2">
                            <UIcon name="i-lucide-calendar" class="size-4 text-[#09423C]" /> {{ formatDate(org.created_at) }}
                          </dd>
                       </div>
                       <div class="sm:col-span-2 pt-6 border-t border-[#e8f3f2]" v-if="org.slug">
                          <dt class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-[1px] mb-3">Public Identifier (Slug)</dt>
                          <dd class="flex items-center gap-3">
                             <code class="bg-[#f8fbfb] text-[#09423C] px-3 py-1.5 rounded-lg text-sm font-bold border border-[#d0e6e5] break-all">{{ org.slug }}</code>
                             <button class="p-1.5 text-[#4f9690] hover:text-[#09423C] transition-colors"><UIcon name="i-lucide-copy" class="size-4" /></button>
                          </dd>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'members'" class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                 <div>
                    <h3 class="text-base sm:text-lg font-bold text-gray-900">Team Members</h3>
                    <p class="text-xs sm:text-sm text-gray-500">Manage who has access to this organization.</p>
                 </div>
                 <button @click="showInviteModal = true" class="w-full sm:w-auto bg-[#09423C] hover:bg-[#07332e] text-white px-4 py-2.5 rounded-lg sm:rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    Invite Member
                 </button>
              </div>

              <!-- Desktop Table View -->
              <div class="hidden md:block bg-white rounded-2xl border border-[#e8f3f2] overflow-hidden shadow-sm">
                <table class="w-full">
                  <thead class="bg-[#09423c]/80 text-white uppercase text-[12px] font-bold tracking-[0.6px]">
                    <tr>
                      <th class="px-6 py-4 text-left">Member</th>
                      <th class="px-6 py-4 text-left">Role</th>
                      <th class="px-6 py-4 text-left">Status</th>
                      <th class="px-6 py-4 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#e8f3f2]">
                     <tr v-if="members.length === 0">
                        <td colspan="4" class="px-6 py-16 text-center">
                           <div class="flex flex-col items-center justify-center text-[#4f9690]">
                              <UIcon name="i-lucide-users" class="size-12 mb-4 opacity-20" />
                              <p class="text-[#0e1b1a] font-bold">No members yet</p>
                              <p class="text-sm mt-1">Invite your first team member to get started.</p>
                           </div>
                        </td>
                     </tr>
                    <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50/50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-4">
                           <div class="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm flex-shrink-0" :class="getAvatarColor(member.user_full_name)">
                              {{ getInitials(member.user_full_name || member.user_email) }}
                           </div>
                           <div class="min-w-0">
                              <p class="text-sm font-bold text-[#0e1b1a] truncate">{{ member.user_full_name || 'Unknown User' }}</p>
                              <p class="text-xs text-[#4f9690] truncate">{{ member.user_email }}</p>
                           </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                         <span v-if="member.role_id && getRoleName(member.role_id)" class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#e8f3f2] text-[#09423C] border border-[#d0e6e5]">
                           {{ getRoleName(member.role_id) }}
                         </span>
                         <span v-else class="text-[#4f9690] text-sm italic">No Role</span>
                      </td>
                      <td class="px-6 py-4">
                         <div class="flex items-center gap-2">
                           <div class="h-2 w-2 rounded-full" :class="member.is_active ? 'bg-green-500' : 'bg-gray-300'"></div>
                           <span class="text-sm font-medium text-[#0e1b1a] capitalize">{{ member.is_active ? 'Active' : 'Inactive' }}</span>
                         </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-[#4f9690]">
                        {{ formatDate(member.joined_at) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Card View -->
              <div class="md:hidden space-y-3">
                <div v-if="members.length === 0" class="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                  <div class="flex flex-col items-center justify-center">
                    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p class="text-gray-900 font-medium">No members yet</p>
                    <p class="text-gray-500 text-sm mt-1">Invite your first team member to get started.</p>
                  </div>
                </div>
                <div
                  v-for="member in members"
                  :key="member.id"
                  class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                  <div class="flex items-start gap-3 mb-3">
                    <div class="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white flex-shrink-0" :class="getAvatarColor(member.user_full_name)">
                      {{ getInitials(member.user_full_name || member.user_email) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-900 truncate">{{ member.user_full_name || 'Unknown User' }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ member.user_email }}</p>
                    </div>
                  </div>
                  <div class="space-y-2 pl-13">
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">Role</span>
                      <span v-if="member.role_id && getRoleName(member.role_id)" class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#E3F5EB] text-[#09423C] border border-[#09423C]/20">
                        {{ getRoleName(member.role_id) }}
                      </span>
                      <span v-else class="text-gray-400 text-xs italic">No Role</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">Status</span>
                      <div class="flex items-center gap-2">
                        <div class="h-2 w-2 rounded-full" :class="member.is_active ? 'bg-green-500' : 'bg-gray-300'"></div>
                        <span class="text-xs text-gray-700 capitalize">{{ member.is_active ? 'Active' : 'Inactive' }}</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">Joined</span>
                      <span class="text-xs text-gray-700">{{ formatDate(member.joined_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'invitations'" class="space-y-4">
               <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                 <div>
                    <h3 class="text-base sm:text-lg font-bold text-gray-900">Pending Invitations</h3>
                    <p class="text-xs sm:text-sm text-gray-500">Track sent invites and their status.</p>
                 </div>
                 <button @click="showInviteModal = true" class="w-full sm:w-auto bg-[#09423C] hover:bg-[#07332e] text-white px-4 py-2.5 rounded-lg sm:rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    Send Invite
                 </button>
              </div>

              <!-- Desktop Table View -->
               <div class="hidden md:block bg-white rounded-2xl border border-[#e8f3f2] overflow-hidden shadow-sm">
                 <table class="w-full">
                  <thead class="bg-[#09423c]/80 text-white uppercase text-[12px] font-bold tracking-[0.6px]">
                    <tr>
                      <th class="px-6 py-4 text-left">Email Address</th>
                      <th class="px-6 py-4 text-left">Status</th>
                      <th class="px-6 py-4 text-left">Sent Date</th>
                      <th class="px-6 py-4 text-left">Expires</th>
                      <th class="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#e8f3f2]">
                     <tr v-if="invitations.length === 0">
                        <td colspan="5" class="px-6 py-16 text-center">
                           <div class="flex flex-col items-center justify-center text-[#4f9690]">
                              <UIcon name="i-lucide-mail" class="size-12 mb-4 opacity-20" />
                              <p class="text-[#0e1b1a] font-bold">No pending invitations</p>
                              <p class="text-sm mt-1">Everyone is on board!</p>
                           </div>
                        </td>
                     </tr>
                    <tr v-for="invitation in invitations" :key="invitation.id" class="hover:bg-gray-50/50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                           <div class="w-8 h-8 rounded-full bg-[#e8f3f2] flex items-center justify-center text-[#09423C]">
                              <UIcon name="i-lucide-mail" class="size-4" />
                           </div>
                           <p class="text-sm font-bold text-[#0e1b1a]">{{ invitation.email }}</p>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span
                          :class="[
                            'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border',
                            invitation.status === 'accepted'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : invitation.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          ]"
                        >
                          {{ invitation.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-[#4f9690]">
                        {{ formatDate(invitation.created_at) }}
                      </td>
                       <td class="px-6 py-4 text-sm text-[#4f9690]">
                        {{ formatDate(invitation.expires_at) }}
                      </td>
                      <td class="px-6 py-4 text-right">
                         <button class="text-red-600 hover:text-red-800 text-sm font-bold uppercase tracking-wider">Revoke</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
               </div>

               <!-- Mobile Card View -->
               <div class="md:hidden space-y-3">
                 <div v-if="invitations.length === 0" class="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                   <div class="flex flex-col items-center justify-center">
                     <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                       <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     </div>
                     <p class="text-gray-900 font-medium">No pending invitations</p>
                     <p class="text-gray-500 text-sm mt-1">Everyone is on board!</p>
                   </div>
                 </div>
                 <div
                   v-for="invitation in invitations"
                   :key="invitation.id"
                   class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                 >
                   <div class="flex items-start gap-3 mb-3">
                     <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     </div>
                     <div class="flex-1 min-w-0">
                       <p class="text-sm font-medium text-gray-900 truncate">{{ invitation.email }}</p>
                     </div>
                   </div>
                   <div class="space-y-2 pl-11">
                     <div class="flex items-center justify-between">
                       <span class="text-xs text-gray-500">Status</span>
                       <span
                         :class="[
                           'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                           invitation.status === 'accepted'
                             ? 'bg-green-50 text-green-700 border-green-200'
                             : invitation.status === 'pending'
                             ? 'bg-amber-50 text-amber-700 border-amber-200'
                             : 'bg-gray-100 text-gray-800 border-gray-200'
                         ]"
                       >
                         {{ invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) }}
                       </span>
                     </div>
                     <div class="flex items-center justify-between">
                       <span class="text-xs text-gray-500">Sent</span>
                       <span class="text-xs text-gray-700">{{ formatDate(invitation.created_at) }}</span>
                     </div>
                     <div class="flex items-center justify-between">
                       <span class="text-xs text-gray-500">Expires</span>
                       <span class="text-xs text-gray-700">{{ formatDate(invitation.expires_at) }}</span>
                     </div>
                     <div class="pt-2 border-t border-gray-100">
                       <button class="w-full text-red-600 hover:text-red-800 text-sm font-medium text-center py-1">Revoke Invitation</button>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            <div v-else-if="activeTab === 'roles'" class="space-y-4">
               <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                 <div>
                    <h3 class="text-base sm:text-lg font-bold text-gray-900">Roles & Permissions</h3>
                    <p class="text-xs sm:text-sm text-gray-500">Define what users can do in the organization.</p>
                 </div>
                 <button @click="showCreateRoleModal = true" class="w-full sm:w-auto bg-[#09423C] hover:bg-[#07332e] text-white px-4 py-2.5 rounded-lg sm:rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Create New Role
                 </button>
              </div>

              <div v-if="roles.length === 0" class="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-8 sm:p-16 text-center shadow-sm">
                 <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 </div>
                 <h3 class="text-base sm:text-lg font-semibold text-gray-900">No roles defined</h3>
                 <p class="text-sm sm:text-base text-gray-500 mt-1 max-w-sm mx-auto">Create granular roles to manage access to sensitive parts of your organization.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                 <div
                  v-for="role in roles"
                  :key="role.id"
                  class="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-[#09423C]/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div class="absolute top-0 left-0 w-1 h-full bg-[#09423C] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div class="flex items-start justify-between mb-3 sm:mb-4">
                    <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                       <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#09423C] group-hover:bg-[#09423C] group-hover:text-white transition-colors flex-shrink-0">
                          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                       </div>
                       <div class="min-w-0 flex-1">
                          <h4 class="text-sm sm:text-base font-bold text-gray-900 truncate">{{ role.name }}</h4>
                          <span class="text-xs text-gray-400">Created {{ formatDate(role.created_at) }}</span>
                       </div>
                    </div>
                    <span :class="['w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0', role.is_active ? 'bg-green-500' : 'bg-gray-300']" title="Status"></span>
                  </div>
                  
                  <p class="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 min-h-[2.5rem] sm:h-10 line-clamp-2 leading-relaxed">
                    {{ role.description || 'No description provided.' }}
                  </p>

                  <div class="space-y-2 sm:space-y-3">
                    <div class="flex items-center justify-between text-xs text-gray-500 font-medium uppercase tracking-wide">
                       <span>Permissions</span>
                       <span>{{ role.permissions.length }}</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5 sm:gap-2">
                      <span
                        v-for="permission in role.permissions.slice(0, 3)"
                        :key="permission"
                        class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600"
                      >
                        {{ permission }}
                      </span>
                      <span
                        v-if="role.permissions.length > 3"
                        class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 rounded-md text-xs text-gray-500"
                      >
                        +{{ role.permissions.length - 3 }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 flex justify-end">
                     <button class="text-xs sm:text-sm font-medium text-[#09423C] hover:text-[#07332e] flex items-center gap-1">
                        Edit Role <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </main>

      <InviteUserModal
        v-model="showInviteModal"
        :organization-id="organizationId"
        @invited="fetchInvitations"
      />
      <CreateRoleModal
        v-model="showCreateRoleModal"
        :organization-id="organizationId"
        @created="handleRoleCreated"
      />
    </div>
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