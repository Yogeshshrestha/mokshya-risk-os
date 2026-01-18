<script setup lang="ts">
import type {
  GlobalQuestionResponse,
  GlobalQuestionAnswerResponse,
  EvidenceFileMetadata,
  EvidenceUpdateData,
} from '~/types/global-questionnaire'

interface Props {
  question: GlobalQuestionResponse
  answer?: GlobalQuestionAnswerResponse
  isSaving?: boolean
  organizationId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  answerSubmitted: [questionId: string, answerValue: string, answerText?: string]
}>()

const questionnaire = useGlobalQuestionnaire()

const currentAnswer = ref<string | null>(
  props.answer?.answer_value ?? null
)
const answerText = ref<string>(props.answer?.answer_text || '')
const showNotes = ref(false)
const showEvidence = ref(false)
const isUploadingEvidence = ref(false)
const evidenceFiles = ref<EvidenceFileMetadata[]>([])
const evidenceUrls = ref<string[]>([])
const evidenceNotes = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// Check if question is completed
const isCompleted = computed(() => {
  return currentAnswer.value !== null && currentAnswer.value !== undefined
})

// Watch for answer changes
watch(() => props.answer, (newAnswer) => {
  if (newAnswer) {
    currentAnswer.value = newAnswer.answer_value
    answerText.value = newAnswer.answer_text || ''
    // Load evidence data if available
    if (newAnswer.evidence) {
      const evidence = newAnswer.evidence
      evidenceFiles.value = evidence.files || []
      evidenceUrls.value = evidence.urls || []
      evidenceNotes.value = evidence.notes || ''
    }
  }
}, { immediate: true })

// Load evidence files when component mounts or when answer changes
watch([() => props.answer, isCompleted], async ([newAnswer, completed]) => {
  if (completed && newAnswer) {
    await loadEvidenceFiles()
  }
}, { immediate: true })

// Handle answer change
const handleAnswerChange = async (value: string) => {
  currentAnswer.value = value
  emit('answerSubmitted', props.question.id, value, answerText.value || undefined)
}

// Handle notes change
const handleNotesChange = async () => {
  if (currentAnswer.value !== null) {
    emit('answerSubmitted', props.question.id, currentAnswer.value, answerText.value || undefined)
  }
}

// Load evidence files
const loadEvidenceFiles = async () => {
  if (!props.answer) return
  try {
    const response = await questionnaire.listEvidenceFiles(props.question.id, props.organizationId)
    evidenceFiles.value = response.files || []
  } catch (error) {
    console.error('Failed to load evidence files:', error)
  }
}

// Handle file upload
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  isUploadingEvidence.value = true
  try {
    if (files.length === 1) {
      const response = await questionnaire.uploadEvidenceFile(props.question.id, props.organizationId, files[0])
      evidenceFiles.value.push({
        file_url: response.file_url,
        file_key: response.file_key,
        file_name: response.file_name,
        file_size: response.file_size,
        file_type: response.file_type,
      })
    } else {
      const fileArray = Array.from(files)
      const response = await questionnaire.uploadMultipleEvidenceFiles(props.question.id, props.organizationId, fileArray)
      evidenceFiles.value.push(...response.files.map(f => ({
        file_url: f.file_url,
        file_key: f.file_key,
        file_name: f.file_name,
        file_size: f.file_size,
        file_type: f.file_type,
      })))
    }
    await saveEvidence()
    // Reset file input
    if (target) target.value = ''
  } catch (error) {
    console.error('Failed to upload evidence file:', error)
  } finally {
    isUploadingEvidence.value = false
  }
}

// Handle URL add
const handleAddUrl = () => {
  const url = prompt('Enter evidence URL:')
  if (url && url.trim()) {
    evidenceUrls.value.push(url.trim())
    saveEvidence()
  }
}

// Remove URL
const handleRemoveUrl = (index: number) => {
  evidenceUrls.value.splice(index, 1)
  saveEvidence()
}

// Save evidence
const saveEvidence = async () => {
  if (!props.answer) return
  
  const evidenceData: EvidenceUpdateData = {
    files: evidenceFiles.value.map(f => f.file_url),
    urls: evidenceUrls.value,
    notes: evidenceNotes.value || undefined,
  }

  try {
    await questionnaire.updateAnswerEvidence(props.question.id, props.organizationId, evidenceData)
  } catch (error) {
    console.error('Failed to save evidence:', error)
  }
}

// Delete evidence file
const handleDeleteFile = async (fileKey: string) => {
  if (!confirm('Are you sure you want to delete this file?')) return
  
  const index = evidenceFiles.value.findIndex(f => f.file_key === fileKey)
  if (index > -1) {
    evidenceFiles.value.splice(index, 1)
    await saveEvidence()
  }
}

// Get answer display value
const getAnswerDisplay = (value: string) => {
  if (value === 'yes') return 'Yes'
  if (value === 'no') return 'No'
  if (value === 'partial') return 'Partial'
  if (value === 'n_a') return 'N/A'
  return value
}

// Check if question has red flag
const hasRedFlag = computed(() => {
  if (!props.question.is_red_flag_trigger || !props.question.red_flag_condition) {
    return false
  }
  if (currentAnswer.value === null) return false
  return String(currentAnswer.value).toLowerCase() === props.question.red_flag_condition.trigger_value.toLowerCase()
})

// Get answer options - use question.options if available, otherwise default
const answerOptions = computed(() => {
  if (props.question.options && Array.isArray(props.question.options) && props.question.options.length > 0) {
    // Handle both object array formats (with label/value) and any other structure
    return props.question.options.map(opt => {
      // If it's already an object with value and label
      if (typeof opt === 'object' && opt !== null) {
        // Check if it has value and label properties
        if ('value' in opt && 'label' in opt) {
          return { value: String(opt.value), label: String(opt.label) }
        }
        // If it's an object but we need to extract value/label
        // Try common patterns
        const value = opt.value || opt.id || opt.code || Object.values(opt)[0]
        const label = opt.label || opt.name || opt.text || String(value)
        return { value: String(value), label: String(label) }
      }
      // If it's a string, use it as both value and label
      if (typeof opt === 'string') {
        return { value: opt, label: getAnswerDisplay(opt) }
      }
      // Fallback
      return { value: String(opt), label: getAnswerDisplay(String(opt)) }
    })
  }
  // Default options for yes_no_partial question type
  return ['yes', 'no', 'partial', 'n_a'].map(opt => ({
    value: opt,
    label: getAnswerDisplay(opt)
  }))
})

// Format file size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <div
    class="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-sm"
  >
    <div class="flex">
      <!-- Left Colored Border -->
      <div 
        class="w-1.5 flex-shrink-0"
        :class="[
          hasRedFlag ? 'bg-red-500' :
          isCompleted ? 'bg-[#09423C]' : 'bg-transparent'
        ]"
      ></div>

      <div class="flex-1 p-4 sm:p-6 min-w-0">
        <!-- Header Row -->
        <div class="flex items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap flex-1 min-w-0">
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium rounded uppercase whitespace-nowrap flex-shrink-0">
              {{ question.code }}
            </span>
            <h4 class="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide truncate flex-shrink-0">
              {{ question.category || 'General' }}
            </h4>
            <span
              v-if="isCompleted"
              class="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] sm:text-xs font-medium rounded-full border border-green-100 whitespace-nowrap flex-shrink-0"
            >
              <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="hidden sm:inline">Complete</span>
              <span class="sm:hidden">Done</span>
            </span>
          </div>
        </div>

        <!-- Question Content -->
        <div class="mb-4 sm:mb-6">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
            {{ question.text }}
          </h3>
          <p v-if="question.description" class="text-xs sm:text-sm text-gray-500 leading-relaxed break-words">
            {{ question.description }}
          </p>
        </div>

        <!-- Red Flag Warning -->
        <div
          v-if="hasRedFlag"
          class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 sm:gap-3"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-semibold text-red-800 mb-1 break-words">Red Flag Triggered</p>
            <p class="text-xs sm:text-sm text-red-700 break-words">
              This answer indicates a {{ question.red_flag_condition?.severity }} risk.
            </p>
          </div>
        </div>

        <!-- Actions Row -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
          <!-- Answer Buttons -->
          <div class="flex gap-1.5 sm:gap-2 flex-wrap">
            <button
              v-for="option in answerOptions"
              :key="option.value"
              @click="handleAnswerChange(option.value)"
              :disabled="isSaving"
              :class="[
                'px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all flex-shrink-0',
                currentAnswer === option.value
                  ? 'bg-[#09423C] text-white border-[#09423C]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
                isSaving && 'opacity-50 cursor-not-allowed'
              ]"
            >
              {{ option.label }}
            </button>
          </div>

          <!-- Ask AI Button -->
          <button
            class="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium rounded-lg transition-colors w-full sm:w-auto flex-shrink-0"
          >
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Ask AI
          </button>
        </div>

        <!-- Notes Section (Optional) -->
        <div class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100" v-if="currentAnswer">
          <textarea
            v-model="answerText"
            @blur="handleNotesChange"
            rows="2"
            placeholder="Add notes..."
            class="w-full text-xs sm:text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none focus:ring-0 p-0 resize-none break-words"
          ></textarea>
        </div>

        <!-- Evidence Section -->
        <div v-if="currentAnswer" class="mt-4 pt-4 border-t border-gray-100">
          <button
            @click="showEvidence = !showEvidence"
            class="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-[#09423C] transition-colors mb-3"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Evidence</span>
            <span v-if="evidenceFiles.length > 0 || evidenceUrls.length > 0" class="px-1.5 py-0.5 bg-[#09423C] text-white text-[10px] rounded-full">
              {{ evidenceFiles.length + evidenceUrls.length }}
            </span>
            <svg 
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': showEvidence }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-show="showEvidence" class="space-y-4">
            <!-- File Upload -->
            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <div class="flex items-center gap-2">
                <input
                  ref="fileInputRef"
                  type="file"
                  multiple
                  @change="handleFileUpload"
                  :disabled="isUploadingEvidence"
                  class="hidden"
                />
                <button
                  @click="fileInputRef?.click()"
                  :disabled="isUploadingEvidence"
                  class="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span v-if="!isUploadingEvidence">Upload Files</span>
                  <span v-else>Uploading...</span>
                </button>
              </div>
            </div>

            <!-- Uploaded Files -->
            <div v-if="evidenceFiles.length > 0" class="space-y-2">
              <label class="block text-xs sm:text-sm font-medium text-gray-700">Uploaded Files</label>
              <div class="space-y-2">
                <div
                  v-for="file in evidenceFiles"
                  :key="file.file_key"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div class="flex-1 min-w-0">
                      <a
                        :href="file.file_url"
                        target="_blank"
                        class="text-xs sm:text-sm text-[#09423C] hover:underline truncate block"
                      >
                        {{ file.file_name }}
                      </a>
                      <span v-if="file.file_size" class="text-[10px] text-gray-500">
                        {{ formatFileSize(file.file_size) }}
                      </span>
                    </div>
                  </div>
                  <button
                    @click="handleDeleteFile(file.file_key)"
                    class="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- External URLs -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs sm:text-sm font-medium text-gray-700">External URLs</label>
                <button
                  @click="handleAddUrl"
                  class="text-xs sm:text-sm text-[#09423C] hover:underline font-medium"
                >
                  + Add URL
                </button>
              </div>
              <div v-if="evidenceUrls.length > 0" class="space-y-2">
                <div
                  v-for="(url, index) in evidenceUrls"
                  :key="index"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <a
                    :href="url"
                    target="_blank"
                    class="text-xs sm:text-sm text-[#09423C] hover:underline truncate flex-1 min-w-0"
                  >
                    {{ url }}
                  </a>
                  <button
                    @click="handleRemoveUrl(index)"
                    class="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Evidence Notes -->
            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Evidence Notes
              </label>
              <textarea
                v-model="evidenceNotes"
                @blur="saveEvidence"
                rows="2"
                placeholder="Add additional notes about the evidence..."
                class="w-full text-xs sm:text-sm text-gray-600 placeholder-gray-400 border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[#09423C] focus:border-[#09423C] resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
