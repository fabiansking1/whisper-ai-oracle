
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Message } from '@/components/ChatMessage';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import { chatCompletions } from '@/services/chatService';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = useCallback(async (content: string, jsonData?: any) => {
    if (!content.trim() && !jsonData) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      jsonData
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Si el PDF es demasiado grande, mostramos un mensaje para el usuario
      const pdfSizeWarning = jsonData?.text && jsonData.text.length > 8000
        ? "NOTA: El PDF es muy extenso, se ha analizado solo una parte para mantenerse dentro de los límites del modelo."
        : "";
      
      // Prepare the message content for the API
      let apiContent = content;
      
      // If we have JSON data, include a summary in the message
      if (jsonData) {
        const textPreview = jsonData.text && jsonData.text.length > 500
          ? jsonData.text.substring(0, 500) + "..."
          : jsonData.text || "";
          
        apiContent = `${content}\n\n${pdfSizeWarning}\nDatos extraídos del PDF:\nNombre: ${jsonData.filename}\nPáginas: ${jsonData.pageCount}\nContenido de muestra: ${textPreview}`;
      }

      // Limita la cantidad de mensajes anteriores para no sobrecargar la API
      const recentMessages = messages.slice(-4);
      
      // Prepare messages for the API
      const apiMessages = [
        ...recentMessages.map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        })),
        { role: 'user', content: apiContent }
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
      toast.error('No se pudo obtener respuesta de la IA. Por favor intenta de nuevo.');
      
      // Informar al usuario sobre posibles problemas con el tamaño del PDF
      if (jsonData?.pageCount && jsonData.pageCount > 10) {
        toast.error('El PDF puede ser demasiado grande. Intenta con un documento más pequeño (menos de 10 páginas).');
      }
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
