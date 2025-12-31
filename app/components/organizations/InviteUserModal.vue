<script setup lang="ts">
import type { OrganizationInvitationCreate, RoleResponse } from '~/types/organization'

interface Props {
  modelValue: boolean
  organizationId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  invited: []
}>()

const organization = useOrganization()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isLoading = ref(false)
const error = ref<string | null>(null)
const roles = ref<RoleResponse[]>([])

const formData = ref<OrganizationInvitationCreate>({
  email: '',
  role_id: ''
})

// Fetch roles
const fetchRoles = async () => {
  try {
    roles.value = await organization.listRoles(props.organizationId)
  } catch (error) {
    console.error('Failed to fetch roles:', error)
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    fetchRoles()
  }
})

const handleSubmit = async () => {
  if (!formData.value.email.trim()) {
    error.value = 'Email is required'
    return
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    error.value = 'Please enter a valid email address'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const payload: OrganizationInvitationCreate = {
      email: formData.value.email.trim(),
    }

    if (formData.value.role_id) {
      payload.role_id = formData.value.role_id
    }

    await organization.inviteUser(props.organizationId, payload)
    emit('invited')
    isOpen.value = false
    
    // Reset form
    formData.value = {
      email: '',
      role_id: ''
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to send invitation'
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  if (!isLoading.value) {
    isOpen.value = false
    error.value = null
    formData.value = {
      email: '',
      role_id: ''
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="handleClose"
      >
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="bg-white rounded-lg shadow-xl max-w-md w-full"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-mokshya-dark">
                Invite User
              </h2>
              <button
                @click="handleClose"
                :disabled="isLoading"
                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
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

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
              <!-- Error Message -->
              <div
                v-if="error"
                class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
              >
                {{ error }}
              </div>

              <!-- Email -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-mokshya-dark">
                  Email Address <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="user@example.com"
                  required
                  :disabled="isLoading"
                  class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 disabled:opacity-50"
                >
              </div>

              <!-- Role -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-mokshya-dark">
                  Role (Optional)
                </label>
                <div class="relative">
                  <select
                    v-model="formData.role_id"
                    :disabled="isLoading"
                    class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">No role assigned</option>
                    <option
                      v-for="role in roles"
                      :key="role.id"
                      :value="role.id"
                    >
                      {{ role.name }}
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
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
                <p class="text-xs text-gray-500">
                  Assign a role to grant specific permissions
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  @click="handleClose"
                  :disabled="isLoading"
                  class="px-6 py-2.5 rounded-lg border border-gray-300 text-mokshya-text font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isLoading || !formData.email.trim()"
                  class="px-6 py-2.5 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span v-if="isLoading">Sending...</span>
                  <span v-else>Send Invitation</span>
                  <div
                    v-if="isLoading"
                    class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  ></div>
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

