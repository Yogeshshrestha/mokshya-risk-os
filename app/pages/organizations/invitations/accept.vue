<script setup lang="ts">
import type { OrganizationInvitationResponse } from '~/types/organization'

const route = useRoute()
const router = useRouter()
const organization = useOrganization()
const auth = useAuth()

const token = route.query.token as string

// State
const isLoading = ref(false)
const isAccepting = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const invitation = ref<OrganizationInvitationResponse | null>(null)

// Check authentication
onMounted(async () => {
  if (!token) {
    error.value = 'Invalid invitation token'
    return
  }

  if (!auth.isAuthenticated.value) {
    // Redirect to login with return URL
    router.push(`/?redirect=/organizations/invitations/accept?token=${token}`)
    return
  }

  await acceptInvitation()
})

const acceptInvitation = async () => {
  if (!token) {
    error.value = 'Invalid invitation token'
    return
  }

  isAccepting.value = true
  error.value = null

  try {
    invitation.value = await organization.acceptInvitation({ token })
    success.value = true
    
    // Redirect to organization page after 2 seconds
    setTimeout(() => {
      if (invitation.value?.organization_id) {
        router.push(`/organizations/${invitation.value.organization_id}`)
      } else {
        router.push('/organizations')
      }
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to accept invitation'
  } finally {
    isAccepting.value = false
  }
}

useSeoMeta({
  title: 'Accept Invitation | Mokshya OS',
  description: 'Accept organization invitation'
})
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center">
    <UContainer class="py-12">
      <div class="max-w-md w-full mx-auto">
        <div class="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
          <!-- Loading State -->
          <div v-if="isAccepting && !success" class="text-center">
            <div class="w-16 h-16 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 class="text-xl font-semibold text-mokshya-dark mb-2">
              Accepting Invitation
            </h2>
            <p class="text-sm text-mokshya-text">
              Please wait while we process your invitation...
            </p>
          </div>

          <!-- Success State -->
          <div v-else-if="success" class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-mokshya-dark mb-2">
              Invitation Accepted!
            </h2>
            <p class="text-sm text-mokshya-text mb-6">
              You have successfully joined the organization.
            </p>
            <p class="text-xs text-gray-500">
              Redirecting to organization page...
            </p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-mokshya-dark mb-2">
              Unable to Accept Invitation
            </h2>
            <p class="text-sm text-mokshya-text mb-6">
              {{ error }}
            </p>
            <div class="flex flex-col gap-3">
              <button
                v-if="token"
                @click="acceptInvitation"
                class="px-6 py-3 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <NuxtLink
                to="/organizations"
                class="px-6 py-3 rounded-lg border border-gray-300 text-mokshya-text font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Go to Organizations
              </NuxtLink>
            </div>
          </div>

          <!-- Initial State (if no token) -->
          <div v-else class="text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-gray-400"
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
            <h2 class="text-xl font-semibold text-mokshya-dark mb-2">
              Invalid Invitation
            </h2>
            <p class="text-sm text-mokshya-text mb-6">
              This invitation link is invalid or has expired.
            </p>
            <NuxtLink
              to="/organizations"
              class="inline-block px-6 py-3 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors"
            >
              Go to Organizations
            </NuxtLink>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

