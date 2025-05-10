
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Message } from '@/components/ChatMessage';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import { chatCompletions } from '@/services/chatService';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Prepare messages for the API
      const apiMessages = [
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content }
      ];

      const response = await chatCompletions({
        model: "nousresearch/deephermes-3-mistral-24b-preview:free",
        messages: apiMessages
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">AIChat</h1>
      </header>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatContainer messages={messages} loading={loading} />
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </main>
    </div>
  );
};

export default Index;
