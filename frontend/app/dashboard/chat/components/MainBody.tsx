'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, ChevronUp, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Message } from '../dataType';
import MainBodyHeader from './MainBodyHeader';

interface MainBodyProps {
  sessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  sendMessage: (e: React.FormEvent | React.MouseEvent) => void;
  onLoadMoreMessages?: (page: number) => Promise<boolean>;
  hasMoreMessages?: boolean;
  isLoadingMessages?: boolean;
}

const MainBody = ({
  sessionId, messages, isLoading, error, inputMessage,
  setInputMessage, sendMessage, onLoadMoreMessages,
  hasMoreMessages = false, isLoadingMessages = false
}: MainBodyProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 50;
    const isNearTop = scrollTop < 100;

    setShowScrollToBottom(!isScrolledToBottom);

    if (isNearTop && hasMoreMessages && !isLoadingMessages && onLoadMoreMessages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onLoadMoreMessages(nextPage);
    }
  }, [currentPage, hasMoreMessages, isLoadingMessages, onLoadMoreMessages]);

  const getSafetyAlertColor = useCallback((alert?: string) => {
    switch (alert) {
      case 'crisis': return 'border-l-4 border-l-red-500 bg-red-50/80';
      case 'mild': return 'border-l-4 border-l-amber-500 bg-amber-50/80';
      default: return '';
    }
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (!isLoadingMessages) scrollToBottom();
  }, [messages.length, isLoading, scrollToBottom, isLoadingMessages]);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-white/95 via-blue-50/80 to-indigo-50/60 backdrop-blur-sm relative h-screen">

      {/* Header */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-indigo-100/50 px-8 py-6 shadow-sm">
        <MainBodyHeader messages={messages} />
        {error && (
          <div className="mt-4 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-2xl flex items-center shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <span className="text-red-700 text-sm font-medium">{error}</span>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-8 space-y-6"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Load More Indicator */}
        {isLoadingMessages && (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-indigo-200/50">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-indigo-600" />
              <span className="text-sm text-indigo-600 font-medium">Loading more messages...</span>
            </div>
          </div>
        )}

        {/* Beginning of Conversation */}
        {!hasMoreMessages && messages.length > 10 && (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-4 py-2 bg-slate-100/80 backdrop-blur-sm rounded-full">
              <span className="text-xs text-slate-500">Beginning of conversation</span>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-slate-500 mt-12">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-indigo-100/50 max-w-md mx-auto">
              <div className="relative mb-6">
                <Bot className="w-16 h-16 mx-auto text-indigo-400" />
                <Sparkles className="w-6 h-6 text-purple-500 absolute -top-2 -right-4 animate-pulse" />
              </div>
              <p className="text-xl font-semibold text-slate-800 mb-3">Welcome to MindChat</p>
              <p className="text-slate-600 leading-relaxed">
                I'm here to listen and support you. Share how you're feeling today, and let's start this conversation together.
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 ml-3'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 mr-3'
                }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              <div className={`rounded-3xl px-6 py-4 shadow-lg backdrop-blur-sm ${message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : `bg-white/90 text-slate-800 border border-slate-200/50 ${getSafetyAlertColor(message.safety_alert)}`
                }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Message */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mr-3 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-6 py-4 border border-slate-200/50 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-slate-500 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 right-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 z-10"
          title="Scroll to bottom"
        >
          <ChevronUp className="w-5 h-5 rotate-180" />
        </button>
      )}

      {/* Input Section */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-indigo-100/50 p-8">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              placeholder="Share your thoughts here..."
              className="w-full px-6 py-4 border-2 border-indigo-200/50 rounded-3xl focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-400/50 transition-all duration-200 bg-white/80 backdrop-blur-sm text-slate-800 placeholder-slate-500 shadow-sm"
              disabled={isLoading || !sessionId}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || !sessionId}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>

        {/* Pagination Info */}
        {messages.length > 0 && (
          <div className="mt-2 text-center">
            <span className="text-xs text-slate-500">
              {hasMoreMessages ? 'Scroll up for more messages' : 'All messages loaded'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainBody;