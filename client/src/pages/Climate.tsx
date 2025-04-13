import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveLineChart, ResponsiveAreaChart, ResponsiveBarChart } from '@/lib/charts';
import { ClimateData, FloodRiskData } from '@/types';
import { useUser } from '@/components/UserContext';

const Climate = () => {
  const [activeTab, setActiveTab] = useState('temperature');
  const { user } = useUser();
  
  // Fetch climate change data
  const { data: climateData, isLoading: climateLoading } = useQuery({
    queryKey: ['/api/climate/data'],
    enabled: true,
  });
  
  // Fetch flood risk data
  const { data: floodRiskData, isLoading: floodRiskLoading } = useQuery({
    queryKey: ['/api/climate/flood-risk'],
    enabled: activeTab === 'flood-risk',
  });
  
  // Fetch climate projections
  const { data: climateProjectionsData, isLoading: climateProjectionsLoading } = useQuery({
    queryKey: ['/api/climate/projections'],
    enabled: activeTab === 'projections',
  });

  // Format temperature data for chart
  const formatTemperatureData = (data: ClimateData) => {
    if (!data || !data.temperature) return [];
    
    return data.temperature.years.map((year, i) => ({
      name: year,
      temperature: data.temperature.values[i],
    }));
  };
  
  // Format precipitation data for chart
  const formatPrecipitationData = (data: ClimateData) => {
    if (!data || !data.precipitation) return [];
    
    return data.precipitation.years.map((year, i) => ({
      name: year,
      precipitation: data.precipitation.values[i],
    }));
  };
  
  // Format extreme events data for chart
  const formatExtremeEventsData = (data: ClimateData) => {
    if (!data || !data.extremeEvents) return [];
    
    return data.extremeEvents.years.map((year, i) => ({
      name: year,
      heatwaves: data.extremeEvents.heatwaves[i],
      floods: data.extremeEvents.floods[i],
      droughts: data.extremeEvents.droughts[i],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-2xl font-heading font-semibold mb-6">Climate Change in Hanoi</h2>
        
        <Tabs defaultValue="temperature" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="temperature">Temperature Trends</TabsTrigger>
            <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
            <TabsTrigger value="extreme-events">Extreme Events</TabsTrigger>
            <TabsTrigger value="flood-risk">Flood Risk</TabsTrigger>
            <TabsTrigger value="projections">Future Projections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="temperature" className="space-y-6">
            {climateLoading ? (
              <>
                <Skeleton className="h-[400px] w-full rounded-lg mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Skeleton className="h-[200px] w-full rounded-lg col-span-2" />
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                </div>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Hanoi Temperature Trends (1990-2023)</CardTitle>
                    <CardDescription>Annual average temperatures showing climate change impact</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveLineChart
                      data={formatTemperatureData(climateData)}
                      lines={[
                        { key: 'temperature', color: '#e53935', name: 'Annual Avg Temperature (°C)' },
                      ]}
                      height={400}
                      xAxisLabel="Year"
                      yAxisLabel="Temperature (°C)"
                    />
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Key Observations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>
                        Hanoi has experienced a significant warming trend over the past three decades, with an average temperature increase of 1.2°C since 1990.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center">
                            <span className="material-icons text-red-500 mr-1 text-sm">trending_up</span>
                            Rising Temperatures
                          </h4>
                          <p className="text-sm">
                            The rate of warming has accelerated since 2000, with 8 of the 10 warmest years on record occurring after 2010.
                          </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center">
                            <span className="material-icons text-amber-500 mr-1 text-sm">wb_sunny</span>
                            Heat Waves
                          </h4>
                          <p className="text-sm">
                            Heat wave frequency has increased by 35% in the last decade compared to the 1990s.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user?.userProfile ? (
                        <div className="space-y-3">
                          <p className="text-sm">Based on your profile, rising temperatures may affect you in the following ways:</p>
                          
                          {user.userProfile.healthProfile?.hasRespiratoryConditions && (
                            <div className="flex items-start">
                              <span className="material-icons text-warning mr-2 text-sm mt-0.5">warning</span>
                              <p className="text-sm">Your respiratory conditions may be aggravated during extreme heat events.</p>
                            </div>
                          )}
                          
                          {user.userProfile.environmentalSensitivities?.heatSensitivity >= 4 && (
                            <div className="flex items-start">
                              <span className="material-icons text-warning mr-2 text-sm mt-0.5">warning</span>
                              <p className="text-sm">Your high sensitivity to heat means you should take extra precautions during hot periods.</p>
                            </div>
                          )}
                          
                          <div className="flex items-start">
                            <span className="material-icons text-secondary mr-2 text-sm mt-0.5">tips_and_updates</span>
                            <p className="text-sm">Consider adapting your daily activities to cooler parts of the day as temperatures rise.</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-neutral-600">
                          Complete your profile survey to receive personalized climate impact information.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="precipitation" className="space-y-6">
            {climateLoading ? (
              <Skeleton className="h-[400px] w-full rounded-lg" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Precipitation Changes in Hanoi (1990-2023)</CardTitle>
                  <CardDescription>Annual rainfall totals and patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ResponsiveLineChart
                    data={formatPrecipitationData(climateData)}
                    lines={[
                      { key: 'precipitation', color: '#1976d2', name: 'Annual Precipitation (mm)' },
                    ]}
                    height={350}
                    xAxisLabel="Year"
                    yAxisLabel="Precipitation (mm)"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Changing Rainfall Patterns</h4>
                      <p className="text-sm">
                        While total annual precipitation has shown less significant change, the distribution and intensity of rainfall has shifted dramatically. Hanoi now experiences 15% more intense rain events than in the 1990s, while the number of rainy days has decreased.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Monsoon Season Impacts</h4>
                      <p className="text-sm">
                        The summer monsoon season has become more unpredictable, with delayed onset in some years and increased intensity in others. This unpredictability challenges traditional farming practices and urban planning.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="extreme-events" className="space-y-6">
            {climateLoading ? (
              <Skeleton className="h-[400px] w-full rounded-lg" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Extreme Weather Events in Hanoi (1990-2023)</CardTitle>
                    <CardDescription>Frequency of heatwaves, floods, and droughts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveBarChart
                      data={formatExtremeEventsData(climateData)}
                      bars={[
                        { key: 'heatwaves', color: '#f57c00', name: 'Heatwaves' },
                        { key: 'floods', color: '#1976d2', name: 'Floods' },
                        { key: 'droughts', color: '#d32f2f', name: 'Droughts' },
                      ]}
                      height={350}
                      xAxisLabel="Year"
                      yAxisLabel="Number of Events"
                    />
                  </CardContent>
                </Card>
                
                <Alert variant="destructive">
                  <AlertTitle>Increasing Extreme Weather Events</AlertTitle>
                  <AlertDescription>
                    The data shows a clear upward trend in extreme weather events affecting Hanoi. Heat waves have increased most significantly, followed by more frequent flooding events, particularly in urban areas with poor drainage infrastructure.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="material-icons text-orange-500 mr-2">wb_sunny</span>
                        Heatwaves
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Heatwaves in Hanoi are defined as periods of 3+ consecutive days with temperatures exceeding 35°C. These events have increased by 58% since 1990, with longer duration and higher intensity.
                      </p>
                      <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                        <h4 className="text-sm font-medium">Health Impacts</h4>
                        <p className="text-xs mt-1">
                          Increased heat-related illnesses, especially among the elderly and those with underlying health conditions.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="material-icons text-blue-500 mr-2">water</span>
                        Flooding
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Urban flooding has become more frequent in Hanoi, especially in low-lying districts. Flash floods from intense rainfall events overwhelm drainage systems designed for historical precipitation patterns.
                      </p>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium">Infrastructure Impacts</h4>
                        <p className="text-xs mt-1">
                          Transportation disruptions, property damage, and contaminated water supplies.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="material-icons text-red-500 mr-2">grain</span>
                        Droughts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Although less frequent than floods and heatwaves, drought periods have intensified, particularly affecting agricultural areas surrounding Hanoi and water supply to the city.
                      </p>
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <h4 className="text-sm font-medium">Resource Impacts</h4>
                        <p className="text-xs mt-1">
                          Agricultural productivity reduction, water shortages, and increased energy demand for cooling.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="flood-risk" className="space-y-6">
            {floodRiskLoading ? (
              <>
                <Skeleton className="h-[300px] w-full rounded-lg mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                </div>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Flood Risk Assessment for Hanoi</CardTitle>
                    <CardDescription>Current and projected flood risk for different areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Current Flood Risk: {(floodRiskData as FloodRiskData)?.risk.toUpperCase()}</h3>
                        <div className={`p-4 rounded-lg ${
                          (floodRiskData as FloodRiskData)?.risk === 'low' ? 'bg-green-50 border-l-4 border-green-500' :
                          (floodRiskData as FloodRiskData)?.risk === 'moderate' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                          (floodRiskData as FloodRiskData)?.risk === 'high' ? 'bg-orange-50 border-l-4 border-orange-500' :
                          'bg-red-50 border-l-4 border-red-500'
                        }`}>
                          <p className="text-sm">
                            {(floodRiskData as FloodRiskData)?.risk === 'low' ? 
                              'Current flood risk is low. Normal precautions are sufficient.' :
                              (floodRiskData as FloodRiskData)?.risk === 'moderate' ? 
                              'Moderate flood risk exists. Stay informed about weather forecasts.' :
                              (floodRiskData as FloodRiskData)?.risk === 'high' ? 
                              'High flood risk alert. Be prepared for potential flooding in low-lying areas.' :
                              'Severe flood risk warning. Take immediate precautions and follow local authority guidance.'
                            }
                          </p>
                        </div>
                        
                        <h3 className="text-lg font-medium mt-6 mb-3">Forecast Risk (Next 7 Days)</h3>
                        <div className="space-y-3">
                          {(floodRiskData as FloodRiskData)?.forecast.map((day, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                              <span>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                day.risk === 'low' ? 'bg-green-100 text-green-800' :
                                day.risk === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                day.risk === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {day.risk.charAt(0).toUpperCase() + day.risk.slice(1)} Risk
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center p-4 bg-neutral-50 rounded-lg">
                        <div className="text-center">
                          <h3 className="text-lg font-medium mb-3">Hanoi Flood Risk Map</h3>
                          <p className="text-neutral-500 mb-4">Interactive map not available in this view</p>
                          <div className="flex justify-center gap-4">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-green-500 rounded-full mr-1"></div>
                              <span className="text-xs">Low Risk</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-1"></div>
                              <span className="text-xs">Moderate Risk</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-orange-500 rounded-full mr-1"></div>
                              <span className="text-xs">High Risk</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-red-500 rounded-full mr-1"></div>
                              <span className="text-xs">Severe Risk</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>High-Risk Areas in Hanoi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Hoàn Kiếm District (particularly streets adjacent to Hoàn Kiếm Lake)</li>
                        <li>Ba Đình District (low-lying areas)</li>
                        <li>Hai Bà Trưng District (particularly along the Red River)</li>
                        <li>Long Biên District (riverfront areas)</li>
                        <li>Tây Hồ District (areas around West Lake)</li>
                        <li>Suburban agricultural areas in the south and east</li>
                      </ul>
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2">Flood-Prone Infrastructure</h4>
                        <p className="text-sm">
                          Many of Hanoi's underpasses, older drainage systems, and low-lying roads are particularly vulnerable during heavy rainfall events. Urban development has reduced natural drainage capacity in many areas.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Preparedness</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-neutral-50 rounded-lg">
                        <h4 className="font-medium mb-2">Before a Flood</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Create an emergency plan and kit</li>
                          <li>Know evacuation routes from your area</li>
                          <li>Store important documents in waterproof containers</li>
                          <li>Install check valves in plumbing to prevent backups</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-neutral-50 rounded-lg">
                        <h4 className="font-medium mb-2">During a Flood</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Move to higher ground if advised</li>
                          <li>Do not walk, swim, or drive through flood waters</li>
                          <li>Stay off bridges over fast-moving water</li>
                          <li>Disconnect utilities if instructed by authorities</li>
                        </ul>
                      </div>
                      
                      {user?.userProfile?.lifestyleHabits?.transportation.includes('motorbike') && (
                        <Alert>
                          <AlertTitle>Motorbike Users</AlertTitle>
                          <AlertDescription>
                            As a motorbike user, avoid driving through flooded areas as even shallow water can cause engine damage and increase accident risk.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="projections" className="space-y-6">
            {climateProjectionsLoading ? (
              <Skeleton className="h-[400px] w-full rounded-lg" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Climate Projections for Hanoi (2023-2050)</CardTitle>
                    <CardDescription>Based on multiple climate models and scenarios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveAreaChart
                      data={(climateProjectionsData?.years || []).map((year, i) => ({
                        name: year,
                        optimistic: climateProjectionsData?.temperature?.optimistic[i],
                        moderate: climateProjectionsData?.temperature?.moderate[i],
                        pessimistic: climateProjectionsData?.temperature?.pessimistic[i],
                      }))}
                      areas={[
                        { key: 'optimistic', color: '#4caf50', name: 'Optimistic Scenario (RCP 2.6)' },
                        { key: 'moderate', color: '#ff9800', name: 'Moderate Scenario (RCP 4.5)' },
                        { key: 'pessimistic', color: '#f44336', name: 'Pessimistic Scenario (RCP 8.5)' },
                      ]}
                      height={400}
                      stacked={false}
                      xAxisLabel="Year"
                      yAxisLabel="Temperature (°C)"
                    />
                  </CardContent>
                </Card>
                
                <Alert className="bg-neutral-100 border-0">
                  <AlertDescription>
                    <span className="font-medium">About these projections:</span> The graphs show projections from multiple climate models under different emissions scenarios. The optimistic scenario assumes strong mitigation efforts, while the pessimistic scenario assumes continued high emissions.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Temperature Projections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-neutral-50 rounded-lg">
                          <p className="text-sm">
                            By 2050, Hanoi is projected to experience an additional temperature increase of 1.0°C to 2.5°C compared to current levels, depending on global emission scenarios.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Optimistic Scenario</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">+1.0°C</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Moderate Scenario</span>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">+1.8°C</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Pessimistic Scenario</span>
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">+2.5°C</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Precipitation Projections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-neutral-50 rounded-lg">
                          <p className="text-sm">
                            Annual precipitation is projected to increase by 2-10%, but with greater seasonal variability and more intense rainfall events.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Dry Season Length</span>
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">+5 to 15 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Heavy Rain Events</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">+20 to 35%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Flood Risk</span>
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Significantly Higher</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>What This Means For You</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user?.userProfile ? (
                          <>
                            <p className="text-sm">Based on your profile, future climate projections could impact you in these ways:</p>
                            
                            {user.userProfile.healthProfile?.hasRespiratoryConditions && (
                              <div className="flex items-start">
                                <span className="material-icons text-warning mr-2 text-sm mt-0.5">warning</span>
                                <p className="text-sm">More frequent and intense heat waves may worsen respiratory conditions, requiring additional management strategies.</p>
                              </div>
                            )}
                            
                            {user.userProfile.lifestyleHabits?.dailyRoutine === 'outdoor_recreation' && (
                              <div className="flex items-start">
                                <span className="material-icons text-warning mr-2 text-sm mt-0.5">warning</span>
                                <p className="text-sm">Your outdoor activities may be increasingly affected by extreme heat and intense rainfall events.</p>
                              </div>
                            )}
                            
                            {user.userProfile.lifestyleHabits?.transportation.includes('motorbike') && (
                              <div className="flex items-start">
                                <span className="material-icons text-warning mr-2 text-sm mt-0.5">warning</span>
                                <p className="text-sm">Increased flood risk may impact your motorbike commuting, requiring alternative transportation planning.</p>
                              </div>
                            )}
                            
                            <div className="flex items-start">
                              <span className="material-icons text-secondary mr-2 text-sm mt-0.5">tips_and_updates</span>
                              <p className="text-sm">Consider incorporating climate resilience measures into your long-term planning.</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-neutral-600">
                            Complete your profile survey to receive personalized climate impact projections.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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

export default Climate;
