'use client';
import React, { useState, useEffect } from 'react';
import { useQueryState } from 'nuqs';
import { Loader2, Sparkles } from 'lucide-react';
import { Message, Recommendation, ChatResponse, ApiMessage, MessageHistoryResponse } from './dataType';
import ChatSidebar from './components/ChatSidebar';
import MainBody from './components/MainBody';
import RecommendationsPanel from './components/RecommendationsPanel';

const API_BASE_URL = 'http://localhost:8080/api/v1/genai/gemini';

export default function MentalHealthChat() {
  const [sessionId, setSessionId] = useQueryState('session');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [currentRecommendations, setCurrentRecommendations] = useState<Recommendation[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentMessagePage, setCurrentMessagePage] = useState(1);

  useEffect(() => {
    initializeSession();
  }, []);

  // Helper function to transform API messages to UI format
  const transformApiMessagesToUI = (apiMessages: ApiMessage[]): Message[] => {
    const uiMessages: Message[] = [];
    
    apiMessages.forEach((apiMsg) => {
      // Add user message
      uiMessages.push({
        id: `${apiMsg._id}-user`,
        role: 'user',
        content: apiMsg.user_message,
        timestamp: apiMsg.timestamp,
      });

      // Add assistant message
      uiMessages.push({
        id: `${apiMsg._id}-assistant`,
        role: 'assistant',
        content: apiMsg.ai_response,
        timestamp: apiMsg.timestamp,
        safety_alert: apiMsg.metadata.safety_alert,
        recommendations: apiMsg.metadata.recommendations,
      });
    });

    return uiMessages;
  };

  const initializeSession = async () => {
    try {
      setIsSessionLoading(true);
      setError(null);

      if (sessionId) {
        await loadSessionHistory(sessionId);
      } else {
        await createNewSession();
      }
    } catch (err) {
      setError('Failed to initialize chat session. Please refresh the page.');
      console.error('Session initialization error:', err);
    } finally {
      setIsSessionLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/session/new`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.session_id) {
        setSessionId(data.data.session_id);
        setMessages([]);
        setCurrentRecommendations([]);
        setHasMoreMessages(false);
        setCurrentMessagePage(1);
        setError(null);
      } else {
        throw new Error('Invalid session creation response');
      }
    } catch (err) {
      console.error('Failed to create session:', err);
      throw err;
    }
  };

  const handleNewSession = async () => {
    try {
      setIsSessionLoading(true);
      await createNewSession();
      // Trigger refresh of the sidebar sessions
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError('Failed to create new session. Please try again.');
    } finally {
      setIsSessionLoading(false);
    }
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) {
      return; // Don't reload if it's the same session
    }

    try {
      setIsSessionLoading(true);
      setError(null);
      
      // Update URL first
      setSessionId(selectedSessionId);
      
      // Load session history
      await loadSessionHistory(selectedSessionId);
    } catch (err) {
      setError('Failed to load selected session. Please try again.');
      console.error('Error selecting session:', err);
    } finally {
      setIsSessionLoading(false);
    }
  };

  const handleLoadMoreMessages = async (page: number): Promise<boolean> => {
    if (!sessionId || isLoadingMessages) {
      return false;
    }

    try {
      setIsLoadingMessages(true);
      await loadSessionHistory(sessionId, page, true); // append = true
      setCurrentMessagePage(page);
      return hasMoreMessages;
    } catch (err) {
      console.error('Failed to load more messages:', err);
      return false;
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const refreshSessions = () => {
    // This will trigger a re-render of the ChatSidebar component
    // The ChatSidebar will handle its own session refreshing
  };

  const loadSessionHistory = async (sessionId: string, page: number = 1, append: boolean = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/session/${sessionId}?page=${page}&per_page=20`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          await createNewSession();
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.messages) {
        const historyData: MessageHistoryResponse = data.data;
        const formattedMessages = transformApiMessagesToUI(historyData.messages);
        
        if (append) {
          // Prepend older messages to the beginning
          setMessages(prev => [...formattedMessages, ...prev]);
        } else {
          // Replace all messages (for new session or initial load)
          setMessages(formattedMessages);
          setCurrentMessagePage(1);
        }
        
        // Update pagination state
        setHasMoreMessages(historyData.has_more || false);
        
        // Get recommendations from the last assistant message
        if (historyData.messages.length > 0) {
          const lastApiMessage = historyData.messages[historyData.messages.length - 1];
          if (lastApiMessage.metadata.recommendations) {
            setCurrentRecommendations(lastApiMessage.metadata.recommendations);
          }
        } else {
          setCurrentRecommendations([]);
        }
      }
    } catch (err) {
      console.error('Failed to load session history:', err);
      throw err;
    }
  };

  const sendMessage = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const chatResponse: ChatResponse = data.data;
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: chatResponse.message,
          timestamp: new Date().toISOString(),
          safety_alert: chatResponse.safety_alert,
          recommendations: chatResponse.recommendations,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setCurrentRecommendations(chatResponse.recommendations);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="relative mb-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
            <Sparkles className="w-6 h-6 text-purple-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-gray-700 text-lg font-medium">Starting your mental health session...</p>
          <p className="text-gray-500 text-sm mt-2">Creating a safe space for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ">
      <div className="max-w-7xl mx-auto flex h-full">

        <ChatSidebar 
          sessionId={sessionId} 
          messages={messages} 
          handleNewSession={handleNewSession} 
          isSessionLoading={isSessionLoading} 
          error={error}
          onSessionSelect={handleSessionSelect}
          refreshTrigger={refreshTrigger}
        />

        <MainBody
          sessionId={sessionId}
          messages={messages}
          isLoading={isLoading}
          error={error}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          sendMessage={sendMessage}
          onLoadMoreMessages={handleLoadMoreMessages}
          hasMoreMessages={hasMoreMessages}
          isLoadingMessages={isLoadingMessages}
        />

        <RecommendationsPanel recommendations={currentRecommendations} />
      </div>
    </div>
  );
}