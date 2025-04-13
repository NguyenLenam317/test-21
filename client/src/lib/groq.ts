import { ChatMessage } from '@/types';

// Groq API key is set on the server-side for security reasons
// This client-side library provides the types and interfaces for Groq API

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GroqCompletionRequest {
  messages: GroqMessage[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface GroqCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Helper function to format chat messages for Groq API
export const formatMessagesForGroq = (messages: ChatMessage[], systemPrompt?: string): GroqMessage[] => {
  const formattedMessages: GroqMessage[] = [];
  
  // Add system prompt if provided
  if (systemPrompt) {
    formattedMessages.push({
      role: 'system',
      content: systemPrompt
    });
  }
  
  // Add user and assistant messages
  messages.forEach(message => {
    formattedMessages.push({
      role: message.role,
      content: message.content
    });
  });
  
  return formattedMessages;
};

// Create a context-aware system prompt for Hanoi environmental assistant
export const createHanoiEnvironmentSystemPrompt = (userProfile?: any) => {
  let systemPrompt = 
    "You are an AI assistant specializing in environmental information and personalized recommendations for Hanoi, Vietnam. " +
    "Provide accurate, helpful, and concise information about Hanoi's weather, air quality, climate, and sustainability. " +
    "Focus only on Hanoi and the immediate surrounding region. Do not provide information about other cities or regions.";
  
  if (userProfile) {
    systemPrompt += "\n\nUser profile information:";
    
    if (userProfile.healthProfile) {
      const hp = userProfile.healthProfile;
      systemPrompt += `\n- Health: ${hp.hasRespiratoryConditions ? 'Has respiratory conditions' : 'No respiratory conditions'}`;
      systemPrompt += hp.hasAllergies ? ', Has allergies' : ', No allergies';
      systemPrompt += hp.cardiovascularConcerns ? ', Has cardiovascular concerns' : '';
      systemPrompt += hp.skinConditions ? ', Has skin conditions' : '';
      systemPrompt += hp.fitnessLevel ? `, Fitness level: ${hp.fitnessLevel}` : '';
    }
    
    if (userProfile.environmentalSensitivities) {
      const es = userProfile.environmentalSensitivities;
      systemPrompt += `\n- Sensitivities: Pollution (${es.pollutionSensitivity}/5), UV (${es.uvSensitivity}/5), Heat (${es.heatSensitivity}/5), Cold (${es.coldSensitivity}/5)`;
    }
    
    if (userProfile.interests) {
      const int = userProfile.interests;
      systemPrompt += `\n- Interests: ${int.outdoorActivities.join(', ')}`;
      systemPrompt += int.clothingStyle ? `, Clothing style: ${int.clothingStyle}` : '';
      systemPrompt += int.sustainabilityInterest ? `, Interest in sustainability: ${int.sustainabilityInterest}/5` : '';
    }
  }
  
  systemPrompt += "\n\nConsider these details in your responses to provide personalized recommendations. Keep responses concise and focused on environmental factors relevant to Hanoi.";
  
  return systemPrompt;
};
