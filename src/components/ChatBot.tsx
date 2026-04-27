import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2, Sparkles, MinusCircle } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Xin chào! Tôi là Lumina AI, trợ lý ảo của Q&H LUMINA. Tôi có thể giúp gì cho bạn hôm nay?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Map history for Gemini SDK
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const aiText = await getChatResponse(userMessage.text, history);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px',
              width: '350px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl border border-brand-100 overflow-hidden flex flex-col mb-4 ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="bg-brand-600 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">Lumina AI</h3>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Trực tuyến</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50/50 scroll-smooth"
                >
                  {messages.map((m) => (
                    <div 
                      key={m.id} 
                      className={cn(
                        "flex items-start space-x-2 max-w-[85%]",
                        m.role === 'user' ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        m.role === 'user' ? "bg-brand-500 text-white" : "bg-white border border-brand-100 text-brand-600"
                      )}>
                        {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                        m.role === 'user' 
                          ? "bg-brand-500 text-white font-medium rounded-tr-sm" 
                          : "bg-white text-gray-700 border border-brand-50 rounded-tl-sm"
                      )}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2 mr-auto">
                      <div className="w-8 h-8 rounded-xl bg-white border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-brand-50 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1">
                        <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                        <span className="text-xs text-gray-400 font-medium">Lumina đang soạn câu trả lời...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form 
                  onSubmit={handleSend}
                  className="p-3 bg-white border-t border-brand-100 flex items-center space-x-2 shrink-0"
                >
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi Lumina AI..."
                    className="flex-grow bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all placeholder:text-gray-400"
                  />
                  <button 
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-brand-200 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            setIsMinimized(false);
          } else if (isMinimized) {
            setIsMinimized(false);
          } else {
            setIsOpen(false);
          }
        }}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 relative group overflow-hidden",
          isOpen ? "bg-white text-brand-600 ring-2 ring-brand-100" : "bg-brand-600 text-white"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <MessageCircle className="w-6 h-6" />
              {!isOpen && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-400 border-2 border-brand-600 rounded-full animate-ping" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
