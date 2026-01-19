export interface AISession {
  id: string
  status: 'active' | 'completed' | 'abandoned'
  created_at: string
}

export interface SimplifiedAnswer {
  answer_value: string
  answer_text: string | null
  confidence_score: number // 0.0 to 1.0
  reasoning?: string
}

export interface AISessionDetail {
  id: string
  status: string
  question: {
    id: string
    text: string
    description: string | null
  }
  extracted_answer: SimplifiedAnswer | null
  created_at: string
  completed_at: string | null
}

export interface AIConversationResponse {
  message: string
  answer: SimplifiedAnswer | null
  needs_clarification: boolean
  is_complete: boolean
}

export interface MessageHistoryItem {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface ConversationHistory {
  messages: MessageHistoryItem[]
  total: number
}

export interface SessionListItem {
  id: string
  question_id: string
  question_text: string
  status: string
  created_at: string
  has_answer: boolean
}

export interface SessionList {
  sessions: SessionListItem[]
  total: number
}
