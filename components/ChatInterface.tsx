import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Dumbbell } from 'lucide-react';
import { Message, Sender } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] md:h-[85vh] w-full max-w-4xl mx-auto md:bg-dark-900 md:rounded-2xl md:shadow-2xl md:border border-gray-800 overflow-hidden relative">
      {/* Header */}
      <div className="flex-none p-4 bg-dark-950/90 backdrop-blur-md border-b border-gray-800 flex items-center gap-3 shadow-md z-10 sticky top-0">
        <div className="p-2 bg-brand-500/10 rounded-lg">
          <Dumbbell className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">RutinaAI</h2>
          <p className="text-xs text-brand-400 font-medium">Entrenador Personal IA</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-dark-950 md:bg-dark-900 scrollbar-hide pb-24">
        {messages.length === 0 && isLoading && (
           <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
              <p className="animate-pulse">Analizando tu rutina...</p>
           </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${msg.sender === Sender.User ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-lg
                ${msg.sender === Sender.User ? 'bg-brand-600' : 'bg-dark-800 border border-gray-700'}`}>
                {msg.sender === Sender.User ? <User size={16} className="text-white" /> : <Bot size={16} className="text-brand-400" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden
                  ${
                    msg.sender === Sender.User
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-dark-800 text-gray-200 border border-gray-700 rounded-tl-none'
                  }`}
              >
                {msg.sender === Sender.Bot ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-brand-200">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && messages.length > 0 && (
          <div className="flex justify-start w-full animate-pulse">
             <div className="flex gap-3 max-w-[80%]">
               <div className="w-8 h-8 rounded-full bg-dark-800 border border-gray-700 flex items-center justify-center mt-1">
                 <Bot size={16} className="text-brand-400" />
               </div>
               <div className="bg-dark-800 border border-gray-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                 <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
               </div>
             </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-dark-950 md:bg-dark-900 border-t border-gray-800 sticky bottom-0 z-20">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu respuesta..."
            disabled={isLoading}
            className="w-full bg-dark-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;