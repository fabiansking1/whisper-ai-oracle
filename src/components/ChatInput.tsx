
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
      
      // Use PDF.js for browser-compatible PDF parsing
      const pdf = await import('pdfjs-dist');
      
      // Set the worker source
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
      pdf.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      
      // Load and parse the document
      const loadingTask = pdf.getDocument(new Uint8Array(arrayBuffer));
      const pdfDocument = await loadingTask.promise;
      
      // Extract text from all pages
      let fullText = '';
      const totalPages = pdfDocument.numPages;
      
      // Limitar el número de páginas para procesar si el documento es muy grande
      const maxPagesToProcess = Math.min(totalPages, 10);
      
      for (let i = 1; i <= maxPagesToProcess; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
        
        // Limitar el texto extraído para evitar exceder el contexto del modelo
        if (fullText.length > 8000) {
          fullText = fullText.substring(0, 8000) + "\n[Contenido truncado debido al límite de tamaño]";
          break;
        }
      }
      
      // Get document info
      const info = await pdfDocument.getMetadata();
      
      // Create JSON with extracted data
      const jsonData = {
        filename: file.name,
        pageCount: totalPages,
        processedPages: maxPagesToProcess,
        text: fullText,
        info: info.info || {}
      };

      // Send the PDF data as a message
      let message = `Análisis del PDF "${file.name}" (${totalPages} páginas)`;
      if (maxPagesToProcess < totalPages) {
        message += ` - Solo se procesaron las primeras ${maxPagesToProcess} páginas debido al tamaño del documento.`;
      }
      
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
