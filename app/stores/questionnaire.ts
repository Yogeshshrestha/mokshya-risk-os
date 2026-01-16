import { defineStore } from 'pinia'
import type {
  GlobalQuestionResponse,
  GlobalQuestionAnswerResponse,
  GlobalQuestionAnswerCreate,
  GlobalQuestionnaireScoreResponse,
  QuestionCategoryResponse
} from '~/types/global-questionnaire'

interface QuestionnaireState {
  questions: GlobalQuestionResponse[]
  categories: QuestionCategoryResponse[]
  answers: Record<string, GlobalQuestionAnswerResponse> // keyed by question_id
  score: GlobalQuestionnaireScoreResponse | null
  
  questionsLoading: boolean
  questionsError: string | null
  
  categoriesLoading: boolean
  categoriesError: string | null
  
  answersLoading: boolean
  answersError: string | null
  
  scoreLoading: boolean
  scoreError: string | null
  
  lastFetched: number | null
  cacheDuration: number
}

export const useQuestionnaireStore = defineStore('questionnaire', {
  state: (): QuestionnaireState => ({
    questions: [],
    categories: [],
    answers: {},
    score: null,
    
    questionsLoading: false,
    questionsError: null,
    
    categoriesLoading: false,
    categoriesError: null,
    
    answersLoading: false,
    answersError: null,
    
    scoreLoading: false,
    scoreError: null,
    
    lastFetched: null,
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    isStale: (state) => {
      if (!state.lastFetched) return true
      return Date.now() - state.lastFetched > state.cacheDuration
    },
    
    questionById: (state) => (id: string) => {
      return state.questions.find(q => q.id === id) || null
    },
    
    answerByQuestionId: (state) => (questionId: string) => {
      return state.answers[questionId] || null
    },
    
    questionsByCategory: (state) => (category: string) => {
      return state.questions.filter(q => q.category === category)
    },
    
    questionsByDomain: (state) => (domain: string) => {
      return state.questions.filter(q => q.domain === domain)
    },
    
    answeredQuestions: (state) => {
      return Object.keys(state.answers).length
    },
    
    totalQuestions: (state) => {
      return state.questions.length
    },
    
    completionPercentage: (state) => {
      if (state.questions.length === 0) return 0
      return Math.round((Object.keys(state.answers).length / state.questions.length) * 100)
    }
  },

  actions: {
    async fetchQuestions(params?: {
      active_only?: boolean
      category?: string
      domain?: string
    }, forceRefresh = false) {
      if (!forceRefresh && !this.isStale && this.questions.length > 0) {
        return this.questions
      }

      this.questionsLoading = true
      this.questionsError = null

      try {
        const questionnaire = useGlobalQuestionnaire()
        const data = await questionnaire.listGlobalQuestions(params)
        this.questions = data
        this.lastFetched = Date.now()
        return data
      } catch (error: any) {
        this.questionsError = error.message || 'Failed to fetch questions'
        throw error
      } finally {
        this.questionsLoading = false
      }
    },

    async fetchQuestion(questionId: string) {
      // Check cache first
      const cached = this.questionById(questionId)
      if (cached) {
        return cached
      }

      this.questionsLoading = true
      this.questionsError = null

      try {
        const questionnaire = useGlobalQuestionnaire()
        const data = await questionnaire.getGlobalQuestion(questionId)
        
        // Add to questions array if not exists
        const index = this.questions.findIndex(q => q.id === questionId)
        if (index >= 0) {
          this.questions[index] = data
        } else {
          this.questions.push(data)
        }
        
        return data
      } catch (error: any) {
        this.questionsError = error.message || 'Failed to fetch question'
        throw error
      } finally {
        this.questionsLoading = false
      }
    },

    async fetchCategories(params?: { active_only?: boolean }) {
      this.categoriesLoading = true
      this.categoriesError = null

      try {
        const questionnaire = useGlobalQuestionnaire()
        const data = await questionnaire.listCategories(params)
        this.categories = data
        return data
      } catch (error: any) {
        this.categoriesError = error.message || 'Failed to fetch categories'
        throw error
      } finally {
        this.categoriesLoading = false
      }
    },

    async fetchAnswers(organizationId: string, forceRefresh = false) {
      if (!forceRefresh && !this.isStale && Object.keys(this.answers).length > 0) {
        return this.answers
      }

      this.answersLoading = true
      this.answersError = null

      try {
        const questionnaire = useGlobalQuestionnaire()
        const data = await questionnaire.listOrganizationAnswers(organizationId)
        
        // Convert array to object keyed by question_id
        const answersMap: Record<string, GlobalQuestionAnswerResponse> = {}
        data.forEach(answer => {
          answersMap[answer.question_id] = answer
        })
        
        this.answers = answersMap
        this.lastFetched = Date.now()
        return this.answers
      } catch (error: any) {
        this.answersError = error.message || 'Failed to fetch answers'
        throw error
      } finally {
        this.answersLoading = false
      }
    },

    async submitAnswer(questionId: string, organizationId: string, data: GlobalQuestionAnswerCreate) {
      this.answersLoading = true
      this.answersError = null

      try {
        const questionnaire = useGlobalQuestionnaire()
        const answer = await questionnaire.submitAnswer(questionId, organizationId, data)
        
        // Update answers map
        this.answers[questionId] = answer
        
        // Refresh score after submitting answer
        await this.fetchScore(organizationId)
        
        return answer
      } catch (error: any) {
        this.answersError = error.message || 'Failed to submit answer'
        throw error
      } finally {
        this.answersLoading = false
      }
    },

    async fetchScore(organizationId: string) {
      this.scoreLoading = true
      this.scoreError = null

      try {
        const questionnaire = useGlobalQuestionnaire()
        const data = await questionnaire.getOrganizationScore(organizationId)
        this.score = data
        return data
      } catch (error: any) {
        this.scoreError = error.message || 'Failed to fetch score'
        throw error
      } finally {
        this.scoreLoading = false
      }
    },

    clearQuestionnaire() {
      this.questions = []
      this.categories = []
      this.answers = {}
      this.score = null
      this.lastFetched = null
    },

    clearAnswers() {
      this.answers = {}
      this.score = null
    }
  }
})
