<script setup lang="ts">
import type { RoleCreate } from '~/types/organization'

interface Props {
  modelValue: boolean
  organizationId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: []
}>()

const organization = useOrganization()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isLoading = ref(false)
const error = ref<string | null>(null)

const formData = ref<RoleCreate>({
  name: '',
  description: '',
  permissions: [],
  organization_id: props.organizationId
})

// Common permissions list (you can customize this)
const availablePermissions = [
  'read:organization',
  'write:organization',
  'delete:organization',
  'read:members',
  'write:members',
  'delete:members',
  'read:invitations',
  'write:invitations',
  'read:roles',
  'write:roles',
  'delete:roles',
  'read:assessments',
  'write:assessments',
  'read:dashboard',
  'read:reports'
]

const togglePermission = (permission: string) => {
  const index = formData.value.permissions?.indexOf(permission) ?? -1
  if (index > -1) {
    formData.value.permissions = formData.value.permissions?.filter(p => p !== permission) || []
  } else {
    formData.value.permissions = [...(formData.value.permissions || []), permission]
  }
}

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    error.value = 'Role name is required'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const payload: RoleCreate = {
      name: formData.value.name.trim(),
      organization_id: props.organizationId
    }

    if (formData.value.description?.trim()) {
      payload.description = formData.value.description.trim()
    }
    if (formData.value.permissions && formData.value.permissions.length > 0) {
      payload.permissions = formData.value.permissions
    }

    await organization.createRole(props.organizationId, payload)
    emit('created')
    isOpen.value = false
    
    // Reset form
    formData.value = {
      name: '',
      description: '',
      permissions: [],
      organization_id: props.organizationId
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to create role'
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  if (!isLoading.value) {
    isOpen.value = false
    error.value = null
    formData.value = {
      name: '',
      description: '',
      permissions: [],
      organization_id: props.organizationId
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
            class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-mokshya-dark">
                Create Role
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

              <!-- Role Name -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-mokshya-dark">
                  Role Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  placeholder="e.g. Administrator, Member, Viewer"
                  required
                  :disabled="isLoading"
                  class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 disabled:opacity-50"
                >
              </div>

              <!-- Description -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-mokshya-dark">
                  Description
                </label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  placeholder="Brief description of this role's purpose"
                  :disabled="isLoading"
                  class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09423C]/70 focus:border-[#09423C]/70 disabled:opacity-50 resize-none"
                ></textarea>
              </div>

              <!-- Permissions -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-mokshya-dark">
                  Permissions
                </label>
                <div class="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label
                      v-for="permission in availablePermissions"
                      :key="permission"
                      class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        :checked="formData.permissions?.includes(permission)"
                        @change="togglePermission(permission)"
                        :disabled="isLoading"
                        class="w-4 h-4 text-[#09423C] border-gray-300 rounded focus:ring-[#09423C] focus:ring-2"
                      >
                      <span class="text-sm text-mokshya-text flex-1">
                        {{ permission }}
                      </span>
                    </label>
                  </div>
                </div>
                <p class="text-xs text-gray-500">
                  Select the permissions this role should have
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
                  :disabled="isLoading || !formData.name.trim()"
                  class="px-6 py-2.5 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span v-if="isLoading">Creating...</span>
                  <span v-else>Create Role</span>
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

