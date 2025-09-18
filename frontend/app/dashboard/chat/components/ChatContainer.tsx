'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useQueryState } from 'nuqs';
import { Message, Recommendation, ChatResponse, ApiMessage, MessageHistoryResponse } from '../dataType';
import ChatSidebar from './ChatSidebar';
import MainBody from './MainBody';
import RecommendationsPanel from './RecommendationsPanel';
import ChatContainerLoader from './ChatContainerLoader';

const API_BASE_URL = 'http://localhost:8080/api/v1/genai/gemini';

const ChatContainer = () => {
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

  const transformApiMessagesToUI = useCallback((apiMessages: ApiMessage[]): Message[] => {
    const uiMessages: Message[] = [];
    
    apiMessages.forEach((apiMsg) => {
      uiMessages.push({
        id: `${apiMsg._id}-user`,
        role: 'user',
        content: apiMsg.user_message,
        timestamp: apiMsg.timestamp,
      });

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
  }, []);

  const createNewSession = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/session/new`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    if (data.success && data.data?.session_id) {
      setSessionId(data.data.session_id);
      setMessages([]);
      setCurrentRecommendations([]);
      setHasMoreMessages(false);
      setCurrentMessagePage(1);
      setError(null);
    }
  }, [setSessionId]);

  const loadSessionHistory = useCallback(async (sessionId: string, page: number = 1, append: boolean = false) => {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}?page=${page}&per_page=20`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        await createNewSession();
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data?.messages) {
      const historyData: MessageHistoryResponse = data.data;
      const formattedMessages = transformApiMessagesToUI(historyData.messages);
      
      if (append) {
        setMessages(prev => [...formattedMessages, ...prev]);
      } else {
        setMessages(formattedMessages);
        setCurrentMessagePage(1);
      }
      
      setHasMoreMessages(historyData.has_more || false);
      
      if (historyData.messages.length > 0) {
        const lastApiMessage = historyData.messages[historyData.messages.length - 1];
        if (lastApiMessage.metadata.recommendations) {
          setCurrentRecommendations(lastApiMessage.metadata.recommendations);
        }
      } else {
        setCurrentRecommendations([]);
      }
    }
  }, [transformApiMessagesToUI, createNewSession]);

  const initializeSession = useCallback(async () => {
    try {
      setIsSessionLoading(true);
      setError(null);

      if (sessionId) {
        await loadSessionHistory(sessionId);
      } else {
        await createNewSession();
      }
    } catch (err) {
      setError('Failed to initialize session');
      console.error('Session error:', err);
    } finally {
      setIsSessionLoading(false);
    }
  }, [sessionId, loadSessionHistory, createNewSession]);

  const handleNewSession = useCallback(async () => {
    try {
      setIsSessionLoading(true);
      await createNewSession();
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError('Failed to create session');
    } finally {
      setIsSessionLoading(false);
    }
  }, [createNewSession]);

  const handleSessionSelect = useCallback(async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;

    try {
      setIsSessionLoading(true);
      setError(null);
      setSessionId(selectedSessionId);
      await loadSessionHistory(selectedSessionId);
    } catch (err) {
      setError('Failed to load session');
    } finally {
      setIsSessionLoading(false);
    }
  }, [sessionId, setSessionId, loadSessionHistory]);

  const handleLoadMoreMessages = useCallback(async (page: number): Promise<boolean> => {
    if (!sessionId || isLoadingMessages) return false;

    try {
      setIsLoadingMessages(true);
      await loadSessionHistory(sessionId, page, true);
      setCurrentMessagePage(page);
      return hasMoreMessages;
    } catch (err) {
      console.error('Failed to load messages:', err);
      return false;
    } finally {
      setIsLoadingMessages(false);
    }
  }, [sessionId, isLoadingMessages, loadSessionHistory, hasMoreMessages]);

  const sendMessage = useCallback(async (e: React.FormEvent | React.MouseEvent) => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage.content,
          session_id: sessionId,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
      }
    } catch (err) {
      setError('Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, sessionId]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  if (isSessionLoading) return <ChatContainerLoader />;

  return (
    <div className="flex h-screen">
      <ChatSidebar 
        sessionId={sessionId} 
        onNewSession={handleNewSession} 
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
  );
};

export default ChatContainer;