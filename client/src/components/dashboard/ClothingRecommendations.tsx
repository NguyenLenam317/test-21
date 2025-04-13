import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherData, UserProfile, WeatherRecommendation } from '@/types';

interface ClothingRecommendationsProps {
  weatherData?: WeatherData;
  userProfile?: UserProfile;
  isLoading: boolean;
}

const ClothingRecommendations = ({ 
  weatherData, 
  userProfile,
  isLoading 
}: ClothingRecommendationsProps) => {
  const [clothingIcons, setClothingIcons] = useState<{icon: string, label: string}[]>([]);
  const [specificRecommendations, setSpecificRecommendations] = useState<string[]>([]);

  // Fetch personalized clothing recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/weather/recommendations/clothing'],
    enabled: !!weatherData,
  });

  useEffect(() => {
    if (recommendationsData) {
      setClothingIcons(recommendationsData.icons || []);
      setSpecificRecommendations(recommendationsData.specifics || []);
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
            <Skeleton className="h-32 w-full rounded-lg" />
            <div>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-full rounded-md mt-2" />
              <Skeleton className="h-4 w-full rounded-md mt-1" />
              <Skeleton className="h-4 w-full rounded-md mt-1" />
              <Skeleton className="h-4 w-full rounded-md mt-1" />
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
          <span className="material-icons text-primary mr-2">checkroom</span>
          Clothing Recommendations
        </h3>
        <div className="space-y-4">
          <div className="rounded-lg p-4 bg-neutral-50">
            <p className="font-medium">Today's recommendation based on weather and your preferences:</p>
            
            <div className="flex flex-col sm:flex-row mt-3 gap-4">
              {clothingIcons.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-neutral-100 p-3 rounded-lg mb-2 max-w-[120px] mx-auto">
                    <span className="material-icons text-4xl">{item.icon}</span>
                  </div>
                  <p className="text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="font-medium mb-2">Specific recommendations:</p>
            <ul className="list-disc list-inside space-y-2 text-neutral-700">
              {specificRecommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-2 pt-4 border-t">
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Note:</span> These recommendations are based on your indicated sensitivity to heat and UV radiation, as well as your {userProfile?.interests?.clothingStyle || 'casual'} clothing preference.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClothingRecommendations;
