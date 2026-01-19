<script setup lang="ts">
import type { GlobalQuestionResponse } from '~/types/global-questionnaire'
import type { SimplifiedAnswer, MessageHistoryItem } from '~/types/ai-questionnaire'

interface Props {
  organizationId: string
  question: GlobalQuestionResponse
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  answerSaved: [answer: any]
}>()

const aiQuestionnaire = useAiQuestionnaire()
const sessionId = ref<string | null>(null)
const messages = ref<MessageHistoryItem[]>([])
const userInput = ref('')
const extractedAnswer = ref<SimplifiedAnswer | null>(null)
const error = ref<string | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)

// Initialize session
onMounted(async () => {
  try {
    isLoading.value = true
    const session = await aiQuestionnaire.startSession(props.organizationId, props.question.id)
    sessionId.value = session.id

    // Load history if any
    const history = await aiQuestionnaire.getHistory(session.id)
    if (history.messages && history.messages.length > 0) {
      messages.value = history.messages
    } else {
      // Add initial system message
      messages.value = [
        {
          role: 'system',
          content: `Question: ${props.question.text}${props.question.description ? `\n\n${props.question.description}` : ''}`,
          timestamp: new Date().toISOString()
        }
      ]
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to start AI session'
  } finally {
    isLoading.value = false
  }
})

// Scroll to bottom on new messages
watch(messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })

const handleSendMessage = async () => {
  if (!userInput.value.trim() || !sessionId.value || isLoading.value) return

  const content = userInput.value
  userInput.value = ''
  
  // Add user message immediately
  messages.value.push({
    role: 'user',
    content,
    timestamp: new Date().toISOString()
  })

  isLoading.value = true
  try {
    const response = await aiQuestionnaire.sendMessage(sessionId.value, content)
    
    messages.value.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date().toISOString()
    })

    if (!response.needs_clarification && response.answer) {
      extractedAnswer.value = response.answer
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to send message'
  } finally {
    isLoading.value = false
  }
}

const handleSaveAnswer = async () => {
  if (!extractedAnswer.value || !sessionId.value) return

  try {
    isLoading.value = true
    await aiQuestionnaire.completeSession(sessionId.value)
    emit('answerSaved', extractedAnswer.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save answer'
  } finally {
    isLoading.value = false
  }
}

const getConfidenceColor = (score: number) => {
  if (score >= 0.8) return 'bg-emerald-500'
  if (score >= 0.6) return 'bg-yellow-500'
  return 'bg-red-500'
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl w-full max-w-2xl h-[80vh] max-h-[800px] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
      <!-- Header -->
      <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="bg-[#09423C]/10 p-2 rounded-lg">
            <svg class="w-5 h-5 text-[#09423C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900">AI Assistant</h3>
            <p class="text-xs text-slate-500">Helping with: <span class="font-medium">ID.{{ question.code }}</span></p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
        <template v-for="(msg, idx) in messages" :key="idx">
          <!-- System Message -->
          <div v-if="msg.role === 'system'" class="flex justify-center my-4">
            <div class="bg-slate-50 text-slate-600 text-sm px-4 py-2 rounded-full border border-slate-100 max-w-[90%] text-center">
              {{ msg.content }}
            </div>
          </div>

          <!-- User/Assistant Message -->
          <div v-else :class="['flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '']">
            <!-- Avatar -->
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', msg.role === 'user' ? 'bg-[#09423C] text-white' : 'bg-emerald-100 text-emerald-700']">
              <span v-if="msg.role === 'user'">👤</span>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <!-- Bubble -->
            <div :class="['max-w-[80%] rounded-2xl px-4 py-3 text-sm', msg.role === 'user' ? 'bg-[#09423C] text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm']">
              <div class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</div>
              <div :class="['text-[10px] mt-1 text-right', msg.role === 'user' ? 'text-white/70' : 'text-slate-400']">
                {{ formatTime(msg.timestamp) }}
              </div>
            </div>
          </div>
        </template>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex gap-3">
          <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>

      <!-- Extracted Answer Card -->
      <div v-if="extractedAnswer" class="p-4 bg-emerald-50 border-t border-emerald-100 animate-slide-up">
        <div class="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="bg-emerald-100 p-1.5 rounded-lg">
                <svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 class="font-bold text-slate-900">Extracted Answer</h4>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-slate-500">Confidence</span>
              <div class="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <div class="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all" :class="getConfidenceColor(extractedAnswer.confidence_score)" :style="{ width: `${extractedAnswer.confidence_score * 100}%` }"></div>
                </div>
                <span class="font-bold text-slate-700">{{ Math.round(extractedAnswer.confidence_score * 100) }}%</span>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggested Answer</span>
              <div class="font-medium text-slate-900 mt-0.5 capitalize">{{ extractedAnswer.answer_value }}</div>
            </div>
            <div v-if="extractedAnswer.answer_text">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Explanation</span>
              <p class="text-sm text-slate-700 mt-0.5">{{ extractedAnswer.answer_text }}</p>
            </div>
            <div v-if="extractedAnswer.reasoning">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reasoning</span>
              <p class="text-xs text-slate-500 mt-0.5 italic">{{ extractedAnswer.reasoning }}</p>
            </div>
          </div>

          <div class="flex gap-3 mt-4 pt-4 border-t border-slate-100">
            <button 
              @click="handleSaveAnswer"
              class="flex-1 bg-[#09423C] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#07332e] transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Apply Answer
            </button>
            <button 
              @click="extractedAnswer = null"
              class="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              Continue Chat
            </button>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t border-slate-200 bg-white">
        <div class="relative flex items-end gap-2">
          <textarea
            v-model="userInput"
            @keydown.enter.prevent="!$event.shiftKey && handleSendMessage()"
            placeholder="Type your answer naturally..."
            rows="1"
            class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C] resize-none max-h-32 min-h-[44px]"
            :disabled="isLoading || !!extractedAnswer"
          ></textarea>
          <button
            @click="handleSendMessage"
            :disabled="!userInput.trim() || isLoading || !!extractedAnswer"
            class="p-3 bg-[#09423C] text-white rounded-xl hover:bg-[#07332e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p class="text-xs text-center text-slate-400 mt-2">AI can make mistakes. Please verify the answer.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
