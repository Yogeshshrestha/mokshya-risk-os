<script setup lang="ts">
import { computed } from 'vue'

const auth = useAuth()
const router = useRouter()

const isEditing = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Form data
const fullName = ref('')
const avatarUrl = ref('')

// Computed property for initials (Cleaner template)
const userInitials = computed(() => {
  const user = auth.user.value
  if (!user) return 'U'
  
  if (!user.avatar_url && user.full_name) {
    const parts = user.full_name.split(' ')
    const initials = parts.map(n => n && n.length > 0 ? n[0] : '').filter(Boolean).join('')
    return initials.toUpperCase().substring(0, 2)
  }
  
  if (!user.avatar_url && user.email) {
    return user.email[0].toUpperCase()
  }
  
  return ''
})

// Load user data
onMounted(async () => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }

  try {
    await auth.fetchUser()
    if (auth.user.value) {
      fullName.value = auth.user.value.full_name || ''
      avatarUrl.value = auth.user.value.avatar_url || ''
    }
  } catch (err) {
    error.value = 'Failed to load profile data'
  }
})

const startEditing = () => {
  isEditing.value = true
  error.value = null
  success.value = null
}

const cancelEditing = () => {
  isEditing.value = false
  if (auth.user.value) {
    fullName.value = auth.user.value.full_name || ''
    avatarUrl.value = auth.user.value.avatar_url || ''
  }
  error.value = null
  success.value = null
}

const saveProfile = async () => {
  isLoading.value = true
  error.value = null
  success.value = null

  try {
    await auth.updateUser({
      full_name: fullName.value,
      avatar_url: avatarUrl.value || undefined,
    })
    
    success.value = 'Profile updated successfully!'
    isEditing.value = false
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = null
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

useSeoMeta({
  title: 'Profile - Mokshya OS',
  description: 'View and manage your profile',
})
</script>

<template>
  <div class="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      
      <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-[#09423C] tracking-tight">Account Settings</h1>
          <p class="text-gray-500 mt-1">Manage your personal information and account security.</p>
        </div>
        
        <div v-if="auth.user.value && !isEditing" class="flex gap-3">
           <button
            @click="startEditing"
            class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#09423C] text-white font-medium hover:bg-[#07332e] hover:shadow-lg hover:shadow-[#09423C]/20 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="success" class="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center shadow-sm">
          <svg class="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          {{ success }}
        </div>
      </Transition>

      <Transition
         enter-active-class="transition ease-out duration-300"
         enter-from-class="transform opacity-0 -translate-y-2"
         enter-to-class="transform opacity-100 translate-y-0"
      >
        <div v-if="error" class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center shadow-sm">
          <svg class="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          {{ error }}
        </div>
      </Transition>

      <div v-if="auth.user.value" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
            <div class="h-32 bg-[#09423C] relative overflow-hidden">
              <div class="absolute inset-0 bg-white/10 opacity-30" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px;"></div>
            </div>
            
            <div class="px-6 pb-6 text-center relative">
              <div class="relative -mt-16 mb-4 inline-block">
                 <div class="h-32 w-32 rounded-full ring-4 ring-white bg-white shadow-lg overflow-hidden flex items-center justify-center mx-auto">
                    <img
                      v-if="auth.user.value.avatar_url"
                      :src="auth.user.value.avatar_url"
                      :alt="auth.user.value.full_name"
                      class="h-full w-full object-cover"
                    >
                    <div v-else class="h-full w-full bg-[#09423C] flex items-center justify-center text-4xl font-bold text-white">
                      {{ userInitials }}
                    </div>
                 </div>
                 <div v-if="auth.user.value.is_active" class="absolute bottom-2 right-2 h-5 w-5 bg-green-500 border-4 border-white rounded-full" title="Active"></div>
              </div>
              
              <h2 class="text-xl font-bold text-gray-900 mb-1">{{ auth.user.value.full_name || 'User' }}</h2>
              <p class="text-sm text-gray-500 mb-4">{{ auth.user.value.email }}</p>
              
              <div class="flex flex-wrap justify-center gap-2 mb-6">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium border',
                    auth.user.value.is_verified
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-orange-50 text-orange-700 border-orange-200'
                  ]"
                >
                  {{ auth.user.value.is_verified ? 'Verified Account' : 'Unverified' }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <div class="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Joined</div>
              <div class="text-sm font-medium text-gray-900">{{ formatDate(auth.user.value.created_at) }}</div>
            </div>
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <div class="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Last Login</div>
              <div class="text-sm font-medium text-gray-900">{{ formatDate(auth.user.value.last_login_at) }}</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
              <span v-if="isEditing" class="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">Editing Mode</span>
            </div>
            
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div class="relative">
                    <input
                      v-if="isEditing"
                      v-model="fullName"
                      type="text"
                      class="w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-[#09423C] focus:ring-[#09423C] py-2.5 px-3 transition-colors"
                      placeholder="Enter your full name"
                    >
                    <div v-else class="py-2.5 text-gray-900 font-medium">{{ auth.user.value.full_name || 'Not set' }}</div>
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                    <span class="text-xs font-normal text-gray-400 ml-1">(Cannot be changed)</span>
                  </label>
                  <div class="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-500 cursor-not-allowed">
                     <svg class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     {{ auth.user.value.email }}
                  </div>
                </div>
              </div>

              <div v-if="isEditing" class="pt-6 mt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  @click="cancelEditing"
                  :disabled="isLoading"
                  class="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  @click="saveProfile"
                  :disabled="isLoading"
                  class="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#09423C] text-white font-medium hover:bg-[#07332e] hover:shadow-lg hover:shadow-[#09423C]/20 transition-all disabled:opacity-70 disabled:cursor-wait"
                >
                  <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ isLoading ? 'Saving Changes...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="auth.isLoading.value" class="min-h-[60vh] flex flex-col items-center justify-center">
        <div class="relative">
          <div class="h-16 w-16 rounded-full border-4 border-gray-200"></div>
          <div class="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-[#09423C] border-t-transparent animate-spin"></div>
        </div>
        <p class="mt-4 text-gray-500 font-medium">Loading your profile...</p>
      </div>
      
    </div>
  </div>
</template>