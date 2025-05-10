
interface ChatRequestOptions {
  model: string;
  messages: { role: string; content: string }[];
}

interface ChatResponse {
  choices?: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
}

const API_KEY = "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";

export const chatCompletions = async (options: ChatRequestOptions): Promise<string> => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "AIChat",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages
      })
    });

    const data: ChatResponse = await response.json();
    
    // Si la API devuelve un error específico
    if (!response.ok) {
      console.error("API Error:", data);
      throw new Error(data.error?.message || "Failed to get response from AI");
    }
    
    // Verificar que choices exista y tenga al menos un elemento
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response data received from AI");
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Chat completion error:", error);
    throw error;
  }
};
