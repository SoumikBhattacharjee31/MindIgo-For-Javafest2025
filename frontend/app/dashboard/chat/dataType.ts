export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  safety_alert?: 'none' | 'mild' | 'crisis';
  recommendations?: Recommendation[];
}

export interface ApiMessage {
  _id: string;
  session_id: string;
  user_id: number;
  user_name: string;
  user_message: string;
  ai_response: string;
  timestamp: string;
  metadata: {
    safety_alert: 'none' | 'mild' | 'crisis';
    escalate: boolean;
    recommendations: Recommendation[];
  };
}

export interface Recommendation {
  type: 'song' | 'doctor' | 'breathing_exercise' | 'emergency_contact' | 'mood_insight';
  title: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

export interface ChatResponse {
  message: string;
  recommendations: Recommendation[];
  escalate: boolean;
  safety_alert: 'none' | 'mild' | 'crisis';
}

export interface SessionResponse {
  _id: string;
  session_id: string;
  last_activity: string;
  created_at: string;
  metadata: {
    user_id: number;
    user_name: string;
    created_at: string;
  };
  user_id: number;
  last_message?: string;
  last_response?: string;
  message_count?: number;
}


export interface MessageHistoryResponse {
  messages: ApiMessage[];
  total_messages: number;
  page: number;
  per_page: number;
  has_more: boolean;
}