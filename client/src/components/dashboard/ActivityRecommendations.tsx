import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherData, AirQualityData, UserProfile, WeatherRecommendation } from '@/types';

interface ActivityRecommendationsProps {
  weatherData?: WeatherData;
  airQualityData?: AirQualityData;
  userProfile?: UserProfile;
  isLoading: boolean;
}

const ActivityRecommendations = ({ 
  weatherData, 
  airQualityData, 
  userProfile,
  isLoading,
}: ActivityRecommendationsProps) => {
  const [activityRecommendations, setActivityRecommendations] = useState<WeatherRecommendation[]>([]);
  const [optimalTimes, setOptimalTimes] = useState<{morning: boolean, afternoon: boolean, evening: boolean}>({
    morning: false,
    afternoon: false,
    evening: false
  });

  // Fetch personalized activity recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/weather/recommendations/activities'],
    enabled: !!weatherData && !!airQualityData,
  });

  useEffect(() => {
    if (recommendationsData) {
      setActivityRecommendations(recommendationsData.recommendations || []);
      setOptimalTimes(recommendationsData.optimalTimes || {
        morning: false,
        afternoon: false,
        evening: false
      });
    }
  }, [recommendationsData]);

  if (isLoading || recommendationsLoading) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 mr-2 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <div>
              <Skeleton className="h-5 w-40 mb-2" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
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
          <span className="material-icons text-primary mr-2">directions_run</span>
          Activity Recommendations
        </h3>
        <div className="space-y-4">
          <div className="rounded-lg p-4 bg-neutral-50">
            <p className="font-medium">Best time for outdoor activities today:</p>
            <p className="text-neutral-600 mt-1">
              {optimalTimes.morning && 'Morning (6:00 AM - 9:00 AM)'}
              {optimalTimes.morning && optimalTimes.evening && ' or '}
              {optimalTimes.evening && 'Evening (after 5:00 PM)'}
              {!optimalTimes.morning && !optimalTimes.afternoon && !optimalTimes.evening && 
                'Limited outdoor activities recommended today'}
            </p>
            <div className="flex flex-wrap mt-2 gap-2">
              {airQualityData && airQualityData.current.aqi < 100 && (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                  Better air quality
                </Badge>
              )}
              {weatherData && weatherData.current.humidity < 70 && (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                  Lower humidity
                </Badge>
              )}
              {weatherData && weatherData.current.temperature < 30 && (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                  Comfortable temperature
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <p className="font-medium mb-2">Recommended for you today:</p>
            <div className="space-y-3">
              {activityRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <span className="material-icons text-primary-dark mr-2 mt-0.5">
                    {recommendation.icon}
                  </span>
                  <div>
                    <p className="font-medium">{recommendation.title}</p>
                    <p className="text-sm text-neutral-600">{recommendation.description}</p>
                  </div>
                </div>
              ))}
              
              {activityRecommendations.length === 0 && (
                <p className="text-neutral-600 italic">
                  No specific activity recommendations available for today's conditions.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityRecommendations;
