import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import CurrentWeather from '@/components/dashboard/CurrentWeather';
import AirQuality from '@/components/dashboard/AirQuality';
import { ResponsiveLineChart, ResponsiveBarChart, ResponsiveAreaChart } from '@/lib/charts';
import { WeatherData, AirQualityData } from '@/types';
import { useUser } from '@/components/UserContext';

const Weather = () => {
  const [activeTab, setActiveTab] = useState('current');
  const { user } = useUser();
  
  // Utility function to safely handle potentially undefined data
  const safeData = <T extends object>(data: T | undefined | null): T => {
    return data || {} as T;
  };

  // Fetch weather data
  const { data: weatherData, isLoading: weatherLoading } = useQuery<WeatherData>({
    queryKey: ['/api/weather/current'],
    enabled: true,
  });

  // Fetch air quality data
  const { data: airQualityData, isLoading: airQualityLoading } = useQuery<AirQualityData>({
    queryKey: ['/api/weather/air-quality'],
    enabled: true,
  });

  // Fetch forecast data
  const { data: forecastData, isLoading: forecastLoading } = useQuery<WeatherData>({
    queryKey: ['/api/weather/forecast'],
    enabled: activeTab === 'forecast',
  });

  // Fetch historical data
  const { data: historicalData, isLoading: historicalLoading } = useQuery<WeatherData>({
    queryKey: ['/api/weather/historical'],
    enabled: activeTab === 'historical',
  });

  // Helper function to format historical chart data
  const formatHistoricalChartData = (data: any) => {
    console.log('Historical data received:', data);
    
    if (!data || !data.daily) {
      console.log('No daily data available in historical data');
      return [];
    }
    
    // Check if time array exists
    if (!data.daily.time || !Array.isArray(data.daily.time) || data.daily.time.length === 0) {
      console.log('No time data available in historical data');
      return [];
    }
    
    // Handle different possible temperature property names
    const temperatureData = 
      data.daily.temperature_mean || 
      data.daily.temperature_2m_mean || 
      data.daily.temperature_2m || 
      data.daily.temperature_max || 
      data.daily.temperature_2m_max ||
      [];
    
    // Handle different possible precipitation property names
    const precipitationData = 
      data.daily.precipitation_sum || 
      data.daily.precipitation ||
      [];
    
    if (temperatureData.length === 0 && precipitationData.length === 0) {
      console.log('Missing temperature or precipitation data in historical data');
      return [];
    }
    
    return data.daily.time.map((date: string, i: number) => ({
      name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      temperature: temperatureData[i] || 0,
      precipitation: precipitationData[i] || 0,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-2xl font-heading font-semibold mb-6">Weather in Hanoi</h2>
        
        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="current">Current Weather</TabsTrigger>
            <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {!weatherLoading && weatherData ? (
                <CurrentWeather 
                  data={weatherData}
                  isLoading={false}
                  className="col-span-2"
                />
              ) : (
                <CurrentWeather 
                  data={{} as WeatherData}
                  isLoading={true}
                  className="col-span-2"
                />
              )}
              {!airQualityLoading && airQualityData ? (
                <AirQuality 
                  data={airQualityData}
                  isLoading={false}
                  userProfile={user?.userProfile}
                />
              ) : (
                <AirQuality 
                  data={{} as AirQualityData}
                  isLoading={true}
                  userProfile={user?.userProfile}
                />
              )}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Today's Hourly Forecast</CardTitle>
                <CardDescription>Detailed hourly forecast starting from the next hour</CardDescription>
              </CardHeader>
              <CardContent>
                {weatherLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <>
                    {/* Temperature and Feels Like Chart */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-3">Temperature and Feels Like</h4>
                      <ResponsiveLineChart
                        data={(() => {
                          // Get current hour to start from next hour
                          const currentHour = new Date().getHours();
                          const hourlyData = [];
                          
                          // Map hourly data starting from current hour
                          if (weatherData?.hourly?.time) {
                            for (let i = 0; i < weatherData.hourly.time.length; i++) {
                              const timeStr = weatherData.hourly.time[i];
                              const time = new Date(timeStr);
                              // Only include future hours (from next hour onwards)
                              if (time.getHours() > currentHour || time.getDate() > new Date().getDate()) {
                                hourlyData.push({
                                  name: time.getHours() + 'h',
                                  hour: time.getHours(),
                                  temperature: weatherData.hourly.temperature_2m?.[i] || 
                                               weatherData.hourly.temperature?.[i] || 0,
                                  feels_like: weatherData.hourly.apparent_temperature?.[i] || 
                                              weatherData.hourly.apparentTemperature?.[i] || null,
                                });
                                
                                // Break once we have 24 hours of forecast
                                if (hourlyData.length >= 24) break;
                              }
                            }
                          }
                          
                          return hourlyData;
                        })()}
                        lines={[
                          { key: 'temperature', color: '#1976d2', name: 'Temperature (°C)' },
                          { key: 'feels_like', color: '#f57c00', name: 'Feels Like (°C)' },
                        ]}
                        height={200}
                        xAxisLabel="Hour"
                        yAxisLabel="Temperature (°C)"
                      />
                    </div>
                    
                    {/* Precipitation Chart */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-3">Precipitation Forecast</h4>
                      <ResponsiveBarChart
                        data={(() => {
                          // Get current hour to start from next hour
                          const currentHour = new Date().getHours();
                          const hourlyData = [];
                          
                          // Map hourly data starting from current hour
                          if (weatherData?.hourly?.time) {
                            for (let i = 0; i < weatherData.hourly.time.length; i++) {
                              const timeStr = weatherData.hourly.time[i];
                              const time = new Date(timeStr);
                              // Only include future hours (from next hour onwards)
                              if (time.getHours() > currentHour || time.getDate() > new Date().getDate()) {
                                hourlyData.push({
                                  name: time.getHours() + 'h',
                                  probability: weatherData.hourly.precipitation_probability?.[i] || 0,
                                  amount: weatherData.hourly.precipitation?.[i] || 
                                          weatherData.hourly.precipitation_sum?.[i] || 0,
                                });
                                
                                // Break once we have 24 hours of forecast
                                if (hourlyData.length >= 24) break;
                              }
                            }
                          }
                          
                          return hourlyData;
                        })()}
                        bars={[
                          { key: 'probability', color: '#2196f3', name: 'Probability (%)' },
                          { key: 'amount', color: '#4fc3f7', name: 'Amount (mm)' }
                        ]}
                        height={180}
                      />
                    </div>
                    
                    {/* Additional Weather Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Humidity and Wind</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs text-center">
                          {(() => {
                            // Get current hour to start from next hour
                            const currentHour = new Date().getHours();
                            const hourlyDetails = [];
                            
                            // Map hourly data starting from current hour
                            if (weatherData?.hourly?.time) {
                              for (let i = 0; i < weatherData.hourly.time.length; i++) {
                                const timeStr = weatherData.hourly.time[i];
                                const time = new Date(timeStr);
                                // Only include future hours (from next hour onwards)
                                if (time.getHours() > currentHour || time.getDate() > new Date().getDate()) {
                                  const humidity = weatherData.hourly.relative_humidity_2m?.[i] || 
                                                  weatherData.hourly.humidity?.[i] || 0;
                                  const windSpeed = weatherData.hourly.wind_speed_10m?.[i] || 
                                                   weatherData.hourly.wind_speed?.[i] || 0;
                                  
                                  hourlyDetails.push(
                                    <div key={i} className="bg-gray-50 p-2 rounded-lg flex flex-col items-center">
                                      <span className="font-medium">{time.getHours()}:00</span>
                                      <div className="flex items-center mt-1">
                                        <span className="material-icons text-xs mr-1">water_drop</span>
                                        <span>{humidity}%</span>
                                      </div>
                                      <div className="flex items-center mt-1">
                                        <span className="material-icons text-xs mr-1">air</span>
                                        <span>{windSpeed} km/h</span>
                                      </div>
                                    </div>
                                  );
                                  
                                  // Break once we have enough detail boxes
                                  if (hourlyDetails.length >= 9) break;
                                }
                              }
                            }
                            
                            return hourlyDetails;
                          })()}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Weather Conditions</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs text-center">
                          {(() => {
                            // Get current hour to start from next hour
                            const currentHour = new Date().getHours();
                            const hourlyConditions = [];
                            
                            // Map hourly data starting from current hour
                            if (weatherData?.hourly?.time) {
                              for (let i = 0; i < weatherData.hourly.time.length; i++) {
                                const timeStr = weatherData.hourly.time[i];
                                const time = new Date(timeStr);
                                // Only include future hours (from next hour onwards)
                                if (time.getHours() > currentHour || time.getDate() > new Date().getDate()) {
                                  const weatherCode = weatherData.hourly.weather_code?.[i] || 0;
                                  
                                  // Map weather code to icon
                                  let weatherIcon = 'help_outline'; // default
                                  if (weatherCode <= 3) weatherIcon = 'wb_sunny';
                                  else if (weatherCode <= 49) weatherIcon = 'cloud';
                                  else if (weatherCode <= 59) weatherIcon = 'grain';
                                  else if (weatherCode <= 69) weatherIcon = 'ac_unit';
                                  else if (weatherCode <= 79) weatherIcon = 'ac_unit';
                                  else if (weatherCode <= 82) weatherIcon = 'rainy';
                                  else if (weatherCode <= 86) weatherIcon = 'ac_unit';
                                  else weatherIcon = 'thunderstorm';
                                  
                                  // Get weather description based on code
                                  let description = 'Unknown';
                                  if (weatherCode <= 3) description = 'Clear';
                                  else if (weatherCode <= 49) description = 'Cloudy';
                                  else if (weatherCode <= 59) description = 'Drizzle';
                                  else if (weatherCode <= 69) description = 'Rain';
                                  else if (weatherCode <= 79) description = 'Snow';
                                  else if (weatherCode <= 82) description = 'Showers';
                                  else if (weatherCode <= 86) description = 'Snow';
                                  else description = 'Thunder';
                                  
                                  hourlyConditions.push(
                                    <div key={i} className="bg-gray-50 p-2 rounded-lg flex flex-col items-center">
                                      <span className="font-medium">{time.getHours()}:00</span>
                                      <span className="material-icons text-lg my-1">{weatherIcon}</span>
                                      <span className="text-[10px]">{description}</span>
                                    </div>
                                  );
                                  
                                  // Break once we have enough detail boxes
                                  if (hourlyConditions.length >= 9) break;
                                }
                              }
                            }
                            
                            return hourlyConditions;
                          })()}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="forecast" className="space-y-6">
            {forecastLoading ? (
              <>
                <Skeleton className="h-[200px] w-full rounded-lg mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              </>
            ) : forecastData ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>7-Day Temperature Forecast</CardTitle>
                    <CardDescription>Min, max and average temperatures for the next week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveLineChart
                      data={(forecastData.daily?.time || []).map((date: string, i: number) => {
                        // Make sure the temperature arrays exist and have data at this index
                        const min = forecastData.daily?.temperature_2m_min?.[i] || 0;
                        const max = forecastData.daily?.temperature_2m_max?.[i] || 0;
                        
                        return {
                          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                          min: min,
                          max: max,
                          avg: (min + max) / 2,
                        };
                      })}
                      lines={[
                        { key: 'min', color: '#0288d1', name: 'Min Temp (°C)' },
                        { key: 'avg', color: '#f57c00', name: 'Avg Temp (°C)' },
                        { key: 'max', color: '#d32f2f', name: 'Max Temp (°C)' },
                      ]}
                      height={250}
                    />
                    
                    <h4 className="text-sm font-medium mt-6 mb-3">Daily Weather Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                      {(forecastData.daily?.time || []).map((date: string, i: number) => {
                        const weatherCode = forecastData.daily?.weather_code?.[i] || 0;
                        const windSpeed = forecastData.daily?.wind_speed_10m_max?.[i] || 
                                         forecastData.daily?.wind_speed_max_10m?.[i] || 0;
                        const humidity = forecastData.daily?.relative_humidity_2m_max?.[i] || 
                                        forecastData.daily?.humidity_max?.[i] || 0;
                        const precipProb = forecastData.daily?.precipitation_probability_max?.[i] || 0;
                        const precipSum = forecastData.daily?.precipitation_sum?.[i] || 0;
                        const sunrise = forecastData.daily?.sunrise?.[i] ? 
                          new Date(forecastData.daily.sunrise[i]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '–';
                        const sunset = forecastData.daily?.sunset?.[i] ? 
                          new Date(forecastData.daily.sunset[i]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '–';
                        
                        // Map weather code to icon and description
                        let weatherIcon = 'help_outline'; // default
                        let description = 'Unknown';
                        if (weatherCode <= 3) { 
                          weatherIcon = 'wb_sunny'; 
                          description = 'Clear';
                        } else if (weatherCode <= 49) { 
                          weatherIcon = 'cloud'; 
                          description = 'Cloudy';
                        } else if (weatherCode <= 59) { 
                          weatherIcon = 'grain'; 
                          description = 'Drizzle';
                        } else if (weatherCode <= 69) { 
                          weatherIcon = 'rainy'; 
                          description = 'Rain';
                        } else if (weatherCode <= 79) { 
                          weatherIcon = 'ac_unit'; 
                          description = 'Snow';
                        } else if (weatherCode <= 82) { 
                          weatherIcon = 'rainy'; 
                          description = 'Showers';
                        } else if (weatherCode <= 86) { 
                          weatherIcon = 'ac_unit'; 
                          description = 'Snow';
                        } else { 
                          weatherIcon = 'thunderstorm'; 
                          description = 'Thunder';
                        }
                        
                        // Format date display
                        const dayDate = new Date(date);
                        const day = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                        const dateFormatted = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        
                        return (
                          <div key={date} className="flex flex-col p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{day}</span>
                              <span className="text-xs">{dateFormatted}</span>
                            </div>
                            
                            <div className="flex items-center justify-center mb-2">
                              <span className="material-icons text-3xl">{weatherIcon}</span>
                            </div>
                            
                            <div className="text-xs text-center mb-2">{description}</div>
                            
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">Min/Max</span>
                              <span className="text-xs">
                                {forecastData.daily?.temperature_2m_min?.[i] || 0}° / {forecastData.daily?.temperature_2m_max?.[i] || 0}°
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <span className="material-icons text-xs mr-1">water_drop</span>
                                <span className="text-xs">Precip.</span>
                              </div>
                              <span className="text-xs">{precipProb}% | {precipSum}mm</span>
                            </div>
                            
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <span className="material-icons text-xs mr-1">air</span>
                                <span className="text-xs">Wind</span>
                              </div>
                              <span className="text-xs">{windSpeed} km/h</span>
                            </div>
                            
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <span className="material-icons text-xs mr-1">humidity_percentage</span>
                                <span className="text-xs">Humidity</span>
                              </div>
                              <span className="text-xs">{humidity}%</span>
                            </div>
                            
                            <div className="text-xs text-center mt-1 border-t pt-1">
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  <span className="material-icons text-xs mr-1">wb_twilight</span>
                                  <span>{sunrise}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="material-icons text-xs mr-1">wb_twilight</span>
                                  <span>{sunset}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Precipitation Forecast</CardTitle>
                      <CardDescription>Daily precipitation probability and amount</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveBarChart
                        data={(forecastData.daily?.time || []).map((date: string, i: number) => {
                          // Safely access data with fallbacks
                          return {
                            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                            amount: forecastData.daily?.precipitation_sum?.[i] || 0,
                            probability: forecastData.daily?.precipitation_probability_max?.[i] || 0,
                          };
                        })}
                        bars={[
                          { key: 'amount', color: '#0288d1', name: 'Amount (mm)' },
                          { key: 'probability', color: '#4fc3f7', name: 'Probability (%)' }
                        ]}
                        height={250}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Weather Conditions</CardTitle>
                      <CardDescription>Daily weather conditions and wind speed</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(forecastData.daily?.time || []).map((date: string, i: number) => {
                          const weatherCode = forecastData.daily?.weather_code?.[i] || 0;
                          const windSpeed = forecastData.daily?.wind_speed_10m_max?.[i] || 
                                           forecastData.daily?.wind_speed_max_10m?.[i] || 0;
                          const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                          
                          // Map weather code to icon
                          let weatherIcon = 'help_outline'; // default
                          if (weatherCode <= 3) weatherIcon = 'wb_sunny';
                          else if (weatherCode <= 49) weatherIcon = 'cloud';
                          else if (weatherCode <= 59) weatherIcon = 'grain';
                          else if (weatherCode <= 69) weatherIcon = 'ac_unit';
                          else if (weatherCode <= 79) weatherIcon = 'ac_unit';
                          else if (weatherCode <= 82) weatherIcon = 'rainy';
                          else if (weatherCode <= 86) weatherIcon = 'ac_unit';
                          else weatherIcon = 'thunderstorm';
                          
                          return (
                            <div key={date} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium">{day}</p>
                              <span className="material-icons text-2xl my-2">{weatherIcon}</span>
                              <div className="flex items-center">
                                <span className="material-icons text-sm mr-1">air</span>
                                <span className="text-xs">{windSpeed} km/h</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <p>No forecast data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="historical" className="space-y-6">
            {historicalLoading ? (
              <Skeleton className="h-[400px] w-full rounded-lg" />
            ) : historicalData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Historical Weather Data</CardTitle>
                  <CardDescription>Temperature and precipitation for the past 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveLineChart
                    data={formatHistoricalChartData(historicalData)}
                    lines={[
                      { key: 'temperature', color: '#1976d2', name: 'Temperature (°C)' },
                      { key: 'precipitation', color: '#43a047', name: 'Precipitation (mm)' },
                    ]}
                    height={350}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-6">
                <p>No historical weather data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Weather;
