'use client';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import { Message, SessionResponse } from '../dataType';
import { useState, useEffect } from 'react';

interface ChatSidebarProps {
  sessionId: string | null;
  messages: Message[];
  isSessionLoading: boolean;
  error: string | null;
  handleNewSession: () => void;
  onSessionSelect: (sessionId: string) => void;
  refreshTrigger?: number;
}

const API_BASE_URL = 'http://localhost:8080/api/v1/genai/gemini';

const ChatSidebar = ({ 
    sessionId, messages, isSessionLoading, 
    error, handleNewSession, onSessionSelect, 
    refreshTrigger = 0 }: ChatSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userSessions, setUserSessions] = useState<SessionResponse[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSessionLoading, setSelectedSessionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUserSessions();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchUserSessions();
    }
  }, [refreshTrigger]);

  const fetchUserSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await fetch(`${API_BASE_URL}/user-sessions`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setUserSessions(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSessionClick = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId || isSessionLoading) {
      return; 
    }

    setSelectedSessionLoading(selectedSessionId);
    try {
      await onSessionSelect(selectedSessionId);
    } finally {
      setSelectedSessionLoading(null);
    }
  };

  const getSessionStatus = (session: SessionResponse) => {
    if (!session.last_message) {
      return { status: 'Empty', color: 'text-gray-500' };
    }
    
    const crisisKeywords = ['kill', 'suicide', 'die', 'hurt', 'harm'];
    const hasKeyword = crisisKeywords.some(keyword => 
      session.last_message?.toLowerCase().includes(keyword)
    );
    
    if (hasKeyword) {
      return { status: '🚨 Crisis', color: 'text-red-600 font-semibold' };
    }
    
    return { status: 'Active', color: 'text-green-600' };
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-72'} bg-white/80 backdrop-blur-lg border-r border-indigo-100 flex flex-col shadow-xl transition-all duration-300 ease-in-out relative`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className={`flex items-center space-x-3 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="p-2 bg-white/20 rounded-full">
            <MessageSquare className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold">MindChat</h2>
              <p className="text-blue-100 text-sm">Your wellness companion</p>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <button
            onClick={handleNewSession}
            disabled={isSessionLoading}
            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 border border-white/20 hover:border-white/40"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Session</span>
          </button>
        )}
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        {!isCollapsed ? (
          <div className="space-y-4">

            {/* Session History */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Previous Sessions</span>
                </h3>
                <button
                  onClick={fetchUserSessions}
                  disabled={sessionsLoading}
                  className="p-1 hover:bg-purple-200 rounded-full transition-colors duration-200"
                  title="Refresh sessions"
                >
                  <RefreshCw className={`w-3 h-3 text-purple-600 ${sessionsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {/* Session Stats */}
              <div className="mb-3 p-2 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Total Sessions:</span>
                  <span className="font-semibold text-purple-700">{userSessions.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-600">Active Sessions:</span>
                  <span className="font-semibold text-green-600">
                    {userSessions.filter(s => s.last_message).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-600">Crisis Sessions:</span>
                  <span className="font-semibold text-red-600">
                    {userSessions.filter(s => getSessionStatus(s).status.includes('Crisis')).length}
                  </span>
                </div>
              </div>
              
              {sessionsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">Loading sessions...</p>
                </div>
              ) : userSessions.length === 0 ? (
                <p className="text-xs text-gray-600">No previous sessions found</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userSessions.slice(0, 10).map((session) => {
                    const sessionStatus = getSessionStatus(session);
                    const isCurrentSession = sessionId === session.session_id;
                    const isLoadingSession = selectedSessionLoading === session.session_id;
                    
                    return (
                      <div
                        key={session.session_id}
                        onClick={() => handleSessionClick(session.session_id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border relative ${
                          isCurrentSession
                            ? 'bg-purple-200 border-purple-300 ring-2 ring-purple-400'
                            : isLoadingSession 
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-white border-purple-200 hover:bg-purple-50 hover:scale-105'
                        } ${isSessionLoading || isLoadingSession ? 'opacity-75' : ''}`}
                      >
                        {isLoadingSession && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {formatDate(session.metadata.created_at)}
                          </span>
                          <span className={`text-xs ${sessionStatus.color}`}>
                            {sessionStatus.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(session.last_activity)}
                          </span>
                          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">
                            {session.session_id.substring(0, 6)}...
                          </code>
                        </div>
                        {session.last_message && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <p className="text-gray-600 truncate" title={session.last_message}>
                              {session.last_message.length > 35 
                                ? session.last_message.substring(0, 35) + '...' 
                                : session.last_message
                              }
                            </p>
                          </div>
                        )}
                        
                        {isCurrentSession && (
                          <div className="absolute -right-1 -top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white">
                            <div className="w-full h-full bg-purple-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Privacy & Safety */}
            
          </div>
        ) : (
          /* Collapsed view with only message icon to expand */
          <div className="flex flex-col items-center justify-center h-full">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 rounded-lg transition-all duration-200 transform hover:scale-110"
              title="Expand sidebar"
            >
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Expand
            </p>
          </div>
        )}
      </div>
      
    </div>
    )
}

export default ChatSidebar;