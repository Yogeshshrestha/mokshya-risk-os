<script setup lang="ts">
import { INDUSTRIES, COMPANY_SIZES, OPERATING_REGIONS } from '~/constants/data'
import type { OrganizationCreate } from '~/types/organization'

interface Props {
  isOpen: boolean
  hasOrganizations?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasOrganizations: true
})

const emit = defineEmits<{
  created: []
  close: []
}>()

const organization = useOrganization()

const isLoading = ref(false)
const error = ref<string | null>(null)

const formData = ref<OrganizationCreate>({
  name: '',
  description: '',
  industry: '',
  company_size: '',
  annual_revenue_usd: undefined,
  primary_operating_region: '',
  slug: ''
})

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    error.value = 'Organization name is required'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // Clean up form data - remove empty strings
    const payload: OrganizationCreate = {
      name: formData.value.name.trim(),
    }

    if (formData.value.description?.trim()) {
      payload.description = formData.value.description.trim()
    }
    if (formData.value.industry) {
      payload.industry = formData.value.industry
    }
    if (formData.value.company_size) {
      payload.company_size = formData.value.company_size
    }
    if (formData.value.annual_revenue_usd) {
      payload.annual_revenue_usd = parseFloat(formData.value.annual_revenue_usd.toString())
    }
    if (formData.value.primary_operating_region) {
      payload.primary_operating_region = formData.value.primary_operating_region
    }
    if (formData.value.slug?.trim()) {
      payload.slug = formData.value.slug.trim()
    }

    await organization.createOrganization(payload)
    emit('created')
    
    // Reset form
    formData.value = {
      name: '',
      description: '',
      industry: '',
      company_size: '',
      annual_revenue_usd: undefined,
      primary_operating_region: '',
      slug: ''
    }
    error.value = null
  } catch (err: any) {
    error.value = err.message || 'Failed to create organization'
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  if (!isLoading.value && props.hasOrganizations) {
    formData.value = {
      name: '',
      description: '',
      industry: '',
      company_size: '',
      annual_revenue_usd: undefined,
      primary_operating_region: '',
      slug: ''
    }
    error.value = null
    emit('close')
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 -translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <div
      v-if="isOpen"
      class="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[#09423C] flex items-center justify-center">
              <svg
                class="w-5 h-5 text-white"
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
            </div>
            <div>
              <h3 class="text-lg font-semibold text-mokshya-dark">
                Create New Organization
              </h3>
              <p class="text-sm text-gray-500">
                Fill in the details below to create your organization
              </p>
            </div>
          </div>
          <button
            v-if="hasOrganizations"
            @click="handleCancel"
            :disabled="isLoading"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg
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
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6">
        <!-- Error Message -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="error"
            class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-sm text-red-700"
          >
            {{ error }}
          </div>
        </Transition>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Organization Name - Full Width -->
          <div class="md:col-span-2 space-y-2">
            <label class="block text-sm font-semibold text-mokshya-dark">
              Organization Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="e.g. Acme Corporation"
              required
              :disabled="isLoading"
              class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 disabled:opacity-50 transition-all"
            >
          </div>

          <!-- Description - Full Width -->
          <div class="md:col-span-2 space-y-2">
            <label class="block text-sm font-semibold text-mokshya-dark">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Brief description of your organization"
              :disabled="isLoading"
              class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 disabled:opacity-50 resize-none transition-all"
            ></textarea>
          </div>

          <!-- Industry -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-mokshya-dark">
              Industry / Sector
            </label>
            <div class="relative">
              <select
                v-model="formData.industry"
                :disabled="isLoading"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 appearance-none cursor-pointer disabled:opacity-50 transition-all"
              >
                <option value="">Select industry</option>
                <option
                  v-for="industry in INDUSTRIES"
                  :key="industry.value"
                  :value="industry.value"
                >
                  {{ industry.label }}
                </option>
              </select>
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
              <svg
                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <!-- Company Size -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-mokshya-dark">
              Company Size
            </label>
            <div class="relative">
              <select
                v-model="formData.company_size"
                :disabled="isLoading"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 appearance-none cursor-pointer disabled:opacity-50 transition-all"
              >
                <option value="">Select company size</option>
                <option
                  v-for="size in COMPANY_SIZES"
                  :key="size.value"
                  :value="size.value"
                >
                  {{ size.label }}
                </option>
              </select>
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
              <svg
                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <!-- Annual Revenue -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-mokshya-dark">
              Annual Revenue (USD)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-medium">
                $
              </span>
              <input
                v-model="formData.annual_revenue_usd"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 5000000"
                :disabled="isLoading"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 disabled:opacity-50 transition-all"
              >
            </div>
          </div>

          <!-- Primary Operating Region -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-mokshya-dark">
              Primary Operating Region
            </label>
            <div class="relative">
              <select
                v-model="formData.primary_operating_region"
                :disabled="isLoading"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 appearance-none cursor-pointer disabled:opacity-50 transition-all"
              >
                <option value="">Select region</option>
                <option
                  v-for="region in OPERATING_REGIONS"
                  :key="region.value"
                  :value="region.value"
                >
                  {{ region.label }}
                </option>
              </select>
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
              <svg
                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <!-- Slug (optional) - Full Width -->
          <div class="md:col-span-2 space-y-2">
            <label class="block text-sm font-semibold text-mokshya-dark">
              Slug (optional)
            </label>
            <input
              v-model="formData.slug"
              type="text"
              placeholder="auto-generated if not provided"
              :disabled="isLoading"
              class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 disabled:opacity-50 transition-all"
            >
            <p class="text-xs text-gray-500">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            v-if="hasOrganizations"
            type="button"
            @click="handleCancel"
            :disabled="isLoading"
            class="px-6 py-2.5 rounded-lg border border-gray-300 text-mokshya-text font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading || !formData.name.trim()"
            class="px-6 py-2.5 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="isLoading">Creating...</span>
            <span v-else>Create Organization</span>
            <div
              v-if="isLoading"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
          </button>
        </div>
      </form>
    </div>
  </Transition>
</template>

