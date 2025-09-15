'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertTriangle, Heart, Phone, Wind, Music, UserPlus, Lightbulb, Loader2, Plus, MessageSquare, Sparkles, Shield, Menu, X, ChevronLeft, Clock, Trash2 } from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  safety_alert?: 'none' | 'mild' | 'crisis';
  recommendations?: Recommendation[];
}

interface Recommendation {
  type: 'song' | 'doctor' | 'breathing_exercise' | 'emergency_contact' | 'mood_insight';
  title: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

interface ChatResponse {
  message: string;
  recommendations: Recommendation[];
  escalate: boolean;
  safety_alert: 'none' | 'mild' | 'crisis';
}

interface SessionInfo {
  session_id: string;
  user_id: number;
  user_name: string;
  created_at: string;
  last_activity: string;
  message_count: number;
  preview?: string;
}

const API_BASE_URL = 'http://localhost:8080/api/v1/genai/gemini';

export default function MentalHealthChat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [currentRecommendations, setCurrentRecommendations] = useState<Recommendation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeSession();
    loadSessions();
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSidebarOpen]);

  const loadSessions = async () => {
    try {
      // Mock sessions data - replace with actual API call
      const mockSessions: SessionInfo[] = [
        {
          session_id: 'sess_001',
          user_id: 1,
          user_name: 'User',
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          message_count: 5,
          preview: 'Feeling anxious about work today...'
        },
        {
          session_id: 'sess_002',
          user_id: 1,
          user_name: 'User',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          last_activity: new Date(Date.now() - 86400000).toISOString(),
          message_count: 12,
          preview: 'Had a great day with friends...'
        }
      ];
      setSessions(mockSessions);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const initializeSession = async () => {
    try {
      setIsSessionLoading(true);
      setError(null);
      await createNewSession();
    } catch (err) {
      setError('Failed to initialize chat session. Please refresh the page.');
      console.error('Session initialization error:', err);
    } finally {
      setIsSessionLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      // Mock session creation - replace with actual API call
      const newSessionId = `sess_${Date.now()}`;
      setSessionId(newSessionId);
      setMessages([]);
      setCurrentRecommendations([]);
      setError(null);
      
      // Add to sessions list
      const newSession: SessionInfo = {
        session_id: newSessionId,
        user_id: 1,
        user_name: 'User',
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        message_count: 0,
        preview: 'New conversation'
      };
      setSessions(prev => [newSession, ...prev]);
    } catch (err) {
      console.error('Failed to create session:', err);
      throw err;
    }
  };

  const switchSession = async (sessionInfo: SessionInfo) => {
    setSessionId(sessionInfo.session_id);
    setMessages([]);
    setCurrentRecommendations([]);
    setIsSidebarOpen(false);
    // In real implementation, load session history here
  };

  const deleteSession = async (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.session_id !== sessionIdToDelete));
    if (sessionId === sessionIdToDelete) {
      await createNewSession();
    }
  };

  const handleNewSession = async () => {
    try {
      setIsSessionLoading(true);
      await createNewSession();
      setIsSidebarOpen(false);
    } catch (err) {
      setError('Failed to create new session. Please try again.');
    } finally {
      setIsSessionLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Mock AI response - replace with actual API call
      setTimeout(() => {
        const assistantMessageId = `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`;
        const mockRecommendations: Recommendation[] = [
          {
            type: 'breathing_exercise',
            title: 'Deep Breathing Exercise',
            reason: 'Your message suggests some stress. Try this 4-7-8 breathing technique.',
            urgency: 'medium'
          }
        ];

        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: "Thank you for sharing that with me. I can hear that you're going through something challenging right now. It's completely normal to feel this way, and I want you to know that your feelings are valid. Would you like to tell me more about what's been on your mind?",
          timestamp: new Date().toISOString(),
          safety_alert: 'none',
          recommendations: mockRecommendations,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setCurrentRecommendations(mockRecommendations);
        setIsLoading(false);
        inputRef.current?.focus();
      }, 1500);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setIsLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'song': return <Music className="w-4 h-4 text-purple-600" />;
      case 'doctor': return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'breathing_exercise': return <Wind className="w-4 h-4 text-teal-600" />;
      case 'emergency_contact': return <Phone className="w-4 h-4 text-red-600" />;
      case 'mood_insight': return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      default: return <Heart className="w-4 h-4 text-pink-600" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'high': return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      case 'medium': return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      default: return 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100';
    }
  };

  const getSafetyAlertColor = (alert?: string) => {
    switch (alert) {
      case 'crisis': return 'border-l-4 border-l-red-500 bg-red-50';
      case 'mild': return 'border-l-4 border-l-amber-500 bg-amber-50';
      default: return '';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (isSessionLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-gray-700 font-medium">Starting your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex relative">
      {/* Slideable Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:z-auto`}
      >
        {/* Sidebar Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 lg:hidden text-white hover:bg-white/20 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">MindChat</h2>
              <p className="text-blue-100 text-sm">Your wellness companion</p>
            </div>
          </div>
          
          <button
            onClick={handleNewSession}
            disabled={isSessionLoading}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>
        </div>
        
        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Sessions</h3>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                onClick={() => switchSession(session)}
                className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 group relative ${
                  sessionId === session.session_id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">
                        {formatTime(session.last_activity)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 truncate">
                      {session.preview || 'New conversation'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.message_count} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteSession(session.session_id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all duration-200"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Crisis Support */}
        <div className="p-4 bg-red-50 border-t border-red-100">
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="w-4 h-4 text-red-600" />
            <h3 className="font-semibold text-gray-800 text-sm">Crisis Support</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            If you're in immediate danger, please contact emergency services.
          </p>
          <div className="text-xs space-y-1">
            <div className="font-medium text-red-700">Emergency: 911</div>
            <div className="text-gray-600">Crisis Text: Text HOME to 741741</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Chat Session</h1>
                <p className="text-gray-600 text-sm">Share your thoughts in this safe space</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsRecommendationsOpen(!isRecommendationsOpen)}
                className="md:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600 hidden sm:block">Connected</span>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-gray-500 mt-8">
                  <div className="bg-white/80 p-6 rounded-xl shadow-sm border max-w-md mx-auto">
                    <Bot className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-800 mb-2">Welcome to MindChat</p>
                    <p className="text-gray-600 text-sm">
                      I'm here to listen and support you. Share how you're feeling today.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-blue-500 ml-2' 
                        : 'bg-indigo-500 mr-2'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className={`rounded-xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : `bg-white text-gray-800 border ${getSafetyAlertColor(message.safety_alert)}`
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.safety_alert && message.safety_alert !== 'none' && (
                        <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block font-medium ${
                          message.safety_alert === 'crisis' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          🚨 {message.safety_alert}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 mr-2 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white rounded-xl px-4 py-3 border shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder="Share your thoughts here..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-800"
                  disabled={isLoading || !sessionId}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading || !sessionId}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations Panel */}
          <div className={`${isRecommendationsOpen ? 'block' : 'hidden'} md:block w-64 bg-white border-l border-gray-200 flex flex-col`}>
            <div className="p-4 bg-purple-50 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Recommendations</h3>
                </div>
                <button
                  onClick={() => setIsRecommendationsOpen(false)}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-purple-600 text-xs mt-1">Personalized for you</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentRecommendations.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <Heart className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                    <p className="text-sm font-medium text-gray-700 mb-2">Personalized Care</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      As we chat, I'll suggest helpful resources and activities tailored for you.
                    </p>
                  </div>
                </div>
              ) : (
                currentRecommendations.map((rec, index) => (
                  <div
                    key={`rec_${index}_${rec.type}_${rec.title.replace(/\s+/g, '_')}`}
                    className={`border rounded-lg p-4 transition-colors cursor-pointer ${getUrgencyColor(rec.urgency)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 p-1.5 bg-white rounded-lg shadow-sm">
                        {getRecommendationIcon(rec.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">{rec.title}</h4>
                        <p className="text-xs text-gray-700 mb-2 leading-relaxed">{rec.reason}</p>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block font-medium ${
                          rec.urgency === 'immediate' ? 'bg-red-200 text-red-800' :
                          rec.urgency === 'high' ? 'bg-orange-200 text-orange-800' :
                          rec.urgency === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-emerald-200 text-emerald-800'
                        }`}>
                          {rec.urgency.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}