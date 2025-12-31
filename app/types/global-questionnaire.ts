/**
 * Global Questionnaire type definitions
 */

export interface GlobalQuestionResponse {
  id: string
  code: string
  text: string
  description?: string
  help_text?: string
  question_type: string
  category?: string
  domain?: string
  display_order: number
  is_red_flag_trigger: boolean
  red_flag_condition?: {
    severity: string
    red_flag_code: string
    trigger_value: string
  }
  is_active: boolean
  is_required: boolean
  tags: string[]
  score_weights: Record<string, number>
  max_score: number
  created_at: string
  updated_at: string
}

export interface GlobalQuestionAnswerCreate {
  answer_value: string // Pattern: "^(yes|no|partial|n_a)$"
  answer_text?: string | null
  evidence?: Record<string, any> | null
}

export interface GlobalQuestionAnswerResponse {
  id: string
  question_id: string
  organization_id: string
  answer_value: string
  answer_text?: string | null
  evidence?: Record<string, any> | null
  calculated_score: number
  answered_by: string
  answered_at: string
  updated_at: string
}

export interface GlobalQuestionnaireScoreResponse {
  id: string
  organization_id: string
  total_questions: number
  answered_questions: number
  total_score: number
  max_possible_score: number
  compliance_percentage: number
  category_scores?: Record<string, any>
  red_flags_count: number
  red_flags: string[]
  last_calculated_at: string
  created_at: string
  updated_at: string
}

