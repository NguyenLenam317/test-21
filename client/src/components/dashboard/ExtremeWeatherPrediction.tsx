import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { UserProfile, WeatherRecommendation } from '@/types';
import { Button } from '@/components/ui/button';

interface RiskForecast {
  date: string;
  displayDate: string;
  risk: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Severe Risk';
  riskClass: string;
}

interface PredictionData {
  forecasts: RiskForecast[];
  event?: {
    title: string;
    description: string;
    probability: number;
    icon: string;
  };
  personalImpact?: string[];
}

interface ExtremeWeatherPredictionProps {
  userProfile?: UserProfile;
}

const ExtremeWeatherPrediction = ({ userProfile }: ExtremeWeatherPredictionProps) => {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);

  // Fetch extreme weather prediction
  const { data, isLoading } = useQuery({
    queryKey: ['/api/weather/extreme-prediction'],
    enabled: true,
  });

  useEffect(() => {
    if (data) {
      setPredictionData(data);
    }
  }, [data]);

  if (isLoading || !predictionData) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 mr-2 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            
            <Skeleton className="h-32 w-full rounded-lg" />
            
            <div>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-1" />
              <Skeleton className="h-4 w-full mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'Low Risk':
        return "bg-green-100 text-green-800";
      case 'Moderate Risk':
        return "bg-yellow-100 text-yellow-800";
      case 'High Risk':
        return "bg-orange-100 text-orange-800";
      case 'Severe Risk':
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-heading font-medium flex items-center mb-4">
          <span className="material-icons text-primary mr-2">storm</span>
          Extreme Weather Prediction
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium mb-2">7-Day Outlook</h4>
            <div className="space-y-3">
              {predictionData.forecasts.map((forecast, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="material-icons text-neutral-500 mr-2">calendar_today</span>
                    <span>{forecast.displayDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className={getRiskBadgeClass(forecast.risk)}>{forecast.risk}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {predictionData.event && (
            <div className="bg-warning bg-opacity-10 border-l-4 border-warning rounded-lg p-4">
              <div className="flex items-start">
                <span className="material-icons text-warning mr-2">{predictionData.event.icon}</span>
                <div>
                  <p className="font-medium">{predictionData.event.title}</p>
                  <p className="text-sm text-neutral-700 mt-1">{predictionData.event.description}</p>
                  <div className="mt-2">
                    <Button variant="link" className="text-sm text-primary font-medium p-0 h-auto">
                      View preparation tips
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {predictionData.personalImpact && predictionData.personalImpact.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Personalized Impact</h4>
              <p className="text-sm text-neutral-700">
                Based on your travel patterns and health profile, the predicted weather events may:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700 mt-2">
                {predictionData.personalImpact.map((impact, index) => (
                  <li key={index}>{impact}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtremeWeatherPrediction;
