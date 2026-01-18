'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Send, X, Minimize2, Paperclip, History, MessageSquare,
  Bot, User, Loader2, CreditCard, CheckCircle2, XCircle,
  Calendar, Package, RefreshCw, Trash2, ChevronRight
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ApiResponse {
  id: number;
  user_name: string | null;
  user_message: string | null;
  detected_product: string | null;
  credit_limit: number;
  decision: string | null;
  created_at: string;
}

interface Message {
  user: 'Bot' | 'User';
  message: string;
  timestamp: Date;
  data?: ApiResponse | ApiResponse[];
}

// --- Helper Components Defined Outside to Prevent Re-renders ---

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ResponseCard = ({ item }: { item: ApiResponse }) => {
  const isEligible = item.decision?.toLowerCase() === 'eligible';

  return (
    <div className="mt-3 bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Status Header */}
      <div className={cn(
        "px-4 py-3 flex items-center justify-between border-b",
        isEligible
          ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1967b3] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-[#1967b3]">
              {item.decision || 'Response'}
            </span>
            <p className="text-[10px] text-slate-500">Status</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-400">ID</span>
          <p className="text-sm font-bold text-slate-700">#{item.id}</p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* User Info Row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1967b3] to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
            {item.user_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800 text-base">{item.user_name || 'Test User'}</p>
            <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
              <Calendar className="w-3 h-3" />
              {formatDate(item.created_at)}
            </div>
          </div>
        </div>

        {/* Stats Grid - Simplified for Test */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
              <Package className="w-3.5 h-3.5" />
              Product
            </div>
            <p className="font-semibold text-slate-800 text-sm capitalize truncate">
              {item.detected_product || 'Test Product'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              Limit
            </div>
            <p className="font-bold text-[#1967b3] text-lg">
              ${item.credit_limit?.toLocaleString() || '10,000'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResponseList = ({ items }: { items: ApiResponse[] }) => (
  <div className="space-y-3 mt-2">
    {items.map((item, index) => (
      <ResponseCard key={item.id || index} item={item} />
    ))}
  </div>
);

const HistoryItem = ({ item }: { item: ApiResponse }) => {
  return (
    <div className="bg-white rounded-xl border border-blue-100 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 transition-transform group-hover:scale-105 bg-gradient-to-br from-[#1967b3] to-blue-500 shadow-blue-200">
          {item.user_name?.charAt(0).toUpperCase() || 'T'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-slate-800 truncate">{item.user_name || 'Test User'}</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 bg-blue-100 text-[#1967b3]">
              Test
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600 capitalize flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              {item.detected_product || 'Test Product'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(item.created_at)}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1967b3] group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </div>
  );
};

const HistorySkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-50 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Component ---

export default function ChatBot() {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<ApiResponse[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      user: 'Bot',
      message: "Hello! How can I help you today?",
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');

  // Fetch history when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = () => {
    setHistoryLoading(true);
    // Mock History
    setTimeout(() => {
      setHistoryData([
        {
          id: 101,
          user_name: 'Test History',
          user_message: 'History check',
          detected_product: 'iPhone 15',
          credit_limit: 50000,
          decision: 'Eligible',
          created_at: new Date().toISOString()
        }
      ]);
      setHistoryLoading(false);
    }, 1000);
  };

  const sendMessage = (userMessage: string) => {
    const userMsg: Message = {
      user: 'User',
      message: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Mock Response
    setTimeout(() => {
      const botMsg: Message = {
        user: 'Bot',
        message: "This is a test response.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      user: 'Bot',
      message: "Chat cleared.",
      timestamp: new Date()
    }]);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed z-[9999] w-14 h-14 rounded-2xl transition-all duration-300 flex items-center justify-center',
          'bottom-20 sm:bottom-6 right-4 sm:right-6 bg-gradient-to-br from-[#1967b3] to-blue-500 text-white',
          'shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-110',
          isOpen ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0'
        )}
      >
        <MessageSquare className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Chat Window */}
      <div className={cn(
        'fixed z-[9998] transition-all duration-300 ease-out',
        'bottom-20 sm:bottom-6 right-4 sm:right-6 w-[400px] max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-48px)]',
        isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 pointer-events-none translate-y-4'
      )}>
        <div className="bg-white rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl shadow-blue-100/50 border border-blue-100">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#1967b3] to-blue-500 px-5 py-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center relative backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">Fatafat Assistant</h3>
                  <p className="text-[10px] text-white/80 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-50 border-b border-blue-50">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                'flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-2 relative',
                activeTab === 'chat'
                  ? 'text-[#1967b3] bg-white'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
              {activeTab === 'chat' && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#1967b3] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                'flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-2 relative',
                activeTab === 'history'
                  ? 'text-[#1967b3] bg-white'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <History className="w-3.5 h-3.5" />
              History
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#1967b3] rounded-full" />
              )}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-2',
                      msg.user === 'Bot' ? 'justify-start' : 'justify-end'
                    )}
                  >
                    {msg.user === 'Bot' && (
                      <div className="w-8 h-8 rounded-xl bg-[#1967b3] flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-blue-100">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className={cn('flex flex-col gap-1', msg.user === 'Bot' ? 'max-w-[85%]' : 'max-w-[85%]')}>
                      <div
                        className={cn(
                          'px-4 py-2.5 text-sm leading-relaxed',
                          msg.user === 'Bot'
                            ? 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm shadow-sm'
                            : 'bg-[#1967b3] text-white rounded-2xl rounded-tr-sm shadow-md shadow-blue-100'
                        )}
                      >
                        {msg.message}
                      </div>

                      {/* Render Response Cards */}
                      {msg.data && (
                        Array.isArray(msg.data)
                          ? <ResponseList items={msg.data} />
                          : <ResponseCard item={msg.data} />
                      )}

                      <span
                        suppressHydrationWarning
                        className={cn(
                          'text-[10px] text-gray-400 px-1',
                          msg.user === 'User' && 'text-right'
                        )}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-[#1967b3] flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-100">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="p-4">
                {/* Refresh Button */}
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-gray-800">
                    Recent
                  </h4>
                  <button
                    onClick={fetchHistory}
                    disabled={historyLoading}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#1967b3] hover:underline transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={cn("w-3 h-3", historyLoading && "animate-spin")} />
                    Refresh
                  </button>
                </div>

                {historyLoading ? (
                  <HistorySkeleton />
                ) : historyData.length > 0 ? (
                  <div className="space-y-3">
                    {historyData.map((item, index) => (
                      <HistoryItem key={item.id || index} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 text-[#1967b3]">
                      <History className="w-8 h-8" />
                    </div>
                    <p className="text-gray-900 font-semibold">No history</p>
                    <p className="text-gray-500 text-xs mt-1">Start a conversation</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2 bg-gray-50 rounded-xl p-2 border border-transparent focus-within:border-blue-100 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-[#1967b3] transition-colors rounded-lg hover:bg-gray-100">
                  <Paperclip className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl">
                  <DropdownMenuItem
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                  >
                    Upload File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <input type="file" ref={fileInputRef} className="hidden" />

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask something..."
                className="flex-1 bg-transparent py-2 px-1 text-sm outline-none resize-none max-h-24 placeholder:text-gray-400 text-gray-700"
                rows={1}
                disabled={isLoading}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center",
                  input.trim() && !isLoading
                    ? "bg-[#1967b3] text-white shadow-md hover:shadow-lg hover:bg-blue-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
              {['Test Chat', 'Check status', 'Help'].map((action) => (
                <button
                  key={action}
                  onClick={() => setInput(action)}
                  className="flex-shrink-0 px-3 py-1.5 text-[10px] font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-[#1967b3] rounded-full transition-colors border border-gray-100"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}