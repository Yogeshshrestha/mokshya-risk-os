<script setup lang="ts">
import { INDUSTRIES, COMPANY_SIZES, OPERATING_REGIONS } from '~/constants/data'

const route = useRoute()
const router = useRouter()
const auth = useAuth()

// Check authentication
onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
  }
})

// View mode state
const viewMode = ref<'form' | 'chat'>('form')

// Form data
const formData = ref({
  companyName: '',
  industry: '',
  companySize: '',
  annualRevenue: '',
  primaryOperatingRegion: ''
})

// Chat state
interface ChatMessage {
  id: string
  type: 'assistant' | 'user'
  content: string
  timestamp: Date
  example?: string
}

const chatMessages = ref<ChatMessage[]>([
  {
    id: '1',
    type: 'assistant',
    content: "Hello! I can help you fast-track your organization profile. Just tell me a bit about your company.",
    timestamp: new Date(),
    example: 'For example: "We are a mid-sized healthcare company in Germany with $10M revenue."'
  }
])

const currentMessage = ref('')
const isSending = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new messages are added
watch(chatMessages, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}, { deep: true })

// Format time for chat messages
const formatChatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Send message handler
const sendMessage = async () => {
  if (!currentMessage.value.trim() || isSending.value) return

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'user',
    content: currentMessage.value.trim(),
    timestamp: new Date()
  }

  chatMessages.value.push(userMessage)
  const messageText = currentMessage.value.trim()
  currentMessage.value = ''
  isSending.value = true

  // Simulate AI processing and response
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Parse user message to extract details (simplified - in real app, this would use AI)
  const assistantResponse: ChatMessage = {
    id: (Date.now() + 1).toString(),
    type: 'assistant',
    content: "Thanks! I've detected the following details from your input:",
    timestamp: new Date()
  }

  // Simple parsing logic (replace with actual AI integration)
  const detectedFields: string[] = []
  if (messageText.toLowerCase().includes('fintech') || messageText.toLowerCase().includes('finance')) {
    detectedFields.push('Industry: Finance/Technology')
  }
  if (messageText.match(/\d+\s*(employees|staff)/i)) {
    const match = messageText.match(/(\d+)\s*(employees|staff)/i)
    if (match) detectedFields.push(`Company Size: ${match[1]} employees`)
  }
  if (messageText.match(/\$[\d.]+[BMK]?/i)) {
    const match = messageText.match(/\$([\d.]+[BMK]?)/i)
    if (match) detectedFields.push(`Annual Revenue: $${match[1]}`)
  }
  if (messageText.match(/(new york|ny|united states|usa|germany|uk|london)/i)) {
    const match = messageText.match(/(new york|ny|united states|usa|germany|uk|london|north america|europe|asia)/i)
    if (match) detectedFields.push(`Region: ${match[1]}`)
  }

  if (detectedFields.length > 0) {
    assistantResponse.content += '\n\n' + detectedFields.join('\n')
    assistantResponse.content += '\n\nWould you like me to fill these in the form, or would you like to provide more details?'
  } else {
    assistantResponse.content += '\n\nI\'m having trouble parsing the details. Could you please provide more specific information about your company name, industry, size, revenue, and location?'
  }

  chatMessages.value.push(assistantResponse)
  isSending.value = false

  // Auto-scroll after response
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// Handle enter key to send
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Auto-save functionality
const lastSaved = ref<Date | null>(null)
const isSaving = ref(false)

// Auto-save when form data changes (debounced)
let saveTimeout: ReturnType<typeof setTimeout> | null = null
watch(formData, () => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    autoSave()
  }, 2000)
}, { deep: true })

const autoSave = async () => {
  isSaving.value = true
  // Simulate API call - replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 500))
  lastSaved.value = new Date()
  isSaving.value = false
}

// Format time for display
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

const lastSavedText = computed(() => {
  if (!lastSaved.value) return null
  return `Auto-saved at ${formatTime(lastSaved.value)}`
})

// Progress calculation (mock - replace with actual)
const progressPercentage = computed(() => {
  const fields = ['companyName', 'industry', 'companySize', 'annualRevenue', 'primaryOperatingRegion']
  const filled = fields.filter(field => {
    const value = formData.value[field as keyof typeof formData.value]
    return value && value.toString().trim() !== ''
  }).length
  return Math.round((filled / fields.length) * 100)
})

const remainingFields = computed(() => {
  const fields = ['companyName', 'industry', 'companySize', 'annualRevenue', 'primaryOperatingRegion']
  const filled = fields.filter(field => {
    const value = formData.value[field as keyof typeof formData.value]
    return value && value.toString().trim() !== ''
  }).length
  return fields.length - filled
})

// Handle next step
const handleNextStep = () => {
  // Navigate to next assessment step
  router.push('/assessment/next-step') // Update with actual route
}

useSeoMeta({
  title: 'Organization Profile - Assessment | Mokshya OS',
  description: 'Provide basic details about your organization to calibrate the risk model'
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <UContainer class="py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6">
        <ol class="flex items-center gap-2 text-sm text-mokshya-text">
          <li>
            <NuxtLink to="/assessment" class="hover:text-mokshya-dark transition-colors">
              Assessment
            </NuxtLink>
          </li>
          <li class="text-gray-400">/</li>
          <li class="font-medium text-mokshya-dark">Organization Profile</li>
        </ol>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-3xl font-bold text-mokshya-dark mb-2">
                  Organization Profile
                </h1>
                <p class="text-base text-mokshya-text">
                  Please provide basic details about your organization to calibrate the risk model.
                </p>
              </div>
              
              <!-- View Toggle -->
              <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                <button
                  @click="viewMode = 'form'"
                  :class="[
                    'px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2',
                    viewMode === 'form'
                      ? 'bg-[#09423C] text-white'
                      : 'text-mokshya-text hover:bg-gray-100'
                  ]"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Form View
                </button>
                <button
                  @click="viewMode = 'chat'"
                  :class="[
                    'px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2',
                    viewMode === 'chat'
                      ? 'bg-[#09423C] text-white'
                      : 'text-mokshya-text hover:bg-gray-100'
                  ]"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Chat View
                </button>
              </div>
            </div>
          </div>

          <!-- Form View -->
          <div v-if="viewMode === 'form'" class="space-y-6">
            <!-- Company Name -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-mokshya-dark">
                Company Name
              </label>
              <input
                v-model="formData.companyName"
                type="text"
                placeholder="e.g ABCD Pvt.Ltd"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
              >
            </div>

            <!-- Industry / Sector -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <label class="block text-sm font-semibold text-mokshya-dark">
                  Industry / Sector
                </label>
                <button
                  type="button"
                  class="flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors group relative"
                  aria-label="Information about Industry / Sector"
                >
                  <svg
                    class="w-3 h-3 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div class="relative">
                <select
                  v-model="formData.industry"
                  class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select primary industry</option>
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
              <p class="text-xs text-gray-600">
                Choose the category that best describes your primary revenue source.
              </p>
            </div>

            <!-- Company Size -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <label class="block text-sm font-semibold text-mokshya-dark">
                  Company Size
                </label>
                <button
                  type="button"
                  class="flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  aria-label="Information about Company Size"
                >
                  <svg
                    class="w-3 h-3 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div class="relative">
                <select
                  v-model="formData.companySize"
                  class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select range</option>
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
                  v-model="formData.annualRevenue"
                  type="text"
                  placeholder="e.g. 5,000,000"
                  class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
                >
              </div>
            </div>

            <!-- Primary Operating Region -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <label class="block text-sm font-semibold text-mokshya-dark">
                  Primary Operating Region
                </label>
                <button
                  type="button"
                  class="flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  aria-label="Information about Primary Operating Region"
                >
                  <svg
                    class="w-3 h-3 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div class="relative">
                <select
                  v-model="formData.primaryOperatingRegion"
                  class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select headquarters location</option>
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

            <!-- Footer Actions -->
            <div class="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  v-if="lastSavedText"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span v-if="lastSavedText">{{ lastSavedText }}</span>
                <span v-else-if="isSaving" class="text-gray-400">Saving...</span>
              </div>
              
              <button
                @click="handleNextStep"
                class="px-6 py-3 rounded-lg bg-[#09423C] text-white font-semibold hover:bg-[#07332e] transition-colors flex items-center gap-2 cursor-pointer"
              >
                Next Step
                <svg
                  class="w-4 h-4"
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
              </button>
            </div>
          </div>

          <!-- Chat View -->
          <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col" style="height: calc(100vh - 300px); min-height: 600px;">
            <!-- Chat Header -->
            <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
              <div class="flex-shrink-0 w-10 h-10 bg-[#09423C] rounded-lg flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-mokshya-dark">
                  Mokshya AI Assistant
                </h3>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-green-600">Online</span>
                </div>
              </div>
            </div>

            <!-- Chat Messages Area -->
            <div
              ref="chatContainer"
              class="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50"
            >
              <div
                v-for="message in chatMessages"
                :key="message.id"
                :class="[
                  'flex gap-3',
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                ]"
              >
                <!-- Avatar/Icon -->
                <div
                  v-if="message.type === 'assistant'"
                  class="flex-shrink-0 w-8 h-8 bg-[#09423C] rounded-lg flex items-center justify-center"
                >
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div
                  v-else
                  class="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                <!-- Message Bubble -->
                <div class="flex-1 min-w-0 max-w-[70%]">
                  <div
                    :class="[
                      'rounded-lg px-4 py-3',
                      message.type === 'assistant'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-[#09423C] text-white'
                    ]"
                  >
                    <p
                      :class="[
                        'text-sm whitespace-pre-wrap break-words',
                        message.type === 'assistant' ? 'text-gray-900' : 'text-white'
                      ]"
                    >
                      {{ message.content }}
                    </p>
                    <p
                      v-if="message.example"
                      class="text-xs mt-2 pl-4 text-gray-600 italic border-l-2 border-gray-400"
                    >
                      {{ message.example }}
                    </p>
                  </div>
                  <p
                    :class="[
                      'text-xs mt-1.5',
                      message.type === 'assistant' ? 'text-gray-500' : 'text-gray-500 text-right'
                    ]"
                  >
                    {{ formatChatTime(message.timestamp) }}
                  </p>
                </div>
              </div>

              <!-- Loading indicator -->
              <div v-if="isSending" class="flex gap-3">
                <div class="flex-shrink-0 w-8 h-8 bg-[#09423C] rounded-lg flex items-center justify-center">
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="bg-gray-200 rounded-lg px-4 py-3 inline-block">
                    <div class="flex gap-1">
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input Area -->
            <div class="px-6 py-4 border-t border-gray-200 bg-white">
              <div class="flex items-center gap-3">
                <!-- Plus Button -->
                <button
                  type="button"
                  class="flex-shrink-0 w-10 h-10 bg-[#09423C] rounded-full flex items-center justify-center text-white hover:bg-[#07332e] transition-colors cursor-pointer"
                  aria-label="Attach file"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                <!-- Input Field -->
                <input
                  v-model="currentMessage"
                  @keypress="handleKeyPress"
                  type="text"
                  placeholder="Type a message to Mokshya AI..."
                  :disabled="isSending"
                  class="flex-1 h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70 disabled:opacity-50 disabled:cursor-not-allowed"
                >

                <!-- Send Button -->
                <button
                  @click="sendMessage"
                  :disabled="!currentMessage.trim() || isSending"
                  class="flex-shrink-0 w-12 h-12 bg-[#09423C] rounded-lg flex items-center justify-center text-white hover:bg-[#07332e] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>

              <!-- Disclaimer Footer -->
              <div class="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <svg
                  class="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>AI can make mistakes. Please review generated profiles before saving.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Assessment Progress -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-mokshya-dark mb-4">
              Assessment Progress
            </h3>
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl font-bold text-mokshya-dark">
                    {{ progressPercentage }}%
                  </span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-[#09423C] transition-all duration-500 rounded-full"
                    :style="{ width: `${progressPercentage}%` }"
                  ></div>
                </div>
              </div>
              <div class="flex items-center gap-6 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Est. time: 15 mins</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4"
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
                  <span>{{ remainingFields }} fields remaining</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Why this matters? -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center gap-2 mb-3">
              <svg
                class="w-5 h-5 text-[#09423C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h3 class="text-lg font-semibold text-mokshya-dark">
                Why this matters?
              </h3>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed">
              Industry and size are the primary coefficients for our base risk model. Accuracy here ensures better insurance quotes later.
            </p>
          </div>

          <!-- Need help -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center gap-2 mb-3">
              <svg
                class="w-5 h-5 text-[#09423C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <h3 class="text-lg font-semibold text-mokshya-dark">
                Need help defining your scope?
              </h3>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              Our specialists can help you determine the correct entity boundaries.
            </p>
            <button
              class="text-sm font-semibold text-[#09423C] hover:underline transition-colors cursor-pointer"
            >
              Chat with support
            </button>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

