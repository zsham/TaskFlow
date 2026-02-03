
import React, { useState, useEffect, useRef } from 'react';
import { User, Task, ChatMessage } from '../types';
import { Icons } from '../constants';
import { streamPersonnelResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  currentUser: User;
  targetUser: User;
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateHistory: (userId: string, history: ChatMessage[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  currentUser, 
  targetUser, 
  tasks, 
  isOpen, 
  onClose,
  onUpdateHistory
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(targetUser.chatHistory || []);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    const modelMessageId = (Date.now() + 1).toString();
    let fullModelText = '';
    
    // Initial empty model message for streaming
    setMessages(prev => [...prev, {
      id: modelMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now()
    }]);

    const userTasks = tasks.filter(t => t.assignedTo === targetUser.id);
    const stream = streamPersonnelResponse(targetUser, userTasks, messages, input);

    try {
      for await (const chunk of stream) {
        fullModelText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === modelMessageId ? { ...m, text: fullModelText } : m
        ));
      }
    } finally {
      setIsTyping(false);
      onUpdateHistory(targetUser.id, [...updatedMessages, {
        id: modelMessageId,
        role: 'model',
        text: fullModelText,
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-slate-900 w-full max-w-xl h-[600px] flex flex-col rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={targetUser.picture} className="w-12 h-12 rounded-2xl object-cover border border-slate-700" alt={targetUser.name} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg shadow-emerald-500/20" />
            </div>
            <div>
              <h3 className="text-slate-100 font-bold leading-none">{targetUser.name}</h3>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                Secure Channel • {targetUser.role}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 hover:text-slate-300 transition-colors">
            <Icons.Plus className="rotate-45" />
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/20"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mb-4">
                <Icons.Activity className="w-8 h-8" />
              </div>
              <p className="text-slate-500 text-sm font-medium max-w-xs">
                Initiate a discussion with {targetUser.name.split(' ')[0]} regarding project milestones or bottlenecks.
              </p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}>
                {msg.text || (isTyping && msg.role === 'model' ? '...' : '')}
                <div className={`text-[9px] mt-2 font-black uppercase opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && messages[messages.length-1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-700 text-xs font-bold animate-pulse">
                {targetUser.name.split(' ')[0]} is synthesizing response...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-6 bg-slate-950/50 border-t border-slate-800">
          <div className="relative flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type professional inquiry..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-100 placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 disabled:opacity-30 transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20"
            >
              <Icons.Plus className="rotate-[-10deg]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
