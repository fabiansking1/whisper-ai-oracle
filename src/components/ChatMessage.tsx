
import React from 'react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  jsonData?: any;
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
        
        {message.jsonData && (
          <div className="mt-2">
            <details>
              <summary className="cursor-pointer font-medium text-sm">
                Ver datos extraídos del PDF
              </summary>
              <pre className="bg-muted p-2 rounded-md mt-2 text-xs overflow-auto max-h-[300px]">
                {JSON.stringify(message.jsonData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
