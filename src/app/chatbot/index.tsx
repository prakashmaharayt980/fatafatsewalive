'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Send, X, Paperclip, History, MessageSquare,
  Loader2, CreditCard,
  Calendar, Package, RefreshCw, Trash2, ChevronRight, ChevronLeft,
  Sparkles, HelpCircle, FileText, Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import RemoteServices from '@/app/api/remoteservice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { CompanyLogo } from '../CommonVue/Payment';

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
  quickActions?: string[];
}

// Mock product data for carousel
const mockProducts = [
  { id: 1, name: 'Premium Card', description: 'Best for travel', price: '$0/year', image: '💳' },
  { id: 2, name: 'Rewards Plus', description: 'Cash back rewards', price: '$95/year', image: '🎁' },
  { id: 3, name: 'Business Pro', description: 'For businesses', price: '$150/year', image: '💼' },
];

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

// Product Carousel Component
const ProductCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 180;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mt-3 relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mockProducts.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[140px] bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="h-20 bg-gray-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              {product.image}
            </div>
            <div className="p-3">
              <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
              <p className="text-xs text-gray-500 mb-1">{product.description}</p>
              <p className="text-sm font-bold text-[var(--colour-fsP1)] group-hover:text-[var(--colour-fsP2)] transition-colors">{product.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-[var(--colour-fsP2)] transition-colors opacity-0 hover:opacity-100 focus:opacity-100"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-[var(--colour-fsP2)] transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Quick Action Buttons
const QuickActions = ({ actions, onSelect }: { actions: string[], onSelect: (action: string) => void }) => (
  <div className="flex flex-wrap gap-2 mt-3">
    {actions.map((action) => (
      <button
        key={action}
        onClick={() => onSelect(action)}
        className="px-4 py-2 text-sm font-medium text-[var(--colour-fsP2)] bg-white border border-blue-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all"
      >
        {action}
      </button>
    ))}
  </div>
);

const ResponseCard = ({ item }: { item: ApiResponse }) => {
  const isEligible = item.decision?.toLowerCase() === 'eligible';

  return (
    <div className="mt-3 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className={cn(
        "px-4 py-2.5 flex items-center justify-between",
        isEligible ? "bg-emerald-50 border-b border-emerald-100" : "bg-gray-50 border-b border-gray-100"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isEligible ? "bg-emerald-500" : "bg-gray-400"
          )} />
          <span className="font-semibold text-sm text-gray-800">{item.decision || 'Response'}</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">#{item.id}</span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[var(--colour-fsP1)] flex items-center justify-center text-white font-semibold">
            {item.user_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.user_name || 'User'}</p>
            <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Product</p>
            <p className="text-sm font-medium text-gray-800 capitalize truncate">
              {item.detected_product || 'N/A'}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide text-blue-400 mb-0.5">Limit</p>
            <p className="text-base font-bold text-[var(--colour-fsP2)]">
              ${item.credit_limit?.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResponseList = ({ items }: { items: ApiResponse[] }) => (
  <div className="space-y-2 mt-2">
    {items.map((item, index) => (
      <ResponseCard key={item.id || index} item={item} />
    ))}
  </div>
);

const MarkdownMessage = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ node, ...props }) => <h1 className="text-base font-semibold mt-2 mb-1.5 text-gray-900" {...props} />,
      h2: ({ node, ...props }) => <h2 className="text-sm font-semibold mt-2 mb-1 text-gray-900" {...props} />,
      h3: ({ node, ...props }) => <h3 className="text-sm font-medium mt-1.5 mb-1 text-gray-800" {...props} />,
      p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0 text-gray-700" {...props} />,
      ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-1.5 space-y-0.5 text-gray-700" {...props} />,
      ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-1.5 space-y-0.5 text-gray-700" {...props} />,
      li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
      blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-2 border-blue-300 pl-3 py-0.5 my-1.5 text-gray-600 italic" {...props} />
      ),
      code: ({ node, inline, ...props }: any) =>
        inline ? (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-[var(--colour-fsP2)]" {...props} />
        ) : (
          <code className="block bg-gray-100 p-2.5 rounded-lg text-xs font-mono overflow-x-auto my-1.5 text-gray-700" {...props} />
        ),
      pre: ({ node, ...props }) => <pre className="overflow-x-auto" {...props} />,
      a: ({ node, ...props }) => (
        <a className="text-[var(--colour-fsP2)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
      ),
      strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
      em: ({ node, ...props }) => <em className="italic" {...props} />,
    }}
  >
    {content}
  </ReactMarkdown>
);

const HistoryItem = ({ item }: { item: ApiResponse }) => (
  <div className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
    <div className="w-10 h-10 rounded-full bg-[var(--colour-fsP1)] flex items-center justify-center text-white font-medium flex-shrink-0">
      {item.user_name?.charAt(0).toUpperCase() || 'U'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="font-medium text-gray-900 truncate text-sm">{item.user_name || 'User'}</p>
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full font-medium",
          item.decision?.toLowerCase() === 'eligible'
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-600"
        )}>
          {item.decision || 'Pending'}
        </span>
      </div>
      <p className="text-xs text-gray-500 truncate">{item.detected_product || 'No product'}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--colour-fsP2)] transition-colors flex-shrink-0" />
  </div>
);

const HistorySkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-50 rounded w-32" />
        </div>
      </div>
    ))}
  </div>
);

// Bot Icon Component
const BotIcon = () => (
  <div className="w-10 h-10 rounded-full  flex items-center justify-center shadow-md shadow-blue-100">
    <Image src={CompanyLogo} alt="Bot Icon" width={40} height={40} />
  </div>
);

export default function ChatBot() {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<ApiResponse[]>([]);
  const [sessionId, setSessionId] = useState(Math.floor(Math.random() * 1000000));
  const [messages, setMessages] = useState<Message[]>([
    {
      user: 'Bot',
      message: "Hi, I'm Fatafat Bot!\nHow can I help you today? 😊",
      timestamp: new Date(),
      quickActions: ['Check my application', 'View products', 'Talk to an agent']
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [sessionValid, setSessionValid] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (activeTab === 'history' && sessionValid) {
      fetchHistory();
    }
  }, [activeTab, sessionValid]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setSessionError(null);

    try {
      if (!sessionId) {
        setSessionError('Invalid session');
        setSessionValid(false);
        setHistoryLoading(false);
        return;
      }

      const response = await RemoteServices.getChatbotHistory(sessionId);

      if (response && Array.isArray(response)) {
        setHistoryData(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setHistoryData(response.data);
      } else {
        setHistoryData([]);
      }
    } catch (error: any) {
      console.error('Error fetching chat history:', error);

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setSessionError('Session expired');
        setSessionValid(false);
      } else {
        setSessionError('Failed to load history');
      }

      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'View products') {
      setShowProducts(true);
      const userMsg: Message = {
        user: 'User',
        message: action,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);

      setTimeout(() => {
        const botMsg: Message = {
          user: 'Bot',
          message: "Here are some products I recommend for you:",
          timestamp: new Date(),
          quickActions: ['Apply now', 'Compare cards', 'More options']
        };
        setMessages(prev => [...prev, botMsg]);
      }, 500);
    } else {
      sendMessage(action);
    }
  };

  const sendMessage = async (userMessage: string) => {
    const userMsg: Message = {
      user: 'User',
      message: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await RemoteServices.chatBotQuery({
        message: userMessage,
        sessionId: sessionId
      });

      let botText = "I've received your request. Let me help you with that.";
      let botData: ApiResponse | ApiResponse[] | undefined = undefined;
      let quickActions: string[] | undefined = undefined;

      if (typeof response === 'string') {
        botText = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          if (response[0]?.output) {
            botText = response[0].output;
          } else if (response.length > 0 && (response[0].id || response[0].decision)) {
            botData = response as ApiResponse[];
          }
        } else {
          botText = response.output || response.message || response.text || botText;

          if (response.id && (response.decision || response.credit_limit)) {
            botData = response as ApiResponse;
          } else if (response.data) {
            if (Array.isArray(response.data) || response.data.id) {
              botData = response.data;
            }
          }
        }
      }

      // Add contextual quick actions
      if (userMessage.toLowerCase().includes('application') || userMessage.toLowerCase().includes('status')) {
        quickActions = ['Check another', 'View details', 'Contact support'];
      }

      const botMsg: Message = {
        user: 'Bot',
        message: botText,
        timestamp: new Date(),
        data: botData,
        quickActions
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chatbot Error:", error);
      const botMsg: Message = {
        user: 'Bot',
        message: "I'm sorry, something went wrong. Please try again.",
        timestamp: new Date(),
        quickActions: ['Try again', 'Contact support']
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setShowProducts(false);
    setMessages([{
      user: 'Bot',
      message: "Chat cleared! How can I help you?",
      timestamp: new Date(),
      quickActions: ['Check my application', 'View products', 'Talk to an agent']
    }]);
    setSessionId(Math.floor(Math.random() * 1000000));
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
        className={cn(
          'fixed z-[9999] w-14 h-14 rounded-full transition-all duration-200 flex items-center justify-center',
          'bottom-24 right-6 bg-[var(--colour-fsP2)] text-white',
          'shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:bg-blue-700 hover:scale-105 active:scale-95',
          isOpen && 'scale-0 opacity-0 pointer-events-none'
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={cn(
        'fixed z-[9998] transition-all duration-200',
        'bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)]',
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      )}>
        <div className="bg-white rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl shadow-gray-200/60 border border-gray-100">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md shadow-blue-100">
                  <Image src={CompanyLogo} alt="Bot Icon" width={40} height={40} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Fatafat Assistant</h3>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  aria-label="Clear chat"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {(['chat', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-1.5 relative',
                  activeTab === tab
                    ? 'text-[var(--colour-fsP2)] bg-white'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {tab === 'chat' ? <MessageSquare className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span className="capitalize">{tab}</span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--colour-fsP2)]" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30">

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i}>
                    <div
                      className={cn(
                        'flex gap-2.5',
                        msg.user === 'Bot' ? 'justify-start' : 'justify-end'
                      )}
                    >
                      {msg.user === 'Bot' && <BotIcon />}

                      <div className={cn('flex flex-col gap-1', msg.user === 'Bot' ? 'max-w-[85%]' : 'max-w-[75%]')}>
                        <div
                          className={cn(
                            'px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap',
                            msg.user === 'Bot'
                              ? 'bg-white text-gray-700 rounded-2xl rounded-tl-md shadow-sm border border-gray-100'
                              : 'bg-[var(--colour-fsP2)] text-white rounded-2xl rounded-tr-md shadow-md shadow-blue-100'
                          )}
                        >
                          {msg.user === 'Bot' ? (
                            <MarkdownMessage content={msg.message} />
                          ) : (
                            msg.message
                          )}
                        </div>

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

                    {/* Product Carousel after View products */}
                    {msg.user === 'Bot' && showProducts && msg.message.includes('recommend') && (
                      <div className="ml-10">
                        <ProductCarousel />
                      </div>
                    )}

                    {/* Response Cards */}
                    {msg.data && (
                      <div className="ml-10">
                        {Array.isArray(msg.data)
                          ? <ResponseList items={msg.data} />
                          : <ResponseCard item={msg.data} />
                        }
                      </div>
                    )}

                    {/* Quick Actions */}
                    {msg.user === 'Bot' && msg.quickActions && (
                      <div className="ml-10">
                        <QuickActions actions={msg.quickActions} onSelect={handleQuickAction} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 justify-start">
                    <BotIcon />
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-gray-100">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-[var(--colour-fsP2)] rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
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
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Conversations</h4>
                  <button
                    onClick={fetchHistory}
                    disabled={historyLoading || !sessionValid}
                    className="flex items-center gap-1 text-xs text-[var(--colour-fsP2)] hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={cn("w-3 h-3", historyLoading && "animate-spin")} />
                    Refresh
                  </button>
                </div>

                {sessionError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs text-red-600 font-medium">{sessionError}</p>
                  </div>
                )}

                {historyLoading ? (
                  <HistorySkeleton />
                ) : !sessionValid ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Session Invalid</p>
                    <p className="text-xs text-gray-500 mt-1">Start a new conversation</p>
                  </div>
                ) : historyData.length > 0 ? (
                  <div className="space-y-2">
                    {historyData.map((item, index) => (
                      <HistoryItem key={item.id || index} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-[var(--colour-fsP2)]" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">No history yet</p>
                    <p className="text-xs text-gray-500 mt-1">Start chatting to see history</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="Attach file" className="p-2.5 text-gray-400 hover:text-[var(--colour-fsP2)] hover:bg-blue-50 transition-colors rounded-full flex-shrink-0">
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

              <div className="flex-1 bg-gray-100 rounded-full border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full bg-transparent py-2.5 px-4 text-sm outline-none resize-none max-h-24 placeholder:text-gray-400 text-gray-700"
                  rows={1}
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className={cn(
                  "p-2.5 rounded-full transition-all flex items-center justify-center flex-shrink-0",
                  input.trim() && !isLoading
                    ? "bg-[var(--colour-fsP2)] text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}