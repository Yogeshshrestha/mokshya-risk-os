<script setup lang="ts">
import type {
  GlobalQuestionResponse,
  GlobalQuestionAnswerResponse,
  GlobalQuestionnaireScoreResponse
} from '~/types/global-questionnaire'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const organization = useOrganization()
const questionnaire = useGlobalQuestionnaire()

const organizationId = route.params.organizationId as string

// State
const questions = ref<GlobalQuestionResponse[]>([])
const answers = ref<GlobalQuestionAnswerResponse[]>([])
const score = ref<GlobalQuestionnaireScoreResponse | null>(null)
const isLoading = ref(true)
const selectedCategory = ref<string>('all')
const savingAnswerId = ref<string | null>(null)
const viewMode = ref<'list' | 'focus'>('list')
const focusedQuestionIndex = ref<number>(0)

// Get current organization
const currentOrg = ref<any>(null)

// Get categories with progress
const categoriesWithProgress = computed(() => {
  const categoryMap = new Map<string, { total: number; answered: number; firstCode: string }>()
  
  // Initialize map with all unique categories
  questions.value.forEach(q => {
    if (!q.category) return
    if (!categoryMap.has(q.category)) {
      categoryMap.set(q.category, { total: 0, answered: 0, firstCode: q.code || '' })
    }
    
    const stats = categoryMap.get(q.category)!
    stats.total++
    
    // Track the first (lowest) code in this category
    if (q.code && (!stats.firstCode || q.code < stats.firstCode)) {
      stats.firstCode = q.code
    }
    
    // Check if answered
    if (answers.value.some(a => a.question_id === q.id)) {
      stats.answered++
    }
  })
  
  return Array.from(categoryMap.entries())
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      answered: stats.answered,
      isCompleted: stats.answered === stats.total,
      percentage: Math.round((stats.answered / stats.total) * 100),
      firstCode: stats.firstCode
    }))
    .sort((a, b) => {
      // Sort by first question code ascending
      if (a.firstCode && b.firstCode) {
        return a.firstCode.localeCompare(b.firstCode)
      }
      return a.name.localeCompare(b.name)
    })
})

// Get overall completion progress
const completedCategoriesCount = computed(() => {
  return categoriesWithProgress.value.filter(c => c.isCompleted).length
})

const overallProgress = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round((answers.value.length / questions.value.length) * 100)
})

// Get answer for a question
const getAnswerForQuestion = (questionId: string) => {
  return answers.value.find(a => a.question_id === questionId)
}

// Get category performance data
const getCategoryPerformance = (categoryName: string) => {
  if (!score.value?.category_scores) return null
  return score.value.category_scores[categoryName]
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

// Get compliance color based on percentage (higher is better)
// Colors match risk grade colors for consistency: A/B=emerald, C=amber, D=orange, F=rose
const getComplianceColor = (percentage: number) => {
  if (percentage >= 90) return 'text-emerald-600' // Matches A grade
  if (percentage >= 75) return 'text-emerald-500' // Matches B grade
  if (percentage >= 50) return 'text-amber-500'    // Matches C grade
  if (percentage >= 25) return 'text-orange-500'   // Matches D grade
  return 'text-rose-600'                           // Matches F grade
}

// Get compliance bar color based on percentage
// Colors match risk grade colors for consistency
const getComplianceBarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-emerald-500'   // Matches A grade
  if (percentage >= 80) return 'bg-emerald-400'    // Matches B grade
  if (percentage >= 70) return 'bg-amber-500'      // Matches C grade
  if (percentage >= 60) return 'bg-orange-500'     // Matches D grade
  return 'bg-rose-500'                             // Matches F grade
}

// Filter and sort questions by selected category
const filteredQuestions = computed(() => {
  let filtered = questions.value
  
  // Filter by category if not "all"
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter(q => q.category === selectedCategory.value)
  }
  
  // Sort by question code ascending
  return filtered.sort((a, b) => {
    if (a.code && b.code) {
      return a.code.localeCompare(b.code)
    }
    return (a.display_order || 0) - (b.display_order || 0)
  })
})

// Get current question for focus mode
const currentQuestion = computed(() => {
  if (viewMode.value === 'focus' && filteredQuestions.value.length > 0) {
    const index = Math.min(focusedQuestionIndex.value, filteredQuestions.value.length - 1)
    return filteredQuestions.value[index]
  }
  return null
})

// Navigation for focus mode
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

// Reset focus index when category changes
watch(selectedCategory, () => {
  focusedQuestionIndex.value = 0
})

// Fetch data
const fetchOrganization = async () => {
  try {
    currentOrg.value = await organization.getOrganization(organizationId)
  } catch (error) {
    console.error('Failed to fetch organization:', error)
    router.push('/organizations')
  }
}

const fetchQuestions = async () => {
  try {
    const params: any = { active_only: true }
    questions.value = await questionnaire.listGlobalQuestions(params)
    // Sort by question code ascending, fallback to display_order
    questions.value.sort((a, b) => {
      if (a.code && b.code) {
        return a.code.localeCompare(b.code)
      }
      return (a.display_order || 0) - (b.display_order || 0)
    })
  } catch (error) {
    console.error('Failed to fetch questions:', error)
  }
}

const fetchAnswers = async () => {
  try {
    answers.value = await questionnaire.listOrganizationAnswers(organizationId)
  } catch (error) {
    console.error('Failed to fetch answers:', error)
  }
}

const fetchScore = async () => {
  try {
    score.value = await questionnaire.getOrganizationScore(organizationId)
  } catch (error) {
    console.error('Failed to fetch score:', error)
  }
}

// Handle answer submission
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
    // Refresh answers and score
    await fetchAnswers()
    await fetchScore()
  } catch (error) {
    console.error('Failed to submit answer:', error)
  } finally {
    savingAnswerId.value = null
  }
}

// Initialize
onMounted(async () => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }
  
  await fetchOrganization()
  await fetchQuestions()
  await fetchAnswers()
  await fetchScore()
  
  // Set initial selected category to "all"
  selectedCategory.value = 'all'
  isLoading.value = false
})

useSeoMeta({
  title: () => currentOrg.value ? `Control Assessment - ${currentOrg.value.name} | Mokshya OS` : 'Control Assessment | Mokshya OS',
  description: 'Answer global security questions for your organization'
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <UContainer class="max-w-[1600px] px-4 lg:px-6 py-8">
      
      <div v-if="isLoading" class="flex items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-6">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-slate-100 border-t-[#09423C] rounded-full animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-2 h-2 bg-[#09423C] rounded-full"></div>
            </div>
          </div>
          <p class="text-slate-500 font-medium animate-pulse">Initializing Security Assessment...</p>
        </div>
      </div>

      <div v-else-if="currentOrg" class="flex flex-col lg:flex-row gap-8 items-start">
        
        <aside class="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-8 transition-all duration-300">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 class="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-[#09423C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Assessment Categories
              </h2>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs font-medium">
                  <span class="text-slate-500">Progress</span>
                  <span class="text-[#09423C]">{{ Math.round((completedCategoriesCount / categoriesWithProgress.length) * 100) }}% Complete</span>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-[#09423C] transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(9,66,60,0.3)]"
                    :style="{ width: `${(completedCategoriesCount / categoriesWithProgress.length) * 100}%` }"
                  ></div>
                </div>
                <div class="text-[10px] text-slate-400 text-right">
                  {{ completedCategoriesCount }} of {{ categoriesWithProgress.length }} categories done
                </div>
              </div>
            </div>

            <nav class="max-h-[calc(100vh-250px)] overflow-y-auto p-3 space-y-1 custom-scrollbar">
              <button
                @click="selectedCategory = 'all'; focusedQuestionIndex = 0"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all text-left group border',
                  selectedCategory === 'all'
                    ? 'bg-[#E3F5EB] border-[#09423C]/10 shadow-sm'
                    : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                ]"
              >
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  :class="selectedCategory === 'all' ? 'bg-[#09423C] text-white' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                </div>
                
                <div class="flex-1">
                  <span class="block font-semibold" :class="selectedCategory === 'all' ? 'text-[#09423C]' : 'text-slate-700'">All Questions</span>
                  <span class="text-xs font-medium" :class="selectedCategory === 'all' ? 'text-[#09423C]/70' : 'text-slate-400'">
                    {{ answers.length }} / {{ questions.length }} Answered
                  </span>
                </div>
              </button>

              <div class="my-2 border-t border-slate-100 mx-2"></div>

              <button
                v-for="category in categoriesWithProgress"
                :key="category.name"
                @click="selectedCategory = category.name; focusedQuestionIndex = 0"
                :class="[
                  'w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left group border',
                  selectedCategory === category.name
                    ? 'bg-white border-[#09423C] ring-1 ring-[#09423C]/10 shadow-md transform scale-[1.02]'
                    : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                ]"
              >
                <div class="relative pt-0.5">
                  <div 
                    class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all border"
                    :class="[
                      category.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : selectedCategory === category.name
                        ? 'border-[#09423C] bg-white'
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                    ]"
                  >
                    <svg v-if="category.isCompleted" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div v-else-if="selectedCategory === category.name" class="w-2 h-2 rounded-full bg-[#09423C]"></div>
                  </div>
                  <div v-if="false" class="absolute top-6 left-1/2 w-px h-6 bg-slate-200 -ml-[0.5px]"></div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span 
                      class="block text-sm font-medium truncate"
                      :class="selectedCategory === category.name ? 'text-[#09423C]' : 'text-slate-700'"
                    >
                      {{ category.name }}
                    </span>
                    <span
                      v-if="getCategoryPerformance(category.name)"
                      class="text-[10px] font-bold px-1.5 py-0.5 rounded ml-2"
                      :class="[
                        getComplianceColor(getCategoryPerformance(category.name).compliance),
                        'bg-opacity-10 bg-slate-100'
                      ]"
                    >
                      {{ Math.round(getCategoryPerformance(category.name).compliance) }}%
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        v-if="getCategoryPerformance(category.name)"
                        class="h-full rounded-full transition-all duration-500"
                        :class="getComplianceBarColor(getCategoryPerformance(category.name).compliance)"
                        :style="{ width: `${getCategoryPerformance(category.name).compliance}%` }"
                      ></div>
                    </div>
                    <span class="text-[10px] text-slate-400 font-medium flex-shrink-0">
                      {{ category.answered }}/{{ category.total }}
                    </span>
                  </div>
                </div>
              </button>
            </nav>
          </div>
        </aside>

        <main class="flex-1 min-w-0">
          
          <div class="mb-6 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <nav class="flex items-center gap-2 text-sm text-slate-500">
                <NuxtLink to="/organizations" class="hover:text-slate-800 transition-colors">Organizations</NuxtLink>
                <span class="text-slate-300">/</span>
                <NuxtLink :to="`/organizations/${organizationId}`" class="hover:text-slate-800 transition-colors">Profile</NuxtLink>
                <span class="text-slate-300">/</span>
                <span class="font-medium text-[#09423C] bg-[#E3F5EB] px-2 py-0.5 rounded-md">Control Assessment</span>
              </nav>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
              <div>
                <h1 class="text-2xl font-bold text-slate-900">
                  Control Assessment
                </h1>
                <p class="text-slate-500 text-sm mt-1">
                  Complete the questionnaire to evaluate {{ currentOrg.name }}'s security posture.
                </p>
              </div>

              <div v-if="score" class="flex flex-wrap items-center gap-4 lg:gap-8 w-full xl:w-auto p-4 bg-slate-50 rounded-xl border border-slate-100">
                
                <div class="flex items-center gap-3">
                  <div class="flex flex-col">
                    <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400">Risk Grade</span>
                    <div class="flex items-baseline gap-1">
                      <span class="text-2xl font-bold font-mono" :class="getRiskGradeColor(score.risk_grade)">
                        {{ score.risk_grade }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="w-px h-8 bg-slate-200"></div>

                <div class="flex flex-col">
                  <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400">Compliance</span>
                  <span class="text-xl font-bold" :class="getComplianceColor(score.compliance_percentage)">
                    {{ Math.round(score.compliance_percentage) }}%
                  </span>
                </div>

                <div class="w-px h-8 bg-slate-200"></div>

                <div class="flex flex-col">
                  <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400">Red Flags</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-xl font-bold" :class="score.red_flags_count > 0 ? 'text-rose-600' : 'text-slate-700'">
                      {{ score.red_flags_count }}
                    </span>
                    <svg v-if="score.red_flags_count > 0" class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="sticky top-4 z-20 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200/60 shadow-sm">
            
            <div class="flex items-center gap-3 px-3">
              <span class="text-xs font-semibold text-slate-600">Total Progress</span>
              <div class="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                <div 
                  class="h-full bg-gradient-to-r from-[#09423C] to-emerald-600 rounded-full"
                  :style="{ width: `${overallProgress}%` }"
                ></div>
              </div>
              <span class="text-xs font-bold text-slate-900">{{ overallProgress }}%</span>
            </div>

            <div class="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                @click="viewMode = 'focus'"
                :class="[
                  'px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all duration-200',
                  viewMode === 'focus' 
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Focus Mode
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all duration-200',
                  viewMode === 'list' 
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                List View
              </button>
            </div>
          </div>

          <div v-if="viewMode === 'focus'">
            <div v-if="currentQuestion" class="max-w-3xl mx-auto">
              <div class="relative">
                <GlobalQuestionCard
                  :question="currentQuestion"
                  :answer="getAnswerForQuestion(currentQuestion.id)"
                  :is-saving="savingAnswerId === currentQuestion.id"
                  @answer-submitted="handleAnswerSubmit"
                  class="transform transition-all duration-300"
                />
              </div>
              
              <div class="mt-6 flex items-center justify-between">
                <button
                  @click="goToPreviousQuestion"
                  :disabled="focusedQuestionIndex === 0"
                  :class="[
                    'px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                    focusedQuestionIndex === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-[#09423C] hover:text-[#09423C] shadow-sm hover:shadow-md'
                  ]"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div class="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Question {{ focusedQuestionIndex + 1 }} / {{ filteredQuestions.length }}
                </div>
                
                <button
                  @click="goToNextQuestion"
                  :disabled="focusedQuestionIndex === filteredQuestions.length - 1"
                  :class="[
                    'px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                    focusedQuestionIndex === filteredQuestions.length - 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-[#09423C] text-white shadow-md shadow-emerald-900/10 hover:bg-[#07332e] hover:shadow-lg'
                  ]"
                >
                  Next Question
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div v-else class="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
              <h3 class="text-lg font-medium text-slate-900">No questions available</h3>
              <p class="text-slate-500 mt-1">Select a different category or try refreshing.</p>
            </div>
          </div>
          
          <div v-else class="space-y-4 pb-20">
            <div v-if="filteredQuestions.length === 0" class="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 class="text-lg font-medium text-slate-900">No questions found</h3>
              <p class="text-slate-500 mt-1">Try adjusting your filters.</p>
            </div>
            
            <GlobalQuestionCard
              v-else
              v-for="question in filteredQuestions"
              :key="question.id"
              :question="question"
              :answer="getAnswerForQuestion(question.id)"
              :is-saving="savingAnswerId === question.id"
              @answer-submitted="handleAnswerSubmit"
              class="transition-transform duration-200 hover:translate-x-1"
            />
          </div>

        </main>
      </div>
    </UContainer>
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