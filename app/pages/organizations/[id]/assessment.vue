<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import GlobalQuestionCard from '~/components/global-questionnaire/GlobalQuestionCard.vue'
import type {
  GlobalQuestionResponse,
  GlobalQuestionAnswerResponse,
  GlobalQuestionnaireScoreResponse,
  QuestionCategoryResponse,
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
const categories = ref<QuestionCategoryResponse[]>([])
const isLoading = ref(true)
const selectedCategory = ref<string>('all')
const savingAnswerId = ref<string | null>(null)
const viewMode = ref<'list' | 'focus'>('list')
const focusedQuestionIndex = ref<number>(0)
const selectedPersona = ref('cro')

// Get current organization
const currentOrg = ref<any>(null)

// Get category info by name
const getCategoryInfo = (categoryName: string) => {
  return categories.value.find(cat => cat.name === categoryName || cat.code === categoryName)
}

// Get categories with progress
const categoriesWithProgress = computed(() => {
  const categoryMap = new Map<string, { total: number; answered: number; firstCode: string; type?: string }>()
  
  questions.value.forEach(q => {
    if (!q.category) return
    if (!categoryMap.has(q.category)) {
      const categoryInfo = getCategoryInfo(q.category)
      categoryMap.set(q.category, { 
        total: 0, 
        answered: 0, 
        firstCode: q.code || '',
        type: categoryInfo?.type || q.category_type
      })
    }
    
    const stats = categoryMap.get(q.category)!
    stats.total++
    
    if (q.code && (!stats.firstCode || q.code < stats.firstCode)) {
      stats.firstCode = q.code
    }
    
    // Update type from category info if available
    if (!stats.type) {
      const categoryInfo = getCategoryInfo(q.category)
      stats.type = categoryInfo?.type || q.category_type
    }
    
    if (answers.value.some(a => a.question_id === q.id)) {
      stats.answered++
    }
  })
  
  return Array.from(categoryMap.entries())
    .map(([name, stats]) => ({
      name,
      type: stats.type,
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

// Get risk grade color based on grade letter
const getRiskGradeColor = (grade: string) => {
  switch (grade?.toUpperCase()) {
    case 'A': return 'text-emerald-600'
    case 'B': return 'text-emerald-500'
    case 'C': return 'text-amber-500'
    case 'D': return 'text-orange-500'
    case 'F': return 'text-rose-600'
    default: return 'text-slate-600'
  }
}

// Get risk grade background color for badge
const getRiskGradeBgColor = (grade: string) => {
  switch (grade?.toUpperCase()) {
    case 'A': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'B': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
    case 'C': return 'bg-amber-50 text-amber-600 border-amber-200'
    case 'D': return 'bg-orange-50 text-orange-600 border-orange-200'
    case 'F': return 'bg-rose-50 text-rose-600 border-rose-200'
    default: return 'bg-slate-50 text-slate-600 border-slate-200'
  }
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
    isLoading.value = true
    
    // Fetch organization first (required)
    try {
      currentOrg.value = await organization.getOrganization(organizationId)
    } catch (error) {
      console.error('Failed to fetch organization:', error)
      // Continue anyway - we'll show a message
    }
    
    // Fetch other data in parallel
    const [categoriesData, questionsData, answersData, scoreData] = await Promise.allSettled([
      questionnaire.listCategories({ active_only: true }),
      questionnaire.listGlobalQuestions({ active_only: true }),
      questionnaire.listOrganizationAnswers(organizationId),
      questionnaire.getOrganizationScore(organizationId)
    ])
    
    // Handle results - categories are optional
    categories.value = categoriesData.status === 'fulfilled' ? categoriesData.value : []
    questions.value = questionsData.status === 'fulfilled' ? questionsData.value : []
    answers.value = answersData.status === 'fulfilled' ? answersData.value : []
    score.value = scoreData.status === 'fulfilled' ? scoreData.value : null
    
    // Log any failures
    if (categoriesData.status === 'rejected') {
      console.warn('Categories fetch failed, continuing without them')
    }
    if (questionsData.status === 'rejected') {
      console.error('Failed to fetch questions:', questionsData.reason)
    }
    if (answersData.status === 'rejected') {
      console.error('Failed to fetch answers:', answersData.reason)
    }
    if (scoreData.status === 'rejected') {
      console.warn('Score fetch failed, continuing without it')
    }
  } catch (error) {
    console.error('Unexpected error in fetchData:', error)
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
// Mobile sidebar state
const showMobileSidebar = ref(false)

const toggleSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value
}

const closeSidebar = () => {
  showMobileSidebar.value = false
}

// Close sidebar on route change
watch(() => route.path, () => {
  showMobileSidebar.value = false
})
</script>

<template>
  <div class="flex h-screen bg-[#f8fbfb] overflow-hidden">
    <!-- Desktop Sidebar (always visible on lg+) -->
    <div class="hidden lg:block flex-shrink-0">
      <DashboardSidebar :is-open="true" />
    </div>
    
    <!-- Mobile Sidebar (overlay) -->
    <div class="lg:hidden">
      <DashboardSidebar :is-open="showMobileSidebar" @close="closeSidebar" />
    </div>
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashboardHeader 
        title="Control Assessment"
        v-model:persona="selectedPersona"
        @toggle-sidebar="toggleSidebar"
      />
      
      <main class="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-4">
          <div class="size-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[14px] text-[#4f9690] font-medium text-center">Loading assessment...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="!currentOrg && questions.length === 0" class="max-w-[1600px] mx-auto w-full">
          <div class="bg-white rounded-[16px] shadow-sm border border-[#e2e8f0] p-12 text-center">
            <div class="inline-flex items-center justify-center size-16 bg-rose-50 rounded-full mb-4">
              <svg class="size-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-[20px] font-extrabold text-[#09433e] mb-2">Unable to Load Assessment</h2>
            <p class="text-[14px] text-[#64748b] mb-6">There was an error loading the assessment data. Please try refreshing the page.</p>
            <button 
              @click="fetchData"
              class="px-6 py-3 bg-[#09423c] text-white rounded-xl font-bold hover:bg-[#07332e] transition-all"
            >
              Retry
            </button>
          </div>
        </div>
        
        <div v-else-if="currentOrg || questions.length > 0" class="max-w-[1600px] mx-auto w-full">
          <div class="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            
            <!-- Left: Categories -->
            <aside class="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-1 self-start z-10">
              <div class="bg-white rounded-[16px] shadow-sm border border-[#e2e8f0] overflow-hidden">
                <div class="p-4 sm:p-5 border-b border-[#f1f5f9] bg-[#f8fafc]">
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

                <nav class="p-2 flex flex-col gap-1 max-h-[calc(100vh-400px)] lg:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
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
                        ? 'bg-white border-[#09423c] shadow-md text-[#09423c] lg:translate-x-1'
                        : 'bg-transparent border-transparent text-[#64748b] hover:bg-[#f8fafc] hover:text-[#09423c]'
                    ]"
                  >
                    <div class="flex items-center gap-3 w-full">
                      <div 
                        class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all border"
                        :class="[
                          category.isCompleted
                            ? (() => { const perf = getCategoryPerformance(category.name); return perf !== null && perf.compliance >= 80 ? 'bg-[#16a34a] border-[#16a34a]' : 'bg-orange-500 border-orange-500'; })() + ' text-white'
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
                      <div class="flex-1 min-w-0">
                        <span class="truncate block">{{ category.name }}</span>
                        <span v-if="category.type" class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter truncate block">{{ category.type }}</span>
                      </div>
                      <span 
                        class="text-[10px] font-extrabold"
                        :class="(() => { const perf = getCategoryPerformance(category.name); return category.answered > 0 && perf !== null ? getComplianceColor(perf.compliance) : 'text-[#94a3b8]'; })()"
                      >
                        {{ (() => { const perf = getCategoryPerformance(category.name); return category.answered > 0 && perf !== null ? Math.round(perf.compliance) + '%' : category.percentage + '%'; })() }}
                      </span>
                    </div>
                    
                    <div class="w-full h-1 bg-[#f1f5f9] rounded-full overflow-hidden mt-1">
                      <div 
                        class="h-full transition-all duration-500 rounded-full"
                        :class="(() => { const perf = getCategoryPerformance(category.name); return category.answered > 0 && perf !== null ? getComplianceBarColor(perf.compliance) : category.percentage > 0 ? 'bg-[#cbd5e1]' : 'bg-[#e2e8f0]'; })()"
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
              <!-- Assessment Metrics -->
              <div v-if="score" class="mb-6 bg-white rounded-[16px] border border-[#e2e8f0] shadow-sm p-4">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <!-- Risk Grade -->
                  <div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                    <div class="size-10 rounded-lg bg-[#09423c]/10 flex items-center justify-center flex-shrink-0">
                      <UIcon name="i-lucide-shield-alert" class="size-5 text-[#09423c]" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-1">Risk Grade</p>
                      <div 
                        class="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[14px] font-bold border"
                        :class="getRiskGradeBgColor(score.risk_grade || 'N/A')"
                      >
                        {{ score.risk_grade || 'N/A' }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Compliance -->
                  <div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                    <div class="size-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <UIcon name="i-lucide-check-circle-2" class="size-5 text-emerald-600" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-1">Compliance</p>
                      <p 
                        class="text-[14px] font-bold"
                        :class="getComplianceColor(score.compliance_percentage || 0)"
                      >
                        {{ Math.round(score.compliance_percentage || 0) }}%
                      </p>
                    </div>
                  </div>
                  
                  <!-- Red Flags -->
                  <div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                    <div :class="['size-10 rounded-lg flex items-center justify-center flex-shrink-0', (score.red_flags_count || 0) > 0 ? 'bg-rose-50' : 'bg-emerald-50']">
                      <UIcon 
                        :name="(score.red_flags_count || 0) > 0 ? 'i-lucide-flag' : 'i-lucide-check'"
                        :class="['size-5', (score.red_flags_count || 0) > 0 ? 'text-rose-600' : 'text-emerald-600']"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-1">Red Flags</p>
                      <p 
                        class="text-[14px] font-bold"
                        :class="(score.red_flags_count || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'"
                      >
                        {{ score.red_flags_count || 0 }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mode Switcher -->
              <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 class="text-[18px] sm:text-[20px] font-extrabold text-[#09433e]">{{ selectedCategory === 'all' ? 'All Questions' : selectedCategory }}</h2>
                  <p class="text-[12px] sm:text-[13px] font-medium text-[#64748b] mt-1">Complete the assessment to update your risk profile.</p>
                </div>

                <div class="flex bg-[#f1f5f9] rounded-[12px] p-1 border border-[#e2e8f0] self-start sm:self-auto">
                  <button
                    @click="viewMode = 'list'"
                    :class="[
                      'flex-1 sm:flex-none px-3 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold rounded-[10px] flex items-center justify-center gap-2 transition-all',
                      viewMode === 'list' 
                        ? 'bg-white text-[#09423c] shadow-sm' 
                        : 'text-[#64748b] hover:text-[#09423c]'
                    ]"
                  >
                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    List View
                  </button>
                  <button
                    @click="viewMode = 'focus'"
                    :class="[
                      'flex-1 sm:flex-none px-3 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold rounded-[10px] flex items-center justify-center gap-2 transition-all',
                      viewMode === 'focus' 
                        ? 'bg-white text-[#09423c] shadow-sm' 
                        : 'text-[#64748b] hover:text-[#09423c]'
                    ]"
                  >
                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    Focus Mode
                  </button>
                </div>
              </div>

              <!-- List View -->
              <div v-if="viewMode === 'list'" class="space-y-4">
                <div v-if="filteredQuestions.length === 0" class="text-center py-12">
                  <div class="inline-flex items-center justify-center size-16 bg-gray-100 rounded-full mb-4">
                    <svg class="size-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p class="text-[16px] font-bold text-[#64748b]">No questions available</p>
                  <p class="text-[13px] text-[#94a3b8] mt-2">Questions will appear here once they are loaded.</p>
                </div>
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
              <div v-else-if="viewMode === 'focus'">
                <div v-if="!currentQuestion" class="text-center py-12">
                  <div class="inline-flex items-center justify-center size-16 bg-gray-100 rounded-full mb-4">
                    <svg class="size-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p class="text-[16px] font-bold text-[#64748b]">No questions available</p>
                  <p class="text-[13px] text-[#94a3b8] mt-2">Select a category or wait for questions to load.</p>
                </div>
                <template v-else>
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
                </template>
              </div>

              <!-- Completion State -->
              <div v-if="overallProgress === 100" class="mt-12 p-8 sm:p-12 bg-white border border-[#e8f3f2] rounded-[24px] shadow-sm text-center">
                <div class="inline-flex items-center justify-center size-16 bg-emerald-50 rounded-full mb-6">
                  <UIcon name="i-lucide-check-circle" class="size-8 text-emerald-600" />
                </div>
                <h2 class="text-[24px] font-extrabold text-[#0e1b1a] mb-2">Assessment Complete</h2>
                <p class="text-[15px] text-[#4f9690] mb-8 max-w-md mx-auto">
                  Your security posture has been evaluated. Your risk metrics and compliance scores are now updated.
                </p>
                <NuxtLink 
                  :to="`/organizations/${organizationId}/dashboard`"
                  class="inline-flex items-center gap-2 bg-[#09423c] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-md cursor-pointer"
                >
                  View Dashboard
                  <UIcon name="i-lucide-arrow-right" class="size-4" />
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

