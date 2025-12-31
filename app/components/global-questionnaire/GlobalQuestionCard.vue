<script setup lang="ts">
import type {
  GlobalQuestionResponse,
  GlobalQuestionAnswerResponse
} from '~/types/global-questionnaire'

interface Props {
  question: GlobalQuestionResponse
  answer?: GlobalQuestionAnswerResponse
  isSaving?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  answerSubmitted: [questionId: string, answerValue: string, answerText?: string]
}>()

const currentAnswer = ref<string | null>(
  props.answer?.answer_value ?? null
)
const answerText = ref<string>(props.answer?.answer_text || '')
const showNotes = ref(false)

// Watch for answer changes
watch(() => props.answer, (newAnswer) => {
  if (newAnswer) {
    currentAnswer.value = newAnswer.answer_value
    answerText.value = newAnswer.answer_text || ''
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

const isCompleted = computed(() => currentAnswer.value !== null)
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

      <div class="flex-1 p-6">
        <!-- Header Row -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded uppercase">
              {{ question.code }}
            </span>
            <h4 class="text-sm font-bold text-gray-700 uppercase tracking-wide">
              {{ question.category || 'General' }}
            </h4>
            <span
              v-if="isCompleted"
              class="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </span>
          </div>
          
          <button class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
        </div>

        <!-- Question Content -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ question.text }}
          </h3>
          <p class="text-sm text-gray-500 leading-relaxed">
            {{ question.description }}
          </p>
        </div>

        <!-- Red Flag Warning -->
        <div
          v-if="hasRedFlag"
          class="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3"
        >
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="text-sm font-semibold text-red-800 mb-1">Red Flag Triggered</p>
            <p class="text-sm text-red-700">
              This answer indicates a {{ question.red_flag_condition?.severity }} risk.
            </p>
          </div>
        </div>

        <!-- Actions Row -->
        <div class="flex items-center justify-between">
          <!-- Answer Buttons -->
          <div class="flex gap-2">
            <button
              v-for="option in ['yes', 'no', 'partial', 'n_a']"
              :key="option"
              @click="handleAnswerChange(option)"
              :disabled="isSaving"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                currentAnswer === option
                  ? 'bg-[#09423C] text-white border-[#09423C]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
                isSaving && 'opacity-50 cursor-not-allowed'
              ]"
            >
              {{ getAnswerDisplay(option) }}
            </button>
          </div>

          <!-- Ask AI Button -->
          <button
            class="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Ask AI
          </button>
        </div>

        <!-- Notes Section (Optional) -->
        <div class="mt-4 pt-4 border-t border-gray-100" v-if="currentAnswer">
          <textarea
            v-model="answerText"
            @blur="handleNotesChange"
            rows="2"
            placeholder="Add notes or evidence..."
            class="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none focus:ring-0 p-0 resize-none"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

