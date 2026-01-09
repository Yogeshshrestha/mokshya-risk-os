<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import GlobalQuestionCard from '~/components/global-questionnaire/GlobalQuestionCard.vue'
import type {
  GlobalQuestionResponse,
  GlobalQuestionAnswerResponse,
  GlobalQuestionnaireScoreResponse
} from '~/types/global-questionnaire'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const organization = useOrganization()
const questionnaire = useGlobalQuestionnaire()

const organizationId = route.params.id as string

// State
const questions = ref<GlobalQuestionResponse[]>([])
const answers = ref<GlobalQuestionAnswerResponse[]>([])
const score = ref<GlobalQuestionnaireScoreResponse | null>(null)
const isLoading = ref(true)
const selectedCategory = ref<string>('all')
const savingAnswerId = ref<string | null>(null)
const viewMode = ref<'list' | 'focus'>('list')
const focusedQuestionIndex = ref<number>(0)
const selectedPersona = ref('cro')

// Get current organization
const currentOrg = ref<any>(null)

// Get categories with progress
const categoriesWithProgress = computed(() => {
  const categoryMap = new Map<string, { total: number; answered: number; firstCode: string }>()
  
  questions.value.forEach(q => {
    if (!q.category) return
    if (!categoryMap.has(q.category)) {
      categoryMap.set(q.category, { total: 0, answered: 0, firstCode: q.code || '' })
    }
    
    const stats = categoryMap.get(q.category)!
    stats.total++
    
    if (q.code && (!stats.firstCode || q.code < stats.firstCode)) {
      stats.firstCode = q.code
    }
    
    if (answers.value.some(a => a.question_id === q.id)) {
      stats.answered++
    }
  })
  
  return Array.from(categoryMap.entries())
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      answered: stats.answered,
      isCompleted: stats.answered === stats.total && stats.total > 0,
      percentage: stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0,
      firstCode: stats.firstCode
    }))
    .sort((a, b) => {
      if (a.firstCode && b.firstCode) {
        return a.firstCode.localeCompare(b.firstCode)
      }
      return a.name.localeCompare(b.name)
    })
})

const completedCategoriesCount = computed(() => {
  return categoriesWithProgress.value.filter(c => c.isCompleted).length
})

const overallProgress = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round((answers.value.length / questions.value.length) * 100)
})

const getAnswerForQuestion = (questionId: string) => {
  return answers.value.find(a => a.question_id === questionId)
}

const getCategoryPerformance = (categoryName: string) => {
  if (!score.value?.category_scores) return null
  
  const categoryScore = score.value.category_scores[categoryName]
  if (!categoryScore) return null
  
  // Check if this category has any answered questions
  const categoryQuestions = questions.value.filter(q => q.category === categoryName)
  const hasAnswers = categoryQuestions.some(q => answers.value.some(a => a.question_id === q.id))
  
  // Only return performance data if there are answered questions
  if (!hasAnswers) return null
  
  return categoryScore
}

const getComplianceColor = (percentage: number) => {
  if (percentage >= 90) return 'text-emerald-600'
  if (percentage >= 75) return 'text-emerald-500'
  if (percentage >= 50) return 'text-amber-500'
  if (percentage >= 25) return 'text-orange-500'
  return 'text-rose-600'
}

const getComplianceBarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-emerald-500'
  if (percentage >= 80) return 'bg-emerald-400'
  if (percentage >= 70) return 'bg-amber-500'
  if (percentage >= 60) return 'bg-orange-500'
  return 'bg-rose-500'
}

const filteredQuestions = computed(() => {
  let filtered = questions.value
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter(q => q.category === selectedCategory.value)
  }
  return filtered.sort((a, b) => {
    if (a.code && b.code) {
      return a.code.localeCompare(b.code)
    }
    return (a.display_order || 0) - (b.display_order || 0)
  })
})

const currentQuestion = computed(() => {
  if (viewMode.value === 'focus' && filteredQuestions.value.length > 0) {
    const index = Math.min(focusedQuestionIndex.value, filteredQuestions.value.length - 1)
    return filteredQuestions.value[index]
  }
  return null
})

const goToNextQuestion = () => {
  if (focusedQuestionIndex.value < filteredQuestions.value.length - 1) {
    focusedQuestionIndex.value++
  }
}

const goToPreviousQuestion = () => {
  if (focusedQuestionIndex.value > 0) {
    focusedQuestionIndex.value--
  }
}

const fetchData = async () => {
  try {
    const [orgData, questionsData, answersData, scoreData] = await Promise.all([
      organization.getOrganization(organizationId),
      questionnaire.listGlobalQuestions({ active_only: true }),
      questionnaire.listOrganizationAnswers(organizationId),
      questionnaire.getOrganizationScore(organizationId)
    ])
    
    currentOrg.value = orgData
    questions.value = questionsData
    answers.value = answersData
    score.value = scoreData
  } catch (error) {
    console.error('Failed to fetch assessment data:', error)
  } finally {
    isLoading.value = false
  }
}

const handleAnswerSubmit = async (
  questionId: string,
  answerValue: string,
  answerText?: string
) => {
  savingAnswerId.value = questionId
  try {
    await questionnaire.submitAnswer(questionId, organizationId, {
      answer_value: answerValue,
      answer_text: answerText || null,
      evidence: null
    })
    const [newAnswers, newScore] = await Promise.all([
      questionnaire.listOrganizationAnswers(organizationId),
      questionnaire.getOrganizationScore(organizationId)
    ])
    answers.value = newAnswers
    score.value = newScore
  } catch (error) {
    console.error('Failed to submit answer:', error)
  } finally {
    savingAnswerId.value = null
  }
}

onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }
  fetchData()
})

watch(selectedCategory, () => {
  focusedQuestionIndex.value = 0
})
</script>

<template>
  <div class="flex h-screen bg-[#f8fbfb] overflow-hidden">
    <DashboardSidebar />
    
    <div class="flex-1 flex flex-col min-w-0">
      <DashboardHeader 
        title="Control Assessment"
        v-model:persona="selectedPersona"
      />
      
      <main class="flex-1 overflow-y-auto p-8">
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <div class="w-12 h-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="currentOrg" class="max-w-[1600px] mx-auto">
          <div class="flex flex-col lg:flex-row gap-8 items-start">
            
            <!-- Left: Categories (Compact) -->
            <aside class="w-full lg:w-72 flex-shrink-0 sticky top-0 self-start">
              <div class="bg-white rounded-[16px] shadow-sm border border-[#e2e8f0] overflow-hidden">
                <div class="p-5 border-b border-[#f1f5f9] bg-[#f8fafc]">
                  <h3 class="text-[14px] font-extrabold text-[#09433e] uppercase tracking-wider mb-4">Categories</h3>
                  
                  <div class="space-y-3">
                    <div class="flex items-center justify-between text-[12px] font-bold">
                      <span class="text-[#64748b]">Overall Progress</span>
                      <span class="text-[#09423C]">{{ overallProgress }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-[#09423C] transition-all duration-500 rounded-full"
                        :style="{ width: `${overallProgress}%` }"
                      ></div>
                    </div>
                    <div class="text-[10px] font-bold text-[#94a3b8] text-right uppercase tracking-tight">
                      {{ completedCategoriesCount }} of {{ categoriesWithProgress.length }} categories done
                    </div>
                  </div>
                </div>

                <nav class="p-2 space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                  <button
                    @click="selectedCategory = 'all'"
                    :class="[
                      'w-full flex items-center gap-3 px-3 py-3 rounded-[12px] text-[13px] font-bold transition-all text-left border',
                      selectedCategory === 'all'
                        ? 'bg-[#e8f3f2] border-[#09423c]/10 text-[#09423c]'
                        : 'bg-transparent border-transparent text-[#64748b] hover:bg-[#f8fafc] hover:text-[#09423c]'
                    ]"
                  >
                    <div 
                      class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                      :class="selectedCategory === 'all' ? 'bg-[#09423c] text-white' : 'bg-[#f1f5f9] text-[#94a3b8]'"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <span class="block">All Questions</span>
                      <span class="text-[10px] font-bold opacity-60">{{ answers.length }} / {{ questions.length }}</span>
                    </div>
                  </button>

                  <div class="my-2 border-t border-[#f1f5f9] mx-2"></div>

                  <button
                    v-for="category in categoriesWithProgress"
                    :key="category.name"
                    @click="selectedCategory = category.name"
                    :class="[
                      'w-full flex flex-col gap-2 px-3 py-3 rounded-[12px] text-[13px] font-bold transition-all text-left border',
                      selectedCategory === category.name
                        ? 'bg-white border-[#09423c] shadow-md text-[#09423c] translate-x-1'
                        : 'bg-transparent border-transparent text-[#64748b] hover:bg-[#f8fafc] hover:text-[#09423c]'
                    ]"
                  >
                    <div class="flex items-center gap-3 w-full">
                      <div 
                        class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all border"
                        :class="[
                          category.isCompleted
                            ? (getCategoryPerformance(category.name)?.compliance >= 80 ? 'bg-[#16a34a] border-[#16a34a]' : 'bg-orange-500 border-orange-500') + ' text-white'
                            : selectedCategory === category.name
                            ? 'border-[#09423c] bg-white'
                            : 'border-[#cbd5e1] bg-white'
                        ]"
                      >
                        <svg v-if="category.isCompleted" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <div v-else-if="selectedCategory === category.name" class="w-2 h-2 rounded-full bg-[#09423c]"></div>
                      </div>
                      <span class="truncate flex-1">{{ category.name }}</span>
                      <span 
                        class="text-[10px] font-extrabold"
                        :class="category.answered > 0 && getCategoryPerformance(category.name)
                          ? getComplianceColor(getCategoryPerformance(category.name).compliance)
                          : 'text-[#94a3b8]'"
                      >
                        {{ category.answered > 0 && getCategoryPerformance(category.name)
                          ? Math.round(getCategoryPerformance(category.name).compliance) + '%'
                          : category.percentage + '%' }}
                      </span>
                    </div>
                    
                    <div class="w-full h-1 bg-[#f1f5f9] rounded-full overflow-hidden mt-1">
                      <div 
                        class="h-full transition-all duration-500 rounded-full"
                        :class="category.answered > 0 && getCategoryPerformance(category.name)
                          ? getComplianceBarColor(getCategoryPerformance(category.name).compliance)
                          : category.percentage > 0
                          ? 'bg-[#cbd5e1]'
                          : 'bg-[#e2e8f0]'"
                        :style="{ width: `${category.percentage}%` }"
                      ></div>
                    </div>
                    
                    <div class="flex justify-between items-center px-0.5">
                      <span class="text-[9px] font-extrabold text-[#94a3b8] uppercase tracking-tighter">{{ category.answered }} / {{ category.total }} ANSWERED</span>
                    </div>
                  </button>
                </nav>
              </div>
            </aside>

            <!-- Right: Questions Content -->
            <div class="flex-1 min-w-0">
              <!-- Mode Switcher -->
              <div class="mb-6 flex items-center justify-between">
                <div>
                  <h2 class="text-[20px] font-extrabold text-[#09433e]">{{ selectedCategory === 'all' ? 'All Questions' : selectedCategory }}</h2>
                  <p class="text-[13px] font-medium text-[#64748b] mt-1">Complete the assessment to update your risk profile.</p>
                </div>

                <div class="flex bg-[#f1f5f9] rounded-[12px] p-1 border border-[#e2e8f0]">
                  <button
                    @click="viewMode = 'list'"
                    :class="[
                      'px-4 py-2 text-[12px] font-bold rounded-[10px] flex items-center gap-2 transition-all',
                      viewMode === 'list' 
                        ? 'bg-white text-[#09423c] shadow-sm' 
                        : 'text-[#64748b] hover:text-[#09423c]'
                    ]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    List View
                  </button>
                  <button
                    @click="viewMode = 'focus'"
                    :class="[
                      'px-4 py-2 text-[12px] font-bold rounded-[10px] flex items-center gap-2 transition-all',
                      viewMode === 'focus' 
                        ? 'bg-white text-[#09423c] shadow-sm' 
                        : 'text-[#64748b] hover:text-[#09423c]'
                    ]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    Focus Mode
                  </button>
                </div>
              </div>

              <!-- List View -->
              <div v-if="viewMode === 'list'" class="space-y-4">
                <GlobalQuestionCard
                  v-for="question in filteredQuestions"
                  :key="question.id"
                  :question="question"
                  :answer="getAnswerForQuestion(question.id)"
                  :is-saving="savingAnswerId === question.id"
                  @answer-submitted="handleAnswerSubmit"
                />
              </div>

              <!-- Focus View -->
              <div v-else-if="currentQuestion" class="space-y-6">
                <GlobalQuestionCard
                  :question="currentQuestion"
                  :answer="getAnswerForQuestion(currentQuestion.id)"
                  :is-saving="savingAnswerId === currentQuestion.id"
                  @answer-submitted="handleAnswerSubmit"
                />

                <div class="flex items-center justify-between">
                  <button
                    @click="goToPreviousQuestion"
                    :disabled="focusedQuestionIndex === 0"
                    class="px-6 py-3 rounded-[12px] text-[14px] font-bold border border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#09423c] hover:text-[#09423c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                    Previous
                  </button>

                  <span class="text-[14px] font-bold text-[#64748b]">
                    {{ focusedQuestionIndex + 1 }} / {{ filteredQuestions.length }}
                  </span>

                  <button
                    @click="goToNextQuestion"
                    :disabled="focusedQuestionIndex === filteredQuestions.length - 1"
                    class="px-6 py-3 rounded-[12px] text-[14px] font-bold bg-[#09423c] text-white hover:bg-[#07332e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    Next Question
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

              <!-- Completion State -->
              <div v-if="overallProgress === 100" class="mt-12 p-10 bg-gradient-to-br from-[#09423C] to-[#07332e] rounded-[24px] shadow-xl text-white text-center">
                <div class="inline-flex items-center justify-center size-20 bg-white/10 rounded-full mb-6">
                  <svg class="size-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 class="text-[28px] font-extrabold mb-3">Assessment Complete!</h2>
                <p class="text-emerald-100/80 mb-8 max-w-md mx-auto font-medium">Your security posture has been fully evaluated. Your risk metrics and compliance score are now updated.</p>
                <NuxtLink 
                  :to="`/organizations/${organizationId}/dashboard`"
                  class="inline-flex items-center gap-3 bg-white text-[#09423C] px-10 py-4 rounded-[14px] font-extrabold hover:bg-emerald-50 transition-all shadow-lg hover:translate-y-[-2px]"
                >
                  View Updated Dashboard
                  <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>

