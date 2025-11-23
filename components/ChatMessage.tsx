import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple Markdown Parser for Code Blocks
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const lines = part.split('\n');
        const firstLine = lines[0].replace(/```/, '').trim();
        const code = lines.slice(1, -1).join('\n');
        
        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-sm">
            <div className="flex justify-between items-center bg-slate-800 px-3 py-1.5 border-b border-slate-700">
              <span className="text-xs font-mono text-slate-300 lowercase">{firstLine || 'code'}</span>
              <button 
                onClick={() => handleCopy(code, index)}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copiedIndex === index ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-xs font-mono text-blue-100 bg-slate-900 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      // Regular text (very basic markdown support for bold)
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part.split(/(\*\*.*?\*\*)/g).map((subPart, i) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={i} className="font-semibold text-slate-900">{subPart.slice(2, -2)}</strong>;
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600 ml-3' : 'bg-emerald-600 mr-3'
        }`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${
            isUser 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-gray-100 rounded-tl-none'
            }`}>
            {isUser ? message.content : renderContent(message.content)}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
      </div>
    </div>
  );
};