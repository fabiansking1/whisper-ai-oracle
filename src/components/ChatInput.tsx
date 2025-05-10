
import React, { useState, KeyboardEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, FileUp } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (message: string, jsonData?: any) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    try {
      setIsProcessingPdf(true);
      
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Import pdf-parse dynamically
      const pdfParse = (await import('pdf-parse')).default;
      
      // Parse PDF content
      const pdfData = await pdfParse(new Uint8Array(arrayBuffer));
      
      // Create JSON with extracted data
      const jsonData = {
        filename: file.name,
        pageCount: pdfData.numpages,
        text: pdfData.text,
        info: pdfData.info
      };

      // Send the PDF data as a message
      const message = `Análisis del PDF "${file.name}" (${pdfData.numpages} páginas)`;
      onSendMessage(message, jsonData);
      
      toast.success(`PDF "${file.name}" analizado correctamente`);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al procesar el PDF:', error);
      toast.error('Error al procesar el PDF');
    } finally {
      setIsProcessingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-card p-4 border-t">
      <div className="flex items-end gap-2">
        <Textarea
          placeholder="Envía un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isProcessingPdf}
          className="resize-none min-h-[60px]"
          rows={1}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={disabled || isProcessingPdf}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="icon"
          variant="outline"
          disabled={disabled || isProcessingPdf}
          className="h-[60px] w-[60px] rounded-lg"
        >
          <FileUp className="h-5 w-5" />
        </Button>
        <Button 
          onClick={handleSubmit} 
          size="icon" 
          disabled={disabled || isProcessingPdf || !input.trim()}
          className="h-[60px] w-[60px] rounded-lg"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      {isProcessingPdf && (
        <div className="text-xs text-muted-foreground animate-pulse">
          Procesando PDF, por favor espere...
        </div>
      )}
    </div>
  );
};

export default ChatInput;
