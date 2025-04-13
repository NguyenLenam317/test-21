import axios from 'axios';

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama3-70b-8192'; // Using Llama 3 70B model

// Message interface
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Get completion from Groq API
 * @param systemPrompt - System prompt for context
 * @param messages - Conversation history
 * @returns AI-generated response text
 */
export async function getGroqCompletion(systemPrompt: string, messages: Message[]): Promise<string> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not defined');
    }

    // Format messages for API call
    const formattedMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ];

    // Make API request
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    // Extract and return the response content
    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('No completion received from Groq API');
    }
  } catch (error) {
    console.error('Error getting completion from Groq API:', error);
    return 'I apologize, but I encountered an issue while processing your request. Please try again later.';
  }
}