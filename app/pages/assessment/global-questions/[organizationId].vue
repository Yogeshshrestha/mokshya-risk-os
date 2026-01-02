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

// Get risk score color based on percentage (lower is better)
const getRiskScoreColor = (percentage: number) => {
  if (percentage <= 25) return 'text-green-600' // Low risk
  if (percentage <= 50) return 'text-yellow-600' // Medium risk
  if (percentage <= 75) return 'text-orange-600' // High risk
  return 'text-red-600' // Very high risk
}

// Get risk grade color based on grade letter
const getRiskGradeColor = (grade: string) => {
  switch (grade?.toUpperCase()) {
    case 'A':
      return 'text-green-600' // Excellent
    case 'B':
      return 'text-green-500' // Good
    case 'C':
      return 'text-yellow-600' // Fair
    case 'D':
      return 'text-orange-600' // Poor
    case 'F':
      return 'text-red-600' // Fail
    default:
      return 'text-gray-600' // Unknown
  }
}

// Get compliance color based on percentage (higher is better)
const getComplianceColor = (percentage: number) => {
  if (percentage >= 90) return 'text-green-600' // Excellent
  if (percentage >= 80) return 'text-green-500' // Good
  if (percentage >= 70) return 'text-yellow-600' // Fair
  if (percentage >= 60) return 'text-orange-600' // Poor
  return 'text-red-600' // Fail
}

// Get compliance bar color based on percentage
const getComplianceBarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-green-600' // Excellent
  if (percentage >= 80) return 'bg-green-500' // Good
  if (percentage >= 70) return 'bg-yellow-600' // Fair
  if (percentage >= 60) return 'bg-orange-600' // Poor
  return 'bg-red-600' // Fail
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

// Handle recalculate score
const handleRecalculateScore = async () => {
  try {
    score.value = await questionnaire.recalculateScore(organizationId)
  } catch (error) {
    console.error('Failed to recalculate score:', error)
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
  <div class="min-h-screen bg-white">
    <UContainer class="max-w-[1600px] px-4 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-mokshya-text">Loading assessment...</p>
        </div>
      </div>

      <div v-else-if="currentOrg" class="flex flex-col lg:flex-row gap-8">
        <!-- Left Sidebar - Categories -->
        <aside class="w-full lg:w-72 flex-shrink-0">
          <div class="sticky top-8">
            <div class="mb-6">
              <h2 class="text-lg font-bold text-gray-900 mb-2">Categories</h2>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-gray-500">{{ completedCategoriesCount }} of {{ categoriesWithProgress.length }} Completed</span>
                <span class="font-semibold text-mokshya-dark">{{ Math.round((completedCategoriesCount / categoriesWithProgress.length) * 100) }}%</span>
              </div>
              <div class="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-[#09423C] transition-all duration-500 rounded-full"
                  :style="{ width: `${(completedCategoriesCount / categoriesWithProgress.length) * 100}%` }"
                ></div>
              </div>
            </div>

            <nav class="space-y-1">
              <!-- All Questions Option -->
              <button
                @click="selectedCategory = 'all'; focusedQuestionIndex = 0"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left group',
                  selectedCategory === 'all'
                    ? 'bg-[#E3F5EB] text-[#09423C]'
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                <!-- Status Icon -->
                <div 
                  class="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors"
                  :class="[
                    selectedCategory === 'all'
                      ? 'border-[#09423C] border-2 bg-transparent'
                      : 'border-gray-300 bg-transparent'
                  ]"
                >
                  <div v-if="selectedCategory === 'all'" class="w-2 h-2 rounded-full bg-[#09423C]"></div>
                </div>
                
                <div class="flex-1">
                  <span class="block font-semibold">All Questions</span>
                  <span class="text-xs text-gray-400 font-normal">
                    {{ answers.length }}/{{ questions.length }} Answered
                  </span>
                </div>
              </button>

              <!-- Category Options -->
              <button
                v-for="category in categoriesWithProgress"
                :key="category.name"
                @click="selectedCategory = category.name; focusedQuestionIndex = 0"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left group',
                  selectedCategory === category.name
                    ? 'bg-[#E3F5EB] text-[#09423C]'
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                <!-- Status Icon -->
                <div 
                  class="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors"
                  :class="[
                    category.isCompleted
                      ? 'bg-[#09423C] border-[#09423C] text-white'
                      : selectedCategory === category.name
                      ? 'border-[#09423C] border-2 bg-transparent'
                      : 'border-gray-300 bg-transparent'
                  ]"
                >
                  <svg v-if="category.isCompleted" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div v-else-if="selectedCategory === category.name" class="w-2 h-2 rounded-full bg-[#09423C]"></div>
                </div>
                
                <div class="flex-1">
                  <span class="block">{{ category.name }}</span>
                  <span class="text-xs text-gray-400 font-normal">
                    {{ category.answered }}/{{ category.total }} Questions
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0">
          <!-- Header -->
          <div class="mb-8">
            <!-- Breadcrumbs -->
            <nav class="mb-4">
              <ol class="flex items-center gap-2 text-sm text-gray-500">
                <li>Assessment</li>
                <li class="text-gray-300">/</li>
                <li>
                  <NuxtLink
                    :to="`/organizations/${organizationId}`"
                    class="hover:text-[#09423C] transition-colors"
                  >
                    Organization Profile
                  </NuxtLink>
                </li>
                <li class="text-gray-300">/</li>
                <li class="font-medium text-[#09423C]">Control Assessment</li>
              </ol>
            </nav>

            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                  Control Assessment
                </h1>
                <div class="flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  <div class="w-2 h-2 rounded-full bg-[#09423C]"></div>
                  Mokshya OS Intelligence Engine Active
                </div>
              </div>

              <!-- Top Controls -->
              <div class="flex items-center gap-6">
                <!-- Score & Red Flags -->
                <div v-if="score" class="hidden md:flex items-center gap-6 border-r border-gray-200 pr-6">
                  <div class="flex flex-col items-end">
                    <span class="text-xs font-semibold text-gray-500 uppercase">Risk Grade</span>
                    <span class="text-lg font-bold" :class="getRiskGradeColor(score.risk_grade)">
                      {{ score.risk_grade }}
                    </span>
                    <span class="text-xs text-gray-400">{{ Math.round(score.risk_percentage) }}% Risk</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-xs font-semibold text-gray-500 uppercase">Compliance</span>
                    <span class="text-lg font-bold text-green-600">
                      {{ Math.round(score.compliance_percentage) }}%
                    </span>
                    <span class="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-xs font-semibold text-gray-500 uppercase">Red Flags</span>
                    <span class="text-lg font-bold" :class="score.red_flags_count > 0 ? 'text-red-600' : 'text-gray-900'">{{ score.red_flags_count }}</span>
                  </div>
                </div>

                <!-- Total Progress -->
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <div class="text-xs font-semibold text-gray-900">Total Progress</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-[#09423C] rounded-full"
                        :style="{ width: `${overallProgress}%` }"
                      ></div>
                    </div>
                    <span class="text-xs font-bold text-gray-900">{{ overallProgress }}%</span>
                  </div>
                </div>

                <!-- View Toggle -->
                <div class="flex bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    @click="viewMode = 'focus'"
                    :class="[
                      'px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors',
                      viewMode === 'focus' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    ]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Focus
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    :class="[
                      'px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors',
                      viewMode === 'list' ? 'bg-[#09423C] text-white' : 'text-gray-500 hover:text-gray-700'
                    ]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Scores Breakdown -->
          <div v-if="score && score.category_scores && Object.keys(score.category_scores).length > 0" class="mb-8">
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="[categoryName, categoryScore] in Object.entries(score.category_scores)"
                  :key="categoryName"
                  class="flex flex-col gap-2"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">{{ categoryName }}</span>
                    <span class="text-sm font-bold" :class="getComplianceColor(categoryScore.compliance)">
                      {{ Math.round(categoryScore.compliance) }}%
                    </span>
                  </div>
                  <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="getComplianceBarColor(categoryScore.compliance)"
                      :style="{ width: `${categoryScore.compliance}%` }"
                    ></div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500">
                    <span>{{ categoryScore.score.toFixed(2) }}/{{ categoryScore.max.toFixed(2) }}</span>
                    <span>{{ categoryScore.count }} questions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Question List / Focus View -->
          <div v-if="viewMode === 'focus'">
            <!-- Focus Mode: Show one question at a time -->
            <div v-if="currentQuestion" class="space-y-4">
              <GlobalQuestionCard
                :question="currentQuestion"
                :answer="getAnswerForQuestion(currentQuestion.id)"
                :is-saving="savingAnswerId === currentQuestion.id"
                @answer-submitted="handleAnswerSubmit"
              />
              
              <!-- Navigation Controls -->
              <div class="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
                <button
                  @click="goToPreviousQuestion"
                  :disabled="focusedQuestionIndex === 0"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    focusedQuestionIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#09423C] text-white hover:bg-[#07332e]'
                  ]"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div class="text-sm text-gray-600">
                  Question {{ focusedQuestionIndex + 1 }} of {{ filteredQuestions.length }}
                </div>
                
                <button
                  @click="goToNextQuestion"
                  :disabled="focusedQuestionIndex === filteredQuestions.length - 1"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    focusedQuestionIndex === filteredQuestions.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#09423C] text-white hover:bg-[#07332e]'
                  ]"
                >
                  Next
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div v-else class="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p class="text-gray-500">No questions available</p>
            </div>
          </div>
          
          <!-- List Mode: Show all questions -->
          <div v-else class="space-y-4">
            <div v-if="filteredQuestions.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p class="text-gray-500">No questions found</p>
            </div>
            
            <GlobalQuestionCard
              v-else
              v-for="question in filteredQuestions"
              :key="question.id"
              :question="question"
              :answer="getAnswerForQuestion(question.id)"
              :is-saving="savingAnswerId === question.id"
              @answer-submitted="handleAnswerSubmit"
            />
          </div>
        </main>
      </div>
    </UContainer>
  </div>
</template>