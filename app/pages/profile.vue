<script setup lang="ts">
const auth = useAuth()
const router = useRouter()

const isEditing = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Form data
const fullName = ref('')
const avatarUrl = ref('')

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
    month: 'long',
    day: 'numeric',
  })
}

useSeoMeta({
  title: 'Profile - Mokshya OS',
  description: 'View and manage your profile',
})
</script>

<template>
  <div class="min-h-screen bg-[#F8FCF9CC] py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-mokshya-dark mb-2">Profile</h1>
        <p class="text-mokshya-text">Manage your account information</p>
      </div>

      <!-- Success Message -->
      <div
        v-if="success"
        class="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700"
      >
        {{ success }}
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- Profile Card -->
      <div class="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(9,67,62,0.15)] p-8">
        <div v-if="auth.user.value" class="space-y-6">
          <!-- Avatar Section -->
          <div class="flex items-center gap-6 pb-6 border-b border-gray-200">
            <div
              class="flex h-20 w-20 items-center justify-center rounded-full bg-[#09423C] text-2xl font-bold text-white"
            >
              <span v-if="!auth.user.value.avatar_url">
                {{
                  auth.user.value.full_name
                    ? (() => {
                        const parts = auth.user.value.full_name.split(' ')
                        const initials = parts.map(n => n && n.length > 0 ? n[0] : '').filter(Boolean).join('')
                        return initials.toUpperCase().substring(0, 2)
                      })()
                    : (() => {
                        const email = auth.user.value.email
                        return email && email.length > 0 && email[0]
                          ? email[0].toUpperCase()
                          : 'U'
                      })()
                }}
              </span>
              <img
                v-else-if="auth.user.value.avatar_url"
                :src="auth.user.value.avatar_url"
                :alt="auth.user.value.full_name"
                class="h-20 w-20 rounded-full object-cover"
              >
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-mokshya-dark mb-1">
                {{ auth.user.value.full_name || 'User' }}
              </h2>
              <p class="text-mokshya-text">{{ auth.user.value.email }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-semibold',
                    auth.user.value.is_verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  ]"
                >
                  {{ auth.user.value.is_verified ? 'Verified' : 'Unverified' }}
                </span>
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-semibold',
                    auth.user.value.is_active
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ auth.user.value.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            <button
              v-if="!isEditing"
              @click="startEditing"
              class="px-6 py-2 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors cursor-pointer"
            >
              Edit Profile
            </button>
          </div>

          <!-- Profile Information -->
          <div class="space-y-6">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-semibold text-mokshya-dark mb-2">
                Full Name
              </label>
              <input
                v-if="isEditing"
                v-model="fullName"
                type="text"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
                placeholder="Enter your full name"
              >
              <p v-else class="text-mokshya-text">
                {{ auth.user.value.full_name || 'Not set' }}
              </p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-mokshya-dark mb-2">
                Email
              </label>
              <p class="text-mokshya-text">{{ auth.user.value.email }}</p>
              <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <!-- Avatar URL -->
            <div>
              <label class="block text-sm font-semibold text-mokshya-dark mb-2">
                Avatar URL
              </label>
              <input
                v-if="isEditing"
                v-model="avatarUrl"
                type="url"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
                placeholder="https://example.com/avatar.jpg"
              >
              <p v-else class="text-mokshya-text">
                {{ auth.user.value.avatar_url || 'Not set' }}
              </p>
            </div>
 

            <!-- Account Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div>
                <label class="block text-sm font-semibold text-mokshya-dark mb-2">
                  Account Created
                </label>
                <p class="text-mokshya-text">
                  {{ formatDate(auth.user.value.created_at) }}
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-mokshya-dark mb-2">
                  Last Login
                </label>
                <p class="text-mokshya-text">
                  {{ formatDate(auth.user.value.last_login_at) }}
                </p>
              </div>
              
            </div>

            <!-- Edit Actions -->
            <div v-if="isEditing" class="flex gap-4 pt-6 border-t border-gray-200">
              <button
                @click="saveProfile"
                :disabled="isLoading"
                class="px-6 py-2 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Saving...' : 'Save Changes' }}
              </button>
              <button
                @click="cancelEditing"
                :disabled="isLoading"
                class="px-6 py-2 rounded-lg border border-gray-200 bg-white text-mokshya-dark font-semibold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="auth.isLoading.value" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#09433e] border-t-transparent mb-4"></div>
          <p class="text-sm text-[#6b7280]">Loading profile...</p>
        </div>
      </div>
    </div>
  </div>
</template>

