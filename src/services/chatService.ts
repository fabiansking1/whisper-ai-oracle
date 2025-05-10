
interface ChatRequestOptions {
  model: string;
  messages: { role: string; content: string }[];
}

interface ChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(errorData.error?.message || "Failed to get response from AI");
    }

    const data: ChatResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Chat completion error:", error);
    throw error;
  }
};
