import type {
  AISession,
  AIConversationResponse,
  ConversationHistory,
  SessionList,
  AISessionDetail
} from '~/types/ai-questionnaire'
import type { ApiError } from '~/types/auth'

export const useAiQuestionnaire = () => {
  const api = useApi()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const startSession = async (organizationId: string, questionId: string): Promise<AISession> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<AISession>(`/ai-questionnaire/sessions?organization_id=${organizationId}`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({ question_id: questionId })
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to start AI session'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (sessionId: string, message: string): Promise<AIConversationResponse> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<AIConversationResponse>(`/ai-questionnaire/sessions/${sessionId}/messages`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({ content: message })
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to send message'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getHistory = async (sessionId: string): Promise<ConversationHistory> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<ConversationHistory>(`/ai-questionnaire/sessions/${sessionId}/history`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to get history'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const completeSession = async (sessionId: string): Promise<AISession> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<AISession>(`/ai-questionnaire/sessions/${sessionId}/complete`, {
        method: 'PATCH',
        requireAuth: true
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to complete session'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const listSessions = async (organizationId: string, status?: 'active' | 'completed' | 'abandoned'): Promise<SessionList> => {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ organization_id: organizationId })
      if (status) params.append('status_filter', status)
      
      return await api.request<SessionList>(`/ai-questionnaire/sessions?${params.toString()}`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to list sessions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getSessionDetails = async (sessionId: string): Promise<AISessionDetail> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<AISessionDetail>(`/ai-questionnaire/sessions/${sessionId}`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to get session details'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    startSession,
    sendMessage,
    getHistory,
    completeSession,
    listSessions,
    getSessionDetails
  }
}
