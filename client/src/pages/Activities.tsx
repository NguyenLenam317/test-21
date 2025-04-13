import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { WeatherRecommendation } from '@/types';
import { useUser } from '@/components/UserContext';

interface TimeSlot {
  hour: number;
  label: string;
  conditions: string[];
  suitable: boolean;
  icon: string;
  temperature?: number;
  precipitation?: number;
  humidity?: number;
  uv?: number;
  aqi?: number;
}

interface OutdoorActivity {
  id: string;
  name: string;
  description: string;
  locations: {
    name: string;
    address: string;
    description: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    bestTimes: string[];
    image?: string;
  }[];
  bestWeather: string[];
  worstWeather: string[];
  indoor: boolean;
}

const Activities = () => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const { user } = useUser();
  
  // Fetch activity recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/weather/recommendations/activities'],
    enabled: true,
  });
  
  // Fetch clothing recommendations
  const { data: clothingData, isLoading: clothingLoading } = useQuery({
    queryKey: ['/api/weather/recommendations/clothing'],
    enabled: true,
  });
  
  // Fetch optimal time slots
  const { data: timeSlotData, isLoading: timeSlotLoading } = useQuery({
    queryKey: ['/api/activities/time-slots'],
    enabled: activeTab === 'optimal-times',
  });
  
  // Fetch outdoor activities
  const { data: outdoorActivitiesData, isLoading: outdoorActivitiesLoading } = useQuery({
    queryKey: ['/api/activities/outdoor'],
    enabled: activeTab === 'outdoor',
  });
  
  // Fetch indoor activities
  const { data: indoorActivitiesData, isLoading: indoorActivitiesLoading } = useQuery({
    queryKey: ['/api/activities/indoor'],
    enabled: activeTab === 'indoor',
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-2xl font-heading font-semibold mb-6">Activities & Recommendations</h2>
        
        <Tabs defaultValue="recommendations" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="recommendations">Today's Recommendations</TabsTrigger>
            <TabsTrigger value="optimal-times">Optimal Times</TabsTrigger>
            <TabsTrigger value="outdoor">Outdoor Activities</TabsTrigger>
            <TabsTrigger value="indoor">Indoor Activities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="material-icons text-primary mr-2">directions_run</span>
                    Activity Recommendations
                  </CardTitle>
                  <CardDescription>
                    Personalized suggestions based on current conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendationsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-16 w-full rounded-lg" />
                      <Skeleton className="h-16 w-full rounded-lg" />
                      <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg p-4 bg-neutral-50">
                        <p className="font-medium">Best time for outdoor activities today:</p>
                        <p className="text-neutral-600 mt-1">
                          {recommendationsData?.optimalTimes?.morning && 'Morning (6:00 AM - 9:00 AM)'}
                          {recommendationsData?.optimalTimes?.morning && recommendationsData?.optimalTimes?.evening && ' or '}
                          {recommendationsData?.optimalTimes?.evening && 'Evening (after 5:00 PM)'}
                          {!recommendationsData?.optimalTimes?.morning && !recommendationsData?.optimalTimes?.afternoon && !recommendationsData?.optimalTimes?.evening && 
                            'Limited outdoor activities recommended today'}
                        </p>
                        <div className="flex flex-wrap mt-2 gap-2">
                          {recommendationsData?.conditions?.map((condition: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2">Recommended for you today:</p>
                        <div className="space-y-3">
                          {recommendationsData?.recommendations?.map((recommendation: WeatherRecommendation, index: number) => (
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
                          
                          {(!recommendationsData?.recommendations || recommendationsData.recommendations.length === 0) && (
                            <p className="text-neutral-600 italic">
                              No specific activity recommendations available for today's conditions.
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {user?.userProfile?.healthProfile?.hasRespiratoryConditions && (
                        <Alert className="mt-4">
                          <AlertTitle>Health Consideration</AlertTitle>
                          <AlertDescription>
                            With your respiratory conditions, we've adjusted recommendations to favor activities with minimal exposure to current air pollution levels.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="material-icons text-primary mr-2">checkroom</span>
                    Clothing Recommendations
                  </CardTitle>
                  <CardDescription>
                    What to wear based on today's weather
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {clothingLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg p-4 bg-neutral-50">
                        <p className="font-medium">Today's recommendation based on weather and your preferences:</p>
                        
                        <div className="flex flex-col sm:flex-row mt-3 gap-4">
                          {clothingData?.icons?.map((item: any, index: number) => (
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
                          {clothingData?.specifics?.map((recommendation: string, index: number) => (
                            <li key={index}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-2 pt-4 border-t">
                        <p className="text-sm text-neutral-700">
                          <span className="font-medium">Note:</span> These recommendations are based on your indicated sensitivity to heat and UV radiation, as well as your {user?.userProfile?.interests?.clothingStyle || 'casual'} clothing preference.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="optimal-times" className="space-y-6">
            {timeSlotLoading ? (
              <Skeleton className="h-[500px] w-full rounded-lg" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Optimal Times for Outdoor Activities</CardTitle>
                  <CardDescription>Hourly breakdown based on weather conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(timeSlotData as TimeSlot[])?.map((slot: TimeSlot) => (
                      <div 
                        key={slot.hour}
                        className={`p-4 rounded-lg ${slot.suitable ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'} border`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{slot.label}</span>
                          <span className="material-icons text-2xl">{slot.icon}</span>
                        </div>
                        
                        <div className="space-y-2">
                          {slot.temperature !== undefined && (
                            <div className="flex justify-between items-center text-sm">
                              <span>Temperature:</span>
                              <span>{slot.temperature}°C</span>
                            </div>
                          )}
                          
                          {slot.precipitation !== undefined && (
                            <div className="flex justify-between items-center text-sm">
                              <span>Precipitation:</span>
                              <span>{slot.precipitation}%</span>
                            </div>
                          )}
                          
                          {slot.humidity !== undefined && (
                            <div className="flex justify-between items-center text-sm">
                              <span>Humidity:</span>
                              <span>{slot.humidity}%</span>
                            </div>
                          )}
                          
                          {slot.uv !== undefined && (
                            <div className="flex justify-between items-center text-sm">
                              <span>UV Index:</span>
                              <span>{slot.uv}</span>
                            </div>
                          )}
                          
                          {slot.aqi !== undefined && (
                            <div className="flex justify-between items-center text-sm">
                              <span>AQI:</span>
                              <span>{slot.aqi}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {slot.conditions.map((condition, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Badge variant={slot.suitable ? "default" : "secondary"} className="w-full justify-center">
                            {slot.suitable ? 'Recommended' : 'Not Ideal'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-2">Personalized Time Recommendations</h3>
                    <p className="text-sm">
                      {user?.userProfile ? (
                        <>
                          Based on your profile, we've highlighted times that are most suitable for your preferences and health considerations.
                          {user.userProfile.healthProfile?.hasRespiratoryConditions && ' Air quality has been given extra weight due to your respiratory conditions.'}
                          {user.userProfile.environmentalSensitivities?.uvSensitivity >= 4 && ' We have limited recommendations during peak UV hours due to your UV sensitivity.'}
                        </>
                      ) : (
                        'Complete your profile survey to receive personalized time recommendations.'
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="outdoor" className="space-y-6">
            {outdoorActivitiesLoading ? (
              <>
                <Skeleton className="h-[100px] w-full rounded-lg mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              </>
            ) : (
              <>
                <Alert className="bg-neutral-100">
                  <AlertTitle>Outdoor Activities in Hanoi</AlertTitle>
                  <AlertDescription>
                    Discover the best outdoor activities in Hanoi, with recommendations based on current weather conditions.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(outdoorActivitiesData as OutdoorActivity[])?.map((activity: OutdoorActivity) => (
                    <Card key={activity.id} className="overflow-hidden">
                      <div className="h-40 bg-neutral-100 flex items-center justify-center">
                        <span className="material-icons text-5xl text-neutral-400">photo</span>
                      </div>
                      <CardHeader>
                        <CardTitle>{activity.name}</CardTitle>
                        <CardDescription>{activity.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Popular Locations:</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {activity.locations.map((location, index) => (
                              <li key={index}>{location.name}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Best Weather Conditions:</h4>
                          <div className="flex flex-wrap gap-2">
                            {activity.bestWeather.map((condition, index) => (
                              <Badge key={index} variant="outline" className="bg-green-50">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Today's Suitability:</h4>
                          <Progress 
                            value={activity.suitabilityScore * 100 || 0} 
                            className="h-2"
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs">Not Suitable</span>
                            <span className="text-xs">Perfect</span>
                          </div>
                        </div>
                        
                        {activity.currentAlert && (
                          <Alert variant="warning" className="mt-2 py-2">
                            <AlertDescription className="text-xs">
                              {activity.currentAlert}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="indoor" className="space-y-6">
            {indoorActivitiesLoading ? (
              <>
                <Skeleton className="h-[100px] w-full rounded-lg mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              </>
            ) : (
              <>
                <Alert className="bg-neutral-100">
                  <AlertTitle>Indoor Activities in Hanoi</AlertTitle>
                  <AlertDescription>
                    Perfect for days with unfavorable weather conditions or when you prefer to stay indoors.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(indoorActivitiesData as OutdoorActivity[])?.map((activity: OutdoorActivity) => (
                    <Card key={activity.id} className="overflow-hidden">
                      <div className="h-40 bg-neutral-100 flex items-center justify-center">
                        <span className="material-icons text-5xl text-neutral-400">photo</span>
                      </div>
                      <CardHeader>
                        <CardTitle>{activity.name}</CardTitle>
                        <CardDescription>{activity.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Popular Locations:</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {activity.locations.map((location, index) => (
                              <li key={index}>{location.name}</li>
                            ))}
                          </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Best Times:</h4>
                            <div className="flex flex-wrap gap-2">
                              {activity.locations[0].bestTimes.map((time, index) => (
                                <Badge key={index} variant="outline">
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {activity.personalizedNote && (
                            <Alert className="mt-2 py-2">
                              <AlertDescription className="text-xs">
                                {activity.personalizedNote}
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    );
  };
  
  export default Activities;
