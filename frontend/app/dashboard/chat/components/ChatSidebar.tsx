'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, ChevronLeft, ChevronRight, MoreHorizontal, RefreshCw } from 'lucide-react';
import { SessionResponse } from '../dataType';

interface ChatSidebarProps {
  sessionId: string | null;
  onNewSession: () => void;
  onSessionSelect: (sessionId: string) => void;
  refreshTrigger?: number;
}

const API_BASE_URL = 'http://localhost:8080/api/v1/genai/gemini';

const ChatSidebar = ({ sessionId, onNewSession, onSessionSelect, refreshTrigger = 0 }: ChatSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userSessions, setUserSessions] = useState<SessionResponse[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedSessionLoading, setSelectedSessionLoading] = useState<string | null>(null);

  const fetchUserSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const response = await fetch(`${API_BASE_URL}/user-sessions`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setUserSessions(data.data.slice(0, 50));
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const handleSessionClick = useCallback(async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;
    
    setSelectedSessionLoading(selectedSessionId);
    try {
      await onSessionSelect(selectedSessionId);
    } finally {
      setSelectedSessionLoading(null);
    }
  }, [sessionId, onSessionSelect]);

  const formatSessionPreview = useCallback((session: SessionResponse) => {
    if (!session.last_message) return 'New conversation';
    return session.last_message.slice(0, 50) + (session.last_message.length > 50 ? '...' : '');
  }, []);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }, []);

  useEffect(() => {
    fetchUserSessions();
  }, [fetchUserSessions]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchUserSessions();
    }
  }, [refreshTrigger, fetchUserSessions]);

  return (
    <div className={`${isCollapsed ? 'w-14' : 'w-80'} h-screen bg-gradient-to-b from-blue-300 via-purple-300 to-pink-300 border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden`}>
      
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">MindChat</h2>
                <p className="text-slate-400 text-xs">Wellness companion</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!isCollapsed && (
          <button
            onClick={onNewSession}
            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-blue-900 py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 border border-white/10 hover:border-white/20 group"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">New conversation</span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-hidden">
        {isCollapsed ? (
          <div className="flex flex-col items-center pt-6 space-y-4">
            <button
              onClick={onNewSession}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors text-slate-400 hover:text-white"
              title="New conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
            
            <div className="space-y-2">
              {userSessions.slice(0, 8).map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => handleSessionClick(session.session_id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    sessionId === session.session_id 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                      : 'bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white'
                  }`}
                  title={formatSessionPreview(session)}
                >
                  <MessageSquare className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-2 py-4 space-y-2">
            {sessionsLoading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-400 text-xs">Loading conversations...</p>
              </div>
            ) : userSessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-xs">No conversations yet</p>
                <p className="text-slate-500 text-xs mt-1">Start a new one above</p>
              </div>
            ) : (
              <>
                {userSessions.map((session) => {
                  const isCurrentSession = sessionId === session.session_id;
                  const isLoadingSession = selectedSessionLoading === session.session_id;
                  
                  return (
                    <div
                      key={session.session_id}
                      onClick={() => handleSessionClick(session.session_id)}
                      className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        isCurrentSession
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-slate-600/50'
                      }`}
                    >
                      {isLoadingSession && (
                        <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <MessageSquare className={`w-3 h-3 flex-shrink-0 ${
                              isCurrentSession ? 'text-indigo-400' : 'text-slate-500'
                            }`} />
                            <span className={`text-xs font-medium truncate ${
                              isCurrentSession ? 'text-white' : 'text-slate-300'
                            }`}>
                              {formatTime(session.metadata.created_at)}
                            </span>
                          </div>
                          
                          <p className={`text-sm truncate leading-relaxed ${
                            isCurrentSession ? 'text-slate-200' : 'text-slate-400'
                          }`}>
                            {formatSessionPreview(session)}
                          </p>
                        </div>

                        <button className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity ${
                          isCurrentSession ? 'hover:bg-white/20' : 'hover:bg-slate-600'
                        }`}>
                          <MoreHorizontal className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>

                      {isCurrentSession && (
                        <div className="absolute -left-1 top-3 w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="flex-shrink-0 p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{userSessions.length} conversations</span>
            <button 
              onClick={fetchUserSessions}
              disabled={sessionsLoading}
              className="hover:text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3 h-3 ${sessionsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;