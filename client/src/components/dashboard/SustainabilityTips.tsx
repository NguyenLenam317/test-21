import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SustainabilityTip, LocalInitiative } from '@/types';

const SustainabilityTips = () => {
  const [dailyTip, setDailyTip] = useState<SustainabilityTip | null>(null);
  const [localInitiatives, setLocalInitiatives] = useState<LocalInitiative[]>([]);

  // Fetch sustainability tips
  const { data, isLoading } = useQuery({
    queryKey: ['/api/sustainability/tips'],
    enabled: true,
  });

  useEffect(() => {
    if (data) {
      setDailyTip(data.dailyTip || null);
      setLocalInitiatives(data.localInitiatives || []);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 mr-2 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-heading font-medium flex items-center mb-4">
          <span className="material-icons text-primary mr-2">eco</span>
          Sustainability Tips
        </h3>
        
        <div className="space-y-4">
          {dailyTip && (
            <div className="border-l-4 border-secondary p-4 bg-secondary bg-opacity-5 rounded-r-lg">
              <p className="font-medium">{dailyTip.title}</p>
              <p className="text-sm text-neutral-700 mt-1">{dailyTip.content}</p>
            </div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">Local Initiatives</h4>
            <div className="space-y-3">
              {localInitiatives.map((initiative, index) => (
                <div key={index} className="flex items-start">
                  <span className="material-icons text-secondary mr-2 text-sm mt-0.5">{initiative.icon}</span>
                  <p className="text-sm text-neutral-700">{initiative.description}</p>
                </div>
              ))}
              
              {localInitiatives.length === 0 && (
                <p className="text-neutral-600 italic">
                  No local initiatives available at the moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SustainabilityTips;
