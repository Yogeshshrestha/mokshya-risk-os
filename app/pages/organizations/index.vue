<script setup lang="ts">
import type { OrganizationResponse } from '~/types/organization'

const router = useRouter()
const organization = useOrganization()
const auth = useAuth()

// Check authentication
onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
  }
})

// State
const organizations = ref<OrganizationResponse[]>([])
const isLoading = ref(true)
const showCreateForm = ref(false)

// Fetch organizations
const fetchOrganizations = async () => {
  try {
    isLoading.value = true
    organizations.value = await organization.listOrganizations()
    // Auto-show form if no organizations exist
    if (organizations.value.length === 0) {
      showCreateForm.value = true
    }
  } catch (error) {
    console.error('Failed to fetch organizations:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchOrganizations()
})

// Handle organization created
const handleOrganizationCreated = () => {
  showCreateForm.value = false
  fetchOrganizations()
}

// Handle form close
const handleFormClose = () => {
  // Only allow closing if there are organizations
  if (organizations.value.length > 0) {
    showCreateForm.value = false
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

useSeoMeta({
  title: 'Organizations | Mokshya OS',
  description: 'Manage your organizations'
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <UContainer class="max-w-[1600px] px-4 lg:px-6 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-mokshya-dark mb-2">
            Organizations
          </h1>
          <p class="text-base text-mokshya-text">
            Manage your organizations and teams
          </p>
        </div>
        <button
          v-if="organizations.length > 0"
          @click="showCreateForm = !showCreateForm"
          class="px-6 py-3 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg
            v-if="!showCreateForm"
            class="w-5 h-5"
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
          <svg
            v-else
            class="w-5 h-5"
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
          {{ showCreateForm ? 'Cancel' : 'Create Organization' }}
        </button>
      </div>

      <!-- Create Organization Form - Inline -->
      <CreateOrganizationForm
        :is-open="showCreateForm || organizations.length === 0"
        :has-organizations="organizations.length > 0"
        @created="handleOrganizationCreated"
        @close="handleFormClose"
      />

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-mokshya-text">Loading organizations...</p>
        </div>
      </div>

      <!-- Organizations Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="org in organizations"
          :key="org.id"
          @click="router.push(`/organizations/${org.id}`)"
          class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-[#09423C]/30 transition-all cursor-pointer group"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-mokshya-dark mb-1 truncate group-hover:text-[#09423C] transition-colors">
                {{ org.name }}
              </h3>
              <p
                v-if="org.description"
                class="text-sm text-mokshya-text line-clamp-2"
              >
                {{ org.description }}
              </p>
            </div>
            <div v-if="org.is_active" class="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <span class="text-sm font-medium text-green-700">Active</span>
            </div>
            <div v-else-if="org.is_active === false" class="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <span class="text-sm font-medium text-red-700">Inactive</span>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <div v-if="org.industry" class="flex items-center gap-2 text-sm text-mokshya-text">
              <svg
                class="w-4 h-4 text-gray-400"
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
              <span>{{ org.industry }}</span>
            </div>
            <div v-if="org.company_size" class="flex items-center gap-2 text-sm text-mokshya-text">
              <svg
                class="w-4 h-4 text-gray-400"
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
              <span>{{ org.company_size }}</span>
            </div>
            <div v-if="org.primary_operating_region" class="flex items-center gap-2 text-sm text-mokshya-text">
              <svg
                class="w-4 h-4 text-gray-400"
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
              <span>{{ org.primary_operating_region }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <span class="text-xs text-gray-500">
              Created {{ formatDate(org.created_at) }}
            </span>
            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-[#09423C] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

