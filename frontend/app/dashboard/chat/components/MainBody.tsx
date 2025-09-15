import { Send, Bot, User, AlertTriangle, Loader2, Sparkles, ChevronUp } from 'lucide-react';
import { Message } from '../dataType';
import { useRef, useEffect, useState } from 'react';

interface MainBodyProps {
  sessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  sendMessage: (e: React.FormEvent | React.MouseEvent) => void;
  onLoadMoreMessages?: (page: number) => Promise<boolean>; // Returns true if more messages loaded
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
  const [isNearTop, setIsNearTop] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 50;
    const isNearTopThreshold = scrollTop < 100;

    setShowScrollToBottom(!isScrolledToBottom);
    setIsNearTop(isNearTopThreshold);

    // Load more messages when scrolled near the top
    if (isNearTopThreshold && hasMoreMessages && !isLoadingMessages && onLoadMoreMessages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onLoadMoreMessages(nextPage).then((hasMore) => {
        // If no more messages, hasMoreMessages will be updated by parent
      });
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentPage, hasMoreMessages, isLoadingMessages]);

  useEffect(() => {
    // Auto-scroll to bottom for new messages, but not when loading older messages
    if (!isLoadingMessages) {
      scrollToBottom();
    }
  }, [messages.length, isLoading]);

  const getSafetyAlertColor = (alert?: string) => {
    switch (alert) {
      case 'crisis': return 'border-l-4 border-l-red-500 bg-red-50';
      case 'mild': return 'border-l-4 border-l-amber-500 bg-amber-50';
      default: return '';
    }
  };

    return(
        <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm relative">
          
          <div className="bg-white/80 backdrop-blur-lg border-b border-indigo-100 px-8 py-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Chat Session</h1>
                <p className="text-gray-600 text-sm mt-1">Share your thoughts in this safe space</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Connected</span>
                </div>
                {messages.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-sm">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Scrollable Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-8 space-y-6"
            style={{ 
              scrollBehavior: 'smooth',
              maxHeight: 'calc(100vh - 300px)' // Adjust based on header and input heights
            }}
          >
            {/* Load More Messages Indicator */}
            {isLoadingMessages && (
              <div className="text-center py-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/80 rounded-full shadow-lg border border-indigo-200">
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-indigo-600" />
                  <span className="text-sm text-indigo-600 font-medium">Loading more messages...</span>
                </div>
              </div>
            )}

            {/* No More Messages Indicator */}
            {!hasMoreMessages && messages.length > 10 && (
              <div className="text-center py-4">
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-xs text-gray-500">Beginning of conversation</span>
                </div>
              </div>
            )}
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 mt-12">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-indigo-100 max-w-md mx-auto">
                  <div className="relative mb-6">
                    <Bot className="w-16 h-16 mx-auto text-indigo-400" />
                    <Sparkles className="w-6 h-6 text-purple-500 absolute -top-2 -right-4 animate-pulse" />
                  </div>
                  <p className="text-xl font-semibold text-gray-800 mb-3">Welcome to MindChat</p>
                  <p className="text-gray-600 leading-relaxed">
                    I'm here to listen and support you. Share how you're feeling today, and let's start this conversation together.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message,index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 ml-3' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 mr-3'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  <div className={`rounded-2xl px-6 py-4 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : `bg-white text-gray-800 border border-gray-200 ${getSafetyAlertColor(message.safety_alert)}`
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.safety_alert && message.safety_alert !== 'none' && (
                      <div className={`mt-3 text-xs px-3 py-2 rounded-full inline-block font-medium ${
                        message.safety_alert === 'crisis' 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        🚨 Safety Alert: {message.safety_alert}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mr-3 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl px-6 py-4 border border-gray-200 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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

          <div className="bg-white/80 backdrop-blur-lg border-t border-indigo-100 p-8">
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
                  className="w-full px-6 py-4 border-2 border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                  disabled={isLoading || !sessionId}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || !sessionId}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            
            {/* Pagination Info */}
            {messages.length > 0 && (
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">
                  {hasMoreMessages ? `Showing recent messages • Scroll up for more` : `All messages loaded`}
                </span>
              </div>
            )}
          </div>
        </div>
    );
}

export default MainBody;