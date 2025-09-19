"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQueryState } from "nuqs";
import {
  Message,
  Recommendation,
  ChatResponse,
  ApiMessage,
  MessageHistoryResponse,
} from "@/app/dashboard/chat/dataType";
import ChatSidebar from "./ChatSidebar";
import MainBody from "./MainBody";
import RecommendationsPanel from "./RecommendationsPanel";
import ChatContainerLoader from "./ChatContainerLoader";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { sessionCache } from "@/util/sessionCache";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/genai/gemini`;

const ChatContainer = () => {
  const [sessionId, setSessionId] = useQueryState("session");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [currentRecommendations, setCurrentRecommendations] = useState<
    Recommendation[]
  >([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentMessagePage, setCurrentMessagePage] = useState(1);
  
  // Add ref to track if initialization has occurred
  const initializationRef = useRef(false);
  
  // Use the session validation hook
  const { getValidSession, forceRefreshSession } = useSessionValidation();

  const transformApiMessagesToUI = useCallback(
    (apiMessages: ApiMessage[]): Message[] => {
      const uiMessages: Message[] = [];

      apiMessages.forEach((apiMsg) => {
        uiMessages.push({
          id: `${apiMsg._id}-user`,
          role: "user",
          content: apiMsg.user_message,
          timestamp: apiMsg.timestamp,
        });

        uiMessages.push({
          id: `${apiMsg._id}-assistant`,
          role: "assistant",
          content: apiMsg.ai_response,
          timestamp: apiMsg.timestamp,
          safety_alert: apiMsg.metadata.safety_alert,
          recommendations: apiMsg.metadata.recommendations,
        });
      });

      return uiMessages;
    },
    []
  );

  const createNewSession = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/session/new`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.success && data.data?.session_id) {
      const newSessionId = data.data.session_id;
      setSessionId(newSessionId);
      setMessages([]);
      setCurrentRecommendations([]);
      setHasMoreMessages(false);
      setCurrentMessagePage(1);
      setError(null);
      
      // Cache the new session
      sessionCache.cacheSession(newSessionId);
    }
  }, [setSessionId]);

  const loadSessionHistory = useCallback(
    async (sessionId: string, page: number = 1, append: boolean = false) => {
      const response = await fetch(
        `${API_BASE_URL}/session/${sessionId}?page=${page}&per_page=20`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

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
        const formattedMessages = transformApiMessagesToUI(
          historyData.messages
        );

        if (append) {
          setMessages((prev) => [...formattedMessages, ...prev]);
        } else {
          setMessages(formattedMessages);
          setCurrentMessagePage(1);
        }

        setHasMoreMessages(historyData.has_more || false);

        if (historyData.messages.length > 0) {
          const lastApiMessage =
            historyData.messages[historyData.messages.length - 1];
          if (lastApiMessage.metadata.recommendations) {
            setCurrentRecommendations(lastApiMessage.metadata.recommendations);
          }
        } else {
          setCurrentRecommendations([]);
        }
      }
    },
    [transformApiMessagesToUI, createNewSession]
  );

  const handleNewSession = useCallback(async () => {
    try {
      setIsSessionLoading(true);
      initializationRef.current = false; // Reset initialization flag for new session
      
      // Use forceRefreshSession to clear cache and create new session
      const result = await forceRefreshSession();
      
      if (result.isValidSession && result.sessionId) {
        setSessionId(result.sessionId);
        setMessages([]);
        setCurrentRecommendations([]);
        setHasMoreMessages(false);
        setCurrentMessagePage(1);
        setError(null);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        throw new Error(result.error || "Failed to create session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsSessionLoading(false);
    }
  }, [forceRefreshSession, setSessionId]);

  const handleSessionSelect = useCallback(
    async (selectedSessionId: string) => {
      if (selectedSessionId === sessionId) return;

      try {
        setIsSessionLoading(true);
        setError(null);
        initializationRef.current = false; // Reset initialization flag for new session
        setSessionId(selectedSessionId);
        
        // Cache the selected session
        sessionCache.cacheSession(selectedSessionId);
        
        await loadSessionHistory(selectedSessionId);
      } catch (err) {
        setError("Failed to load session");
      } finally {
        setIsSessionLoading(false);
      }
    },
    [sessionId, setSessionId, loadSessionHistory]
  );

  const handleLoadMoreMessages = useCallback(
    async (page: number): Promise<boolean> => {
      if (!sessionId || isLoadingMessages) return false;

      try {
        setIsLoadingMessages(true);
        await loadSessionHistory(sessionId, page, true);
        setCurrentMessagePage(page);
        return hasMoreMessages;
      } catch (err) {
        console.error("Failed to load messages:", err);
        return false;
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [sessionId, isLoadingMessages, loadSessionHistory, hasMoreMessages]
  );

  const sendMessage = useCallback(
    async (e: React.FormEvent | React.MouseEvent) => {
      e.preventDefault();

      if (!inputMessage.trim() || isLoading || !sessionId) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: inputMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
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
            role: "assistant",
            content: chatResponse.message,
            timestamp: new Date().toISOString(),
            safety_alert: chatResponse.safety_alert,
            recommendations: chatResponse.recommendations,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setCurrentRecommendations(chatResponse.recommendations);
          
          // Update the session cache since we had a successful interaction
          sessionCache.cacheSession(sessionId);
        }
      } catch (err) {
        setError("Failed to send message");
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [inputMessage, isLoading, sessionId]
  );

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) return;
    
    const initialize = async () => {
      try {
        setIsSessionLoading(true);
        setError(null);
        initializationRef.current = true;

        let targetSessionId: string | null = null;

        if (sessionId) {
          // If there's a sessionId in the URL, try to use it
          try {
            const response = await fetch(
              `${API_BASE_URL}/session/${sessionId}?page=1&per_page=20`,
              {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.messages) {
                // URL session is valid, use it and cache it
                targetSessionId = sessionId;
                sessionCache.cacheSession(sessionId);
                
                const historyData: MessageHistoryResponse = data.data;
                const formattedMessages = transformApiMessagesToUI(
                  historyData.messages
                );

                setMessages(formattedMessages);
                setCurrentMessagePage(1);
                setHasMoreMessages(historyData.has_more || false);

                if (historyData.messages.length > 0) {
                  const lastApiMessage =
                    historyData.messages[historyData.messages.length - 1];
                  if (lastApiMessage.metadata.recommendations) {
                    setCurrentRecommendations(lastApiMessage.metadata.recommendations);
                  }
                } else {
                  setCurrentRecommendations([]);
                }
              }
            } else if (response.status === 404) {
              // URL session doesn't exist, continue to get/create a valid session
              targetSessionId = null;
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } catch (err) {
            console.warn("Failed to load session from URL, will get/create new session");
            targetSessionId = null;
          }
        }

        // If we don't have a valid session from URL, get one from cache or create new
        if (!targetSessionId) {
          const result = await getValidSession();
          
          if (result.isValidSession && result.sessionId) {
            targetSessionId = result.sessionId;
            setSessionId(result.sessionId);
            
            // If it's a cached session, load its history
            if (!result.needsNewSession) {
              try {
                const response = await fetch(
                  `${API_BASE_URL}/session/${result.sessionId}?page=1&per_page=20`,
                  {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                  }
                );

                if (response.ok) {
                  const data = await response.json();
                  if (data.success && data.data?.messages) {
                    const historyData: MessageHistoryResponse = data.data;
                    const formattedMessages = transformApiMessagesToUI(
                      historyData.messages
                    );

                    setMessages(formattedMessages);
                    setCurrentMessagePage(1);
                    setHasMoreMessages(historyData.has_more || false);

                    if (historyData.messages.length > 0) {
                      const lastApiMessage =
                        historyData.messages[historyData.messages.length - 1];
                      if (lastApiMessage.metadata.recommendations) {
                        setCurrentRecommendations(lastApiMessage.metadata.recommendations);
                      }
                    } else {
                      setCurrentRecommendations([]);
                    }
                  }
                }
              } catch (err) {
                console.warn("Failed to load cached session history:", err);
                // Continue with empty session
                setMessages([]);
                setCurrentRecommendations([]);
                setHasMoreMessages(false);
                setCurrentMessagePage(1);
              }
            } else {
              // New session, start with empty state
              setMessages([]);
              setCurrentRecommendations([]);
              setHasMoreMessages(false);
              setCurrentMessagePage(1);
            }
          } else {
            throw new Error(result.error || "Failed to get valid session");
          }
        }
      } catch (err) {
        setError("Failed to initialize session");
        console.error("Session initialization error:", err);
        initializationRef.current = false; // Reset on error to allow retry
      } finally {
        setIsSessionLoading(false);
      }
    };

    initialize();
  }, [sessionId, setSessionId, transformApiMessagesToUI, getValidSession]);

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
