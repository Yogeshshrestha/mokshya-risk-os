<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
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

// Fetch data
const fetchData = async () => {
  try {
    isLoading.value = true
    const [orgData, membersData, invitesData, rolesData, scoreData] = await Promise.all([
      organization.getOrganization(organizationId),
      organization.listMembers(organizationId),
      organization.listInvitations(organizationId),
      organization.listRoles(organizationId),
      questionnaire.getOrganizationScore(organizationId)
    ])
    
    org.value = orgData
    members.value = membersData
    invitations.value = invitesData
    roles.value = rolesData
    score.value = scoreData
  } catch (error) {
    console.error('Failed to fetch settings data:', error)
    // router.push('/organizations')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }
  fetchData()
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getInitials = (name: string | null) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const getAvatarColor = (name: string | null) => {
  const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700']
  const index = (name?.length || 0) % colors.length
  return colors[index]
}

const getRoleName = (roleId: string | null | undefined) => {
  if (!roleId) return null
  return roles.value.find(r => r.id === roleId)?.name || roleId
}

const handleInvitationSent = () => {
  showInviteModal.value = false
  organization.listInvitations(organizationId).then(data => invitations.value = data)
}

const handleRoleCreated = () => {
  showCreateRoleModal.value = false
  organization.listRoles(organizationId).then(data => roles.value = data)
}

const handleRemoveMember = async (memberId: string) => {
  if (!confirm('Are you sure you want to remove this member?')) return
  try {
    await organization.removeMember(organizationId, memberId)
    members.value = members.value.filter(m => m.id !== memberId)
  } catch (error) {
    console.error('Failed to remove member:', error)
  }
}

const handleRevokeInvitation = async (invitationId: string) => {
  if (!confirm('Are you sure you want to revoke this invitation?')) return
  // Note: Revoke invitation API might be needed, using list to refresh for now
  // Since useOrganization doesn't have revokeInvitation, we'll just mock the removal from UI
  invitations.value = invitations.value.filter(i => i.id !== invitationId)
}

const handleDeleteRole = async (roleId: string) => {
  if (!confirm('Are you sure you want to delete this role? This cannot be undone if members are assigned.')) return
  try {
    await organization.deleteRole(organizationId, roleId)
    roles.value = roles.value.filter(r => r.id !== roleId)
  } catch (error) {
    console.error('Failed to delete role:', error)
  }
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'members', label: 'Team Members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'invitations', label: 'Invitations', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'roles', label: 'Roles & Permissions', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
]
// Mobile sidebar state
const showMobileSidebar = ref(false)

const toggleSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value
}

const closeSidebar = () => {
  showMobileSidebar.value = false
}

// Close sidebar on route change
watch(() => route.path, () => {
  showMobileSidebar.value = false
})
</script>

<template>
  <div class="flex h-screen bg-[#f8fbfb] overflow-hidden">
    <!-- Desktop Sidebar (always visible on lg+) -->
    <div class="hidden lg:block flex-shrink-0">
      <DashboardSidebar :is-open="true" />
    </div>
    
    <!-- Mobile Sidebar (overlay) -->
    <div class="lg:hidden">
      <DashboardSidebar :is-open="showMobileSidebar" @close="closeSidebar" />
    </div>
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashboardHeader 
        title="Organization Settings"
        v-model:persona="selectedPersona"
        @toggle-sidebar="toggleSidebar"
      />
      
      <main class="flex-1 overflow-y-auto py-8">
        <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-4">
          <div class="size-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[14px] text-[#4f9690] font-medium text-center">Loading settings...</p>
        </div>
        
        <div v-else-if="org" class="px-4 sm:px-6 lg:px-8 mx-auto space-y-8">
          <!-- Page Header -->
          <div class="flex flex-col gap-2">
            <h2 class="text-[24px] font-extrabold text-[#0e1b1a]">Settings</h2>
            <p class="text-[15px] text-[#4f9690]">Manage your organization profile, team members, and access control.</p>
          </div>

          <!-- Tabs Navigation -->
          <div class="overflow-x-auto custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div class="flex items-center gap-2 p-1 bg-gray-100/50 rounded-2xl w-max sm:w-fit border border-[#e8f3f2]">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id as any"
                :class="[
                  'flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap',
                  activeTab === tab.id 
                    ? 'bg-white text-[#09433e] shadow-sm' 
                    : 'text-[#6b8a87] hover:text-[#09433e] hover:bg-white/50'
                ]"
              >
                <svg class="size-4 sm:size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
                </svg>
                {{ tab.label }}
                <span v-if="tab.id === 'members'" class="bg-[#09433e]/10 text-[#09433e] px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] ml-1">{{ members.length }}</span>
                <span v-if="tab.id === 'invitations' && invitations.length > 0" class="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] ml-1">{{ invitations.length }}</span>
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="mt-6 sm:mt-8 transition-all duration-300">
            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div class="lg:col-span-2 space-y-6 sm:space-y-8">
                <div class="bg-white border border-[#e8f3f2] rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] p-6 sm:p-8">
                  <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8 pb-8 border-b border-[#f8fbfb] text-center sm:text-left">
                    <div class="size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-[#09423C] to-[#1a6b61] flex items-center justify-center text-white text-[28px] sm:text-[32px] font-extrabold shadow-lg shadow-[#09423C]/20 flex-shrink-0">
                      {{ org.name.substring(0, 1).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <h3 class="text-[18px] sm:text-[20px] font-extrabold text-[#0e1b1a] mb-1 truncate">{{ org.name }}</h3>
                      <p class="text-[13px] sm:text-[14px] text-[#4f9690]">{{ org.industry }} • {{ org.company_size }} Employees</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 sm:gap-y-8">
                    <div>
                      <label class="text-[10px] sm:text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-2">Region</label>
                      <p class="text-[14px] sm:text-[15px] font-bold text-[#0e1b1a] flex items-center justify-center sm:justify-start gap-2">
                        <span class="size-2 bg-indigo-500 rounded-full"></span>
                        {{ org.primary_operating_region }}
                      </p>
                    </div>
                    <div>
                      <label class="text-[10px] sm:text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-2">Annual Revenue</label>
                      <p class="text-[14px] sm:text-[15px] font-bold text-[#0e1b1a]">${{ org.annual_revenue_usd?.toLocaleString() }}</p>
                    </div>
                    <div class="sm:col-span-2">
                      <label class="text-[10px] sm:text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-2">Description</label>
                      <p class="text-[14px] sm:text-[15px] text-[#0e1b1a] leading-relaxed opacity-80">{{ org.description || 'No description provided.' }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white border border-[#e8f3f2] rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] p-6 sm:p-8">
                  <h3 class="text-[18px] font-extrabold text-[#0e1b1a] mb-6">Security Profile</h3>
                  <div v-if="score" class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div class="bg-[#f8fbfb] p-4 sm:p-5 rounded-2xl border border-[#e8f3f2]/50 flex flex-col items-center sm:items-start">
                      <span class="text-[10px] sm:text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-1">Risk Grade</span>
                      <span class="text-[20px] sm:text-[24px] font-extrabold text-[#09433e]">{{ score.risk_grade }}</span>
                    </div>
                    <div class="bg-[#f8fbfb] p-4 sm:p-5 rounded-2xl border border-[#e8f3f2]/50 flex flex-col items-center sm:items-start">
                      <span class="text-[10px] sm:text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-1">Compliance</span>
                      <span class="text-[20px] sm:text-[24px] font-extrabold text-[#09433e]">{{ Math.round(score.compliance_percentage) }}%</span>
                    </div>
                    <div class="bg-[#f8fbfb] p-4 sm:p-5 rounded-2xl border border-[#e8f3f2]/50 flex flex-col items-center sm:items-start">
                      <span class="text-[10px] sm:text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-1">Red Flags</span>
                      <span class="text-[20px] sm:text-[24px] font-extrabold text-rose-600">{{ score.red_flags_count }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-1">
                <div class="bg-[#09423C] rounded-[24px] p-6 sm:p-8 text-white shadow-xl shadow-[#09423C]/10 relative overflow-hidden flex flex-col justify-between min-h-[250px] sm:min-h-[300px]">
                  <div class="absolute -top-10 -right-10 size-40 bg-white/5 rounded-full blur-3xl"></div>
                  <div class="absolute bottom-0 right-0 size-32 bg-teal-400/20 rounded-full blur-xl"></div>
                  
                  <div class="relative z-10">
                    <div class="size-10 sm:size-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                      <svg class="size-5 sm:size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 class="text-[18px] sm:text-[20px] font-bold mb-2 sm:mb-3">Security Assessment</h3>
                    <p class="text-teal-100/80 text-[13px] sm:text-[14px] mb-6 sm:mb-8 leading-relaxed">
                      Evaluate your organization's controls to improve your security posture and compliance rating.
                    </p>
                  </div>

                  <NuxtLink
                    :to="`/organizations/${organizationId}/assessment`"
                    class="relative z-10 w-full flex items-center justify-center gap-2 bg-white text-[#09423C] py-3 sm:py-3.5 rounded-xl font-extrabold hover:bg-emerald-50 transition-all shadow-sm text-[14px] sm:text-[15px]"
                  >
                    Assessment
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Members Tab -->
            <div v-else-if="activeTab === 'members'" class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[20px] border border-[#e8f3f2] shadow-sm">
                <div>
                  <h3 class="text-[18px] font-extrabold text-[#0e1b1a]">Team Members</h3>
                  <p class="text-[14px] text-[#4f9690]">Manage who has access to this organization.</p>
                </div>
                <button @click="showInviteModal = true" class="bg-[#09423C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
                  <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Invite Member
                </button>
              </div>

              <div class="bg-white rounded-[20px] border border-[#e8f3f2] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse min-w-[800px]">
                    <thead class="bg-[#09423c]/80 text-white uppercase text-[11px] font-extrabold tracking-[1px]">
                      <tr>
                        <th class="px-8 py-5">Member</th>
                        <th class="px-8 py-5">Role</th>
                        <th class="px-8 py-5 text-center">Status</th>
                        <th class="px-8 py-5">Joined</th>
                        <th class="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[#e8f3f2]">
                      <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50/50 transition-colors group">
                        <td class="px-8 py-5">
                          <div class="flex items-center gap-4">
                            <div :class="['size-10 rounded-full flex items-center justify-center text-[13px] font-bold ring-4 ring-white shadow-sm flex-shrink-0', getAvatarColor(member.user_full_name)]">
                              {{ getInitials(member.user_full_name || member.user_email) }}
                            </div>
                            <div class="min-w-0">
                              <p class="text-[14px] font-bold text-[#0e1b1a] truncate">{{ member.user_full_name || 'Unknown User' }}</p>
                              <p class="text-[12px] text-[#4f9690] truncate">{{ member.user_email }}</p>
                            </div>
                          </div>
                        </td>
                        <td class="px-8 py-5">
                          <span v-if="member.role_id && getRoleName(member.role_id)" class="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#E3F5EB] text-[#09423C] border border-[#09423C]/20 uppercase whitespace-nowrap">
                            {{ getRoleName(member.role_id) }}
                          </span>
                          <span v-else class="text-gray-400 text-[13px] italic">No Role</span>
                        </td>
                        <td class="px-8 py-5 text-center">
                          <div class="flex items-center justify-center gap-2">
                            <div :class="['size-2 rounded-full', member.is_active ? 'bg-emerald-500' : 'bg-gray-300']"></div>
                            <span class="text-[13px] font-bold text-[#0e1b1a]">{{ member.is_active ? 'Active' : 'Inactive' }}</span>
                          </div>
                        </td>
                        <td class="px-8 py-5 text-[13px] text-[#4f9690] font-medium whitespace-nowrap">
                          {{ formatDate(member.joined_at) }}
                        </td>
                        <td class="px-8 py-5 text-right">
                          <button 
                            @click="handleRemoveMember(member.id)"
                            class="text-[13px] font-extrabold text-rose-600 hover:underline cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Invitations Tab -->
            <div v-else-if="activeTab === 'invitations'" class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[20px] border border-[#e8f3f2] shadow-sm">
                <div>
                  <h3 class="text-[18px] font-extrabold text-[#0e1b1a]">Pending Invitations</h3>
                  <p class="text-[14px] text-[#4f9690]">Track sent invites and their status.</p>
                </div>
                <button @click="showInviteModal = true" class="bg-[#09423C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
                  <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Invitation
                </button>
              </div>

              <div class="bg-white rounded-[20px] border border-[#e8f3f2] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse min-w-[800px]">
                    <thead class="bg-[#09423c]/80 text-white uppercase text-[11px] font-extrabold tracking-[1px]">
                      <tr>
                        <th class="px-8 py-5">Email Address</th>
                        <th class="px-8 py-5 text-center">Status</th>
                        <th class="px-8 py-5">Sent Date</th>
                        <th class="px-8 py-5">Expires</th>
                        <th class="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[#e8f3f2]">
                      <tr v-if="invitations.length === 0">
                        <td colspan="5" class="px-8 py-16 text-center">
                          <div class="flex flex-col items-center justify-center opacity-40">
                            <svg class="size-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p class="text-[16px] font-bold">No pending invitations</p>
                          </div>
                        </td>
                      </tr>
                      <tr v-for="invitation in invitations" :key="invitation.id" class="hover:bg-gray-50/50 transition-colors group">
                        <td class="px-8 py-5">
                          <div class="flex items-center gap-3">
                            <div class="size-8 bg-gray-50 rounded-lg flex items-center justify-center text-[#4f9690] border border-[#e8f3f2] flex-shrink-0">
                              <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                              </svg>
                            </div>
                            <span class="text-[14px] font-bold text-[#0e1b1a] truncate">{{ invitation.email }}</span>
                          </div>
                        </td>
                        <td class="px-8 py-5 text-center">
                          <span class="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-100 uppercase whitespace-nowrap">Pending</span>
                        </td>
                        <td class="px-8 py-5 text-[13px] text-[#4f9690] font-medium whitespace-nowrap">{{ formatDate(invitation.created_at) }}</td>
                        <td class="px-8 py-5 text-[13px] text-[#4f9690] font-medium whitespace-nowrap">{{ formatDate(invitation.expires_at) }}</td>
                        <td class="px-8 py-5 text-right">
                          <button 
                            @click="handleRevokeInvitation(invitation.id)"
                            class="text-[13px] font-extrabold text-rose-600 hover:underline cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Roles Tab -->
            <div v-else-if="activeTab === 'roles'" class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[20px] border border-[#e8f3f2] shadow-sm">
                <div>
                  <h3 class="text-[18px] font-extrabold text-[#0e1b1a]">Roles & Permissions</h3>
                  <p class="text-[14px] text-[#4f9690]">Define custom access levels for your team.</p>
                </div>
                <button @click="showCreateRoleModal = true" class="bg-[#09423C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
                  <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Role
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="role in roles" :key="role.id" class="group bg-white rounded-[24px] border border-[#e8f3f2] p-6 sm:p-8 hover:shadow-xl hover:shadow-[#09433e]/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-1.5 h-full bg-[#09423C] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div class="flex items-start justify-between mb-6">
                    <div class="size-10 sm:size-12 rounded-2xl bg-[#f8fbfb] border border-[#e8f3f2] flex items-center justify-center text-[#09423C] group-hover:bg-[#09423C] group-hover:text-white transition-colors">
                      <svg class="size-5 sm:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div class="flex items-center gap-2">
                      <button 
                        @click="handleDeleteRole(role.id)"
                        class="size-8 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer"
                        title="Delete Role"
                      >
                        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <span :class="['size-2.5 rounded-full ring-4 ring-white shadow-sm', role.is_active ? 'bg-emerald-500' : 'bg-gray-300']"></span>
                    </div>
                  </div>

                  <h4 class="text-[16px] sm:text-[18px] font-extrabold text-[#0e1b1a] mb-2 truncate">{{ role.name }}</h4>
                  <p class="text-[12px] sm:text-[13px] text-[#4f9690] mb-6 sm:mb-8 min-h-[40px] leading-relaxed opacity-80">{{ role.description || 'No description provided.' }}</p>

                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] sm:text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider">Permissions</span>
                      <span class="text-[10px] sm:text-[11px] font-extrabold text-[#09423C] bg-[#09423C]/5 px-2 py-0.5 rounded-full">{{ role.permissions.length }} Total</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5 sm:gap-2">
                      <span v-for="permission in role.permissions.slice(0, 3)" :key="permission" class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[11px] font-bold bg-gray-50 text-[#4f9690] border border-[#e8f3f2] uppercase tracking-tight">
                        {{ permission }}
                      </span>
                      <span v-if="role.permissions.length > 3" class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[11px] font-bold bg-gray-50 text-gray-400 border border-dashed border-gray-200">
                        +{{ role.permissions.length - 3 }}
                      </span>
                    </div>
                  </div>

                  <div class="mt-6 sm:mt-8 pt-6 border-t border-[#f8fbfb] flex justify-end">
                    <button class="text-[12px] sm:text-[13px] font-extrabold text-[#09433e] hover:underline flex items-center gap-1 cursor-pointer group/btn">
                      Edit Role
                      <svg class="size-3.5 sm:size-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
  </div>
</template>

<style scoped>
/* Custom scrollbar */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-track {
  background: transparent;
}
main::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
main::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>

