
import React, { useRef, useEffect } from 'react';
import ChatMessage, { Message } from './ChatMessage';

interface ChatContainerProps {
  messages: Message[];
  loading: boolean;
}

const LoadingIndicator = () => (
  <div className="px-4 py-3 rounded-lg mb-4 animate-fade-in max-w-[85%] mr-auto bg-chat-ai border border-chat-aiBorder">
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-200"></div>
    </div>
  </div>
);

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Welcome to AIChat</h2>
            <p className="text-muted-foreground mb-6">
              Chat with an advanced AI assistant powered by OpenRouter. Start by sending a message below.
            </p>
          </div>
        </div>
      )}
      
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {loading && <LoadingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
