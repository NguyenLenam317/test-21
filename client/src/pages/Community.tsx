import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/components/UserContext';
import { Poll, SustainabilityTip } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

const Community = () => {
  const [activeTab, setActiveTab] = useState('polls');
  const { user } = useUser();
  const { toast } = useToast();
  
  // States for creating new poll
  const [showNewPollForm, setShowNewPollForm] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [newPollDuration, setNewPollDuration] = useState('7');
  
  // States for voting
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [activePollId, setActivePollId] = useState<number | null>(null);
  
  // State for new sustainability idea
  const [newIdeaText, setNewIdeaText] = useState('');
  
  // Fetch polls
  const { data: pollsData, isLoading: pollsLoading } = useQuery({
    queryKey: ['/api/sustainability/polls'],
    enabled: activeTab === 'polls',
  });
  
  // Fetch tips
  const { data: tipsData, isLoading: tipsLoading } = useQuery({
    queryKey: ['/api/sustainability/tips'],
    enabled: activeTab === 'tips',
  });
  
  // Fetch community initiatives
  const { data: initiativesData, isLoading: initiativesLoading } = useQuery({
    queryKey: ['/api/sustainability/initiatives'],
    enabled: activeTab === 'initiatives',
  });
  
  // Fetch community ideas
  const { data: ideasData, isLoading: ideasLoading } = useQuery({
    queryKey: ['/api/sustainability/ideas'],
    enabled: activeTab === 'ideas',
  });
  
  // Vote on poll mutation
  const voteMutation = useMutation({
    mutationFn: async (voteData: { pollId: number, optionIndex: number }) => {
      const response = await apiRequest('POST', '/api/sustainability/vote', voteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sustainability/polls'] });
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded.",
      });
      setSelectedOption(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Create new poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (pollData: { question: string, options: string[], duration: number }) => {
      const response = await apiRequest('POST', '/api/sustainability/polls/create', pollData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sustainability/polls'] });
      toast({
        title: "Poll Created",
        description: "Your new poll has been created successfully.",
      });
      setShowNewPollForm(false);
      setNewPollQuestion('');
      setNewPollOptions(['', '']);
      setNewPollDuration('7');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create your poll. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Submit new sustainability idea
  const submitIdeaMutation = useMutation({
    mutationFn: async (ideaData: { content: string }) => {
      const response = await apiRequest('POST', '/api/sustainability/ideas/submit', ideaData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sustainability/ideas'] });
      toast({
        title: "Idea Submitted",
        description: "Your sustainability idea has been submitted. Thank you for contributing!",
      });
      setNewIdeaText('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit your idea. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleVote = () => {
    if (selectedOption !== null && activePollId !== null) {
      voteMutation.mutate({
        pollId: activePollId,
        optionIndex: selectedOption
      });
    }
  };
  
  const handleNewPollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newPollQuestion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a poll question.",
        variant: "destructive",
      });
      return;
    }
    
    const validOptions = newPollOptions.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please enter at least two poll options.",
        variant: "destructive",
      });
      return;
    }
    
    createPollMutation.mutate({
      question: newPollQuestion,
      options: validOptions,
      duration: parseInt(newPollDuration)
    });
  };
  
  const handleAddOption = () => {
    setNewPollOptions([...newPollOptions, '']);
  };
  
  const handleRemoveOption = (index: number) => {
    if (newPollOptions.length <= 2) {
      toast({
        title: "Error",
        description: "A poll must have at least two options.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedOptions = [...newPollOptions];
    updatedOptions.splice(index, 1);
    setNewPollOptions(updatedOptions);
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newPollOptions];
    updatedOptions[index] = value;
    setNewPollOptions(updatedOptions);
  };
  
  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newIdeaText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your sustainability idea.",
        variant: "destructive",
      });
      return;
    }
    
    submitIdeaMutation.mutate({
      content: newIdeaText
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-2xl font-heading font-semibold mb-6">Community & Sustainability</h2>
        
        <Tabs defaultValue="polls" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="polls">Sustainability Polls</TabsTrigger>
            <TabsTrigger value="tips">Daily Tips</TabsTrigger>
            <TabsTrigger value="initiatives">Local Initiatives</TabsTrigger>
            <TabsTrigger value="ideas">Community Ideas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="polls" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Current Polls</h3>
              <Button 
                onClick={() => setShowNewPollForm(!showNewPollForm)}
                disabled={!user?.isAuthenticated}
              >
                {showNewPollForm ? 'Cancel' : 'Create New Poll'}
              </Button>
            </div>
            
            {!user?.isAuthenticated && (
              <Alert>
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  You need to be signed in to create new polls.
                </AlertDescription>
              </Alert>
            )}
            
            {showNewPollForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Sustainability Poll</CardTitle>
                  <CardDescription>
                    Create a poll to gather community opinions on environmental topics in Hanoi.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNewPollSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="question">Poll Question</Label>
                      <Textarea 
                        id="question"
                        placeholder="Enter your question here..."
                        value={newPollQuestion}
                        onChange={(e) => setNewPollQuestion(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Poll Options</Label>
                      {newPollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 mt-2">
                          <Textarea
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveOption(index)}
                          >
                            <span className="material-icons">delete</span>
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddOption}
                        className="mt-2"
                      >
                        <span className="material-icons mr-1 text-sm">add</span>
                        Add Option
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Poll Duration (days)</Label>
                      <select
                        id="duration"
                        value={newPollDuration}
                        onChange={(e) => setNewPollDuration(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      >
                        <option value="3">3 days</option>
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowNewPollForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createPollMutation.isPending}
                      >
                        {createPollMutation.isPending ? 'Creating...' : 'Create Poll'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {pollsLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : pollsData?.polls?.length ? (
              <div className="space-y-6">
                {pollsData.polls.map((poll: Poll) => (
                  <Card key={poll.id} className="shadow-md">
                    <CardHeader>
                      <CardTitle>{poll.question}</CardTitle>
                      <CardDescription>
                        {poll.totalVotes} votes • 
                        {new Date(poll.expiresAt) > new Date() 
                          ? ` ${Math.ceil((new Date(poll.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                          : ' Poll ended'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {poll.userVoted ? (
                        <div className="space-y-4">
                          {poll.options.map((option, index) => (
                            <div key={index}>
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center">
                                  <span className="text-sm">{option.text}</span>
                                  {poll.userVoteIndex === index && (
                                    <Badge className="ml-2 text-xs">Your vote</Badge>
                                  )}
                                </div>
                                <span className="text-sm font-medium">{option.percentage}%</span>
                              </div>
                              <Progress 
                                value={option.percentage} 
                                className={`h-2 ${poll.userVoteIndex === index ? 'bg-primary-light' : ''}`} 
                              />
                            </div>
                          ))}
                          
                          {user?.isAuthenticated && (
                            <div className="pt-4 border-t mt-4">
                              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                                <span className="material-icons text-sm">check_circle</span>
                                <span>You've voted on this poll</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <RadioGroup 
                            value={activePollId === poll.id && selectedOption !== null ? selectedOption.toString() : undefined}
                            onValueChange={(value) => {
                              setSelectedOption(parseInt(value));
                              setActivePollId(poll.id);
                            }}
                          >
                            {poll.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={index.toString()} id={`option-${poll.id}-${index}`} />
                                <Label htmlFor={`option-${poll.id}-${index}`} className="text-sm">
                                  {option.text}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          
                          <div className="pt-4">
                            <Button 
                              onClick={handleVote}
                              disabled={activePollId !== poll.id || selectedOption === null || voteMutation.isPending || !user?.isAuthenticated}
                            >
                              {voteMutation.isPending ? 'Submitting...' : 'Vote'}
                            </Button>
                            
                            {!user?.isAuthenticated && (
                              <p className="text-xs text-neutral-500 mt-2">
                                Sign in to vote on polls.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-neutral-50">
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">poll</span>
                    <h3 className="text-lg font-medium mb-1">No Active Polls</h3>
                    <p className="text-neutral-500">There are no active polls at the moment.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons text-primary mr-2">tips_and_updates</span>
                  Daily Sustainability Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tipsLoading ? (
                  <Skeleton className="h-32 w-full rounded-lg" />
                ) : tipsData?.dailyTip ? (
                  <div className="border-l-4 border-secondary p-6 bg-secondary bg-opacity-5 rounded-r-lg">
                    <h3 className="text-lg font-medium mb-2">{tipsData.dailyTip.title}</h3>
                    <p className="text-neutral-700">{tipsData.dailyTip.content}</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">lightbulb</span>
                    <p className="text-neutral-500">No tip available today.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sustainability Tips Archive</CardTitle>
                <CardDescription>Previous tips to help you live more sustainably in Hanoi</CardDescription>
              </CardHeader>
              <CardContent>
                {tipsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                ) : tipsData?.previousTips?.length ? (
                  <div className="space-y-6">
                    {tipsData.previousTips.map((tip: SustainabilityTip, index: number) => (
                      <div key={index} className="p-4 bg-neutral-50 rounded-lg">
                        <div className="flex items-start">
                          <span className="material-icons text-secondary mr-3">{tip.icon}</span>
                          <div>
                            <h4 className="font-medium mb-1">{tip.title}</h4>
                            <p className="text-sm text-neutral-700">{tip.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-neutral-500">No previous tips available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="initiatives" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Local Sustainability Initiatives in Hanoi</CardTitle>
                <CardDescription>Join local projects and events making Hanoi more sustainable</CardDescription>
              </CardHeader>
              <CardContent>
                {initiativesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </div>
                ) : initiativesData?.initiatives?.length ? (
                  <div className="space-y-6">
                    {initiativesData.initiatives.map((initiative: any, index: number) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-neutral-100 h-40 flex items-center justify-center">
                          <span className="material-icons text-5xl text-neutral-400">photo</span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-medium mb-1">{initiative.title}</h3>
                          <p className="text-sm text-neutral-500 mb-2">{initiative.organizer}</p>
                          <p className="text-neutral-700 mb-4">{initiative.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-sm flex items-center mb-1">
                                <span className="material-icons mr-1 text-sm">calendar_today</span>
                                When
                              </h4>
                              <p className="text-sm">{initiative.date} at {initiative.time}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm flex items-center mb-1">
                                <span className="material-icons mr-1 text-sm">location_on</span>
                                Where
                              </h4>
                              <p className="text-sm">{initiative.location}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map((i) => (
                                <Avatar key={i} className="border-2 border-white w-8 h-8">
                                  <AvatarFallback className="text-xs">U{i}</AvatarFallback>
                                </Avatar>
                              ))}
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 border-2 border-white">
                                <span className="text-xs">+{initiative.participants || 12}</span>
                              </div>
                            </div>
                            
                            <Button size="sm" disabled={!user?.isAuthenticated}>
                              {initiative.userJoined ? 'Participating' : 'Join Initiative'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">eco</span>
                    <h3 className="text-lg font-medium mb-1">No Current Initiatives</h3>
                    <p className="text-neutral-500">There are no active initiatives at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ideas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share Your Sustainability Ideas</CardTitle>
                <CardDescription>
                  Contribute your thoughts on how to make Hanoi more environmentally friendly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitIdea} className="space-y-4">
                  <div>
                    <Label htmlFor="new-idea">Your Idea</Label>
                    <Textarea
                      id="new-idea"
                      placeholder="Share your sustainability idea for Hanoi..."
                      value={newIdeaText}
                      onChange={(e) => setNewIdeaText(e.target.value)}
                      className="mt-1"
                      rows={4}
                      disabled={!user?.isAuthenticated}
                    />
                    {!user?.isAuthenticated && (
                      <p className="text-xs text-neutral-500 mt-2">
                        Sign in to share your ideas.
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={submitIdeaMutation.isPending || !newIdeaText.trim() || !user?.isAuthenticated}
                    >
                      {submitIdeaMutation.isPending ? 'Submitting...' : 'Share Idea'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Community Ideas</CardTitle>
                <CardDescription>Ideas shared by the Hanoi community</CardDescription>
              </CardHeader>
              <CardContent>
                {ideasLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                ) : ideasData?.ideas?.length ? (
                  <div className="space-y-6">
                    {ideasData.ideas.map((idea: any, index: number) => (
                      <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center mb-3">
                          <Avatar className="w-8 h-8 mr-2">
                            <AvatarFallback>{idea.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{idea.author}</p>
                            <p className="text-xs text-neutral-500">{new Date(idea.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <p className="text-neutral-700">{idea.content}</p>
                        
                        <div className="flex items-center mt-3 gap-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1"
                            disabled={!user?.isAuthenticated}
                          >
                            <span className="material-icons text-sm">thumb_up</span>
                            <span>{idea.likes || 0}</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1"
                            disabled={!user?.isAuthenticated}
                          >
                            <span className="material-icons text-sm">comment</span>
                            <span>{idea.comments || 0}</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">forum</span>
                    <h3 className="text-lg font-medium mb-1">No Ideas Shared Yet</h3>
                    <p className="text-neutral-500">Be the first to share a sustainability idea!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
