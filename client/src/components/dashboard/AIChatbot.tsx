import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile, ChatMessage } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface AIChatbotProps {
  userProfile?: UserProfile;
}

const AIChatbot = ({ userProfile }: AIChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate personalized suggestions based on user profile
  const getPersonalizedSuggestions = () => {
    if (!userProfile) return [];
    
    const suggestions = [];
    
    // Health-based suggestions
    if (userProfile.healthProfile) {
      if (userProfile.healthProfile.hasRespiratoryConditions) {
        suggestions.push("How can I protect my respiratory health today?");
      }
      if (userProfile.healthProfile.hasAllergies) {
        suggestions.push("Are there high pollen levels today?");
      }
      if (userProfile.healthProfile.fitnessLevel === 'active') {
        suggestions.push("What outdoor activities are safe with today's air quality?");
      }
    }
    
    // Environmental sensitivity suggestions
    if (userProfile.environmentalSensitivities) {
      if (userProfile.environmentalSensitivities.pollutionSensitivity >= 3) {
        suggestions.push("When will air quality improve today?");
      }
      if (userProfile.environmentalSensitivities.uvSensitivity >= 3) {
        suggestions.push("What's the UV index today?");
      }
      if (userProfile.environmentalSensitivities.heatSensitivity >= 3) {
        suggestions.push("How can I stay cool today?");
      }
    }
    
    // Lifestyle-based suggestions
    if (userProfile.lifestyleHabits) {
      if (userProfile.lifestyleHabits.transportation.includes('bicycle')) {
        suggestions.push("Is today good for cycling?");
      }
      if (userProfile.lifestyleHabits.transportation.includes('walk')) {
        suggestions.push("What's the best time for a walk today?");
      }
    }
    
    // Interest-based suggestions
    if (userProfile.interests) {
      if (userProfile.interests.outdoorActivities.length > 0) {
        const activity = userProfile.interests.outdoorActivities[0];
        suggestions.push(`Can I do ${activity} today?`);
      }
      if (userProfile.interests.sustainabilityInterest >= 3) {
        suggestions.push("What sustainable action can I take today?");
      }
    }
    
    // Add some general suggestions if we don't have enough personalized ones
    if (suggestions.length < 3) {
      suggestions.push("How's the weather in Hanoi today?");
      suggestions.push("What should I wear today?");
      suggestions.push("Any environmental alerts today?");
    }
    
    // Return up to 5 suggestions
    return suggestions.slice(0, 5);
  };

  // Fetch existing chat history
  const { data: chatHistory, isLoading } = useQuery({
    queryKey: ['/api/chat/history'],
    enabled: true,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat/message', { message });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] });
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory.messages || []);
    }
  }, [chatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Send message to API
    sendMessage.mutate(input);
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <span className="material-icons text-primary mr-2">smart_toy</span>
            EcoSense AI Assistant
          </CardTitle>
          <CardDescription>Loading your personalized assistant...</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col h-[450px]">
            <div className="flex-grow bg-neutral-50 rounded-lg p-4 mb-4">
              <div className="space-y-4">
                <Skeleton className="h-16 w-3/4 ml-auto rounded-lg" />
                <Skeleton className="h-24 w-4/5 rounded-lg" />
                <Skeleton className="h-16 w-3/4 ml-auto rounded-lg" />
                <Skeleton className="h-24 w-4/5 rounded-lg" />
              </div>
            </div>
            
            <div className="flex">
              <Skeleton className="h-10 flex-grow rounded-l-lg" />
              <Skeleton className="h-10 w-10 rounded-r-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const personalized = userProfile !== undefined;
  const suggestions = getPersonalizedSuggestions();
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <span className="material-icons text-primary mr-2">smart_toy</span>
          EcoSense AI Assistant
          {personalized && (
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">
              Personalized
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {personalized 
            ? "Your personal environmental assistant for Hanoi"
            : "Ask about Hanoi's environment and get recommendations"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-4">
            <div className="flex flex-col h-[450px]">
              <div className="flex-grow bg-neutral-50 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-neutral-500 my-4">
                      <p className="mb-2">Ask a question about Hanoi's weather, environment, or get personalized recommendations.</p>
                      <p className="text-sm">Try switching to the Suggestions tab for personalized prompts.</p>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`${
                          message.role === 'user' 
                            ? 'bg-primary text-white' 
                            : 'bg-neutral-200'
                        } rounded-lg py-2 px-4 max-w-[80%]`}
                      >
                        {message.content.split('\n').map((text, i) => (
                          <p key={i} className={i > 0 ? 'mt-2' : ''}>
                            {text}
                          </p>
                        ))}
                        
                        {message.role === 'assistant' && message.content.includes('list') && (
                          <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                            <li>Follow relevant points from the assistant's message</li>
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-200 rounded-lg py-2 px-4">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <form onSubmit={handleSendMessage} className="flex">
                <Input
                  type="text"
                  placeholder={personalized ? "Ask me anything about Hanoi's environment..." : "Ask about weather, air quality, or recommendations..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow rounded-l-lg"
                  disabled={isTyping}
                />
                <Button 
                  type="submit"
                  className="bg-primary text-white rounded-l-none hover:bg-primary-dark" 
                  disabled={isTyping}
                >
                  <span className="material-icons">send</span>
                </Button>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions" className="mt-4">
            <div className="flex flex-col h-[450px]">
              <div className="flex-grow bg-neutral-50 rounded-lg p-4 mb-4 overflow-y-auto">
                <h4 className="font-medium mb-3">{personalized ? "Personalized Suggestions" : "Popular Questions"}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button 
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-3 text-left hover:bg-primary/10"
                      onClick={() => {
                        setInput(suggestion);
                        setActiveTab('chat');
                      }}
                    >
                      <span className="material-icons text-primary mr-2 text-sm">psychology</span>
                      {suggestion}
                    </Button>
                  ))}
                </div>
                
                {personalized && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Based on Your Profile</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {userProfile?.healthProfile && (
                        <div className="flex items-start p-2 border rounded-md bg-neutral-100">
                          <span className="material-icons text-primary mr-2 text-sm">favorite</span>
                          <div>
                            <p className="font-medium">Health Profile</p>
                            <p className="text-neutral-600">
                              {userProfile.healthProfile.hasRespiratoryConditions && "Respiratory conditions, "}
                              {userProfile.healthProfile.hasAllergies && "Allergies, "}
                              {userProfile.healthProfile.cardiovascularConcerns && "Cardiovascular concerns, "}
                              {userProfile.healthProfile.skinConditions && "Skin conditions, "}
                              Fitness: {userProfile.healthProfile.fitnessLevel || "Not specified"}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {userProfile?.environmentalSensitivities && (
                        <div className="flex items-start p-2 border rounded-md bg-neutral-100">
                          <span className="material-icons text-primary mr-2 text-sm">air</span>
                          <div>
                            <p className="font-medium">Environmental Sensitivities</p>
                            <p className="text-neutral-600">
                              Pollution: {userProfile.environmentalSensitivities.pollutionSensitivity}/5, 
                              UV: {userProfile.environmentalSensitivities.uvSensitivity}/5, 
                              Heat: {userProfile.environmentalSensitivities.heatSensitivity}/5, 
                              Cold: {userProfile.environmentalSensitivities.coldSensitivity}/5
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIChatbot;
