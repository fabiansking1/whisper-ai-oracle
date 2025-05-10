
import React from 'react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        "px-4 py-3 rounded-lg mb-4 animate-fade-in max-w-[85%] border",
        isUser 
          ? "ml-auto bg-chat-user border-chat-userBorder" 
          : "mr-auto bg-chat-ai border-chat-aiBorder"
      )}
    >
      <div className="flex items-start">
        <div className="text-sm font-medium mb-1">
          {isUser ? 'You' : 'AI Assistant'}
        </div>
      </div>
      <div className="prose prose-sm">
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;
