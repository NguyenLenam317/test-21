import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Poll, PollVote } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface SustainabilityPollsProps {
  className?: string;
}

const SustainabilityPolls = ({ className = "" }: SustainabilityPollsProps) => {
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [activePollId, setActivePollId] = useState<number | null>(null);

  // Fetch sustainability polls
  const { data, isLoading } = useQuery({
    queryKey: ['/api/sustainability/polls'],
    enabled: true,
  });

  // Vote on poll mutation
  const vote = useMutation({
    mutationFn: async (voteData: PollVote) => {
      const response = await apiRequest('POST', '/api/sustainability/vote', voteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sustainability/polls'] });
      setSelectedOption(null);
    }
  });

  useEffect(() => {
    if (data) {
      setActivePolls(data.polls || []);
    }
  }, [data]);

  const handleVote = () => {
    if (selectedOption !== null && activePollId !== null) {
      vote.mutate({
        pollId: activePollId,
        optionIndex: selectedOption
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 mr-2 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-md ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-lg font-heading font-medium flex items-center mb-4">
          <span className="material-icons text-primary mr-2">how_to_vote</span>
          Sustainability Polls
        </h3>
        
        <div className="space-y-6">
          {activePolls.map((poll) => (
            <div key={poll.id} className="border border-neutral-200 rounded-lg p-4">
              <p className="font-medium mb-2">{poll.question}</p>
              
              {poll.userVoted ? (
                <div className="space-y-2 mt-4">
                  {poll.options.map((option, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{option.text}</span>
                        <span className="text-sm font-medium">{option.percentage}%</span>
                      </div>
                      <Progress value={option.percentage} className="h-2" />
                    </div>
                  ))}
                  
                  <p className="text-xs text-neutral-500 mt-2">
                    {poll.totalVotes} votes • 
                    {new Date(poll.expiresAt) > new Date() 
                      ? ` ${Math.ceil((new Date(poll.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                      : ' Poll ended'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  <RadioGroup 
                    value={activePollId === poll.id && selectedOption !== null ? selectedOption.toString() : undefined}
                    onValueChange={(value) => {
                      setSelectedOption(parseInt(value));
                      setActivePollId(poll.id);
                    }}
                  >
                    {poll.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <RadioGroupItem value={index.toString()} id={`option-${poll.id}-${index}`} />
                        <Label htmlFor={`option-${poll.id}-${index}`} className="ml-2 text-sm text-neutral-700">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="mt-4">
                    <Button 
                      onClick={handleVote}
                      disabled={activePollId !== poll.id || selectedOption === null || vote.isPending}
                    >
                      {vote.isPending ? 'Submitting...' : 'Vote'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {activePolls.length === 0 && (
            <div className="text-center p-8 text-neutral-500">
              <span className="material-icons text-4xl mb-2">poll</span>
              <p>No active polls at the moment.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SustainabilityPolls;
