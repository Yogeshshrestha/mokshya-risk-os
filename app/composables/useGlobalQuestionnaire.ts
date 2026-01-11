/**
 * Global Questionnaire composable for managing global questions and answers
 */

import type {
  GlobalQuestionResponse,
  GlobalQuestionAnswerCreate,
  GlobalQuestionAnswerResponse,
  GlobalQuestionnaireScoreResponse,
  QuestionCategoryResponse,
} from '~/types/global-questionnaire'
import type { ApiError } from '~/types/auth'

export const useGlobalQuestionnaire = () => {
  const api = useApi()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * List all question categories
   */
  const listCategories = async (params?: {
    active_only?: boolean
  }): Promise<QuestionCategoryResponse[]> => {
    // Don't set global isLoading for this - let the caller manage loading state
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (params?.active_only !== undefined) {
        queryParams.append('active_only', params.active_only.toString())
      }

      const queryString = queryParams.toString()
      const endpoint = `/questionnaire/categories${queryString ? `?${queryString}` : ''}`

      const response = await api.request<QuestionCategoryResponse[]>(endpoint, {
        method: 'GET',
        requireAuth: true,
      })

      return response || []
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to list categories'
      // Return empty array instead of throwing so page can still load
      console.warn('Failed to fetch categories:', apiError.message)
      return []
    }
  }

  /**
   * List all global questions
   */
  const listGlobalQuestions = async (params?: {
    active_only?: boolean
    category?: string
    domain?: string
  }): Promise<GlobalQuestionResponse[]> => {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (params?.active_only !== undefined) {
        queryParams.append('active_only', params.active_only.toString())
      }
      if (params?.category) {
        queryParams.append('category', params.category)
      }
      if (params?.domain) {
        queryParams.append('domain', params.domain)
      }

      const queryString = queryParams.toString()
      const endpoint = `/global-questions${queryString ? `?${queryString}` : ''}`

      const response = await api.request<GlobalQuestionResponse[]>(endpoint, {
        method: 'GET',
        requireAuth: true,
      })

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to list global questions'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a specific global question by ID
   */
  const getGlobalQuestion = async (
    questionId: string
  ): Promise<GlobalQuestionResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<GlobalQuestionResponse>(
        `/global-questions/${questionId}`,
        {
          method: 'GET',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to get global question'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Submit or update an answer to a global question
   * 
   * @param questionId - The question ID
   * @param organizationId - The organization ID
   * @param data - Answer data with answer_value (yes|no|partial|n_a), optional answer_text, and optional evidence
   */
  const submitAnswer = async (
    questionId: string,
    organizationId: string,
    data: GlobalQuestionAnswerCreate
  ): Promise<GlobalQuestionAnswerResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<GlobalQuestionAnswerResponse>(
        `/global-questions/${questionId}/answers/${organizationId}`,
        {
          method: 'POST',
          requireAuth: true,
          body: JSON.stringify(data),
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to submit answer'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * List all answers for an organization
   */
  const listOrganizationAnswers = async (
    organizationId: string,
    questionId?: string
  ): Promise<GlobalQuestionAnswerResponse[]> => {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (questionId) {
        queryParams.append('question_id', questionId)
      }

      const queryString = queryParams.toString()
      const endpoint = `/global-questions/answers/${organizationId}${queryString ? `?${queryString}` : ''}`

      const response = await api.request<GlobalQuestionAnswerResponse[]>(
        endpoint,
        {
          method: 'GET',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to list organization answers'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get organization's global questionnaire score
   */
  const getOrganizationScore = async (
    organizationId: string
  ): Promise<GlobalQuestionnaireScoreResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<GlobalQuestionnaireScoreResponse>(
        `/global-questions/scores/${organizationId}`,
        {
          method: 'GET',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to get organization score'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Manually recalculate organization's score
   */
  const recalculateScore = async (
    organizationId: string
  ): Promise<GlobalQuestionnaireScoreResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.request<GlobalQuestionnaireScoreResponse>(
        `/global-questions/scores/${organizationId}/recalculate`,
        {
          method: 'POST',
          requireAuth: true,
        }
      )

      return response
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to recalculate score'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    listCategories,
    listGlobalQuestions,
    getGlobalQuestion,
    submitAnswer,
    listOrganizationAnswers,
    getOrganizationScore,
    recalculateScore,
    clearError,
  }
}

