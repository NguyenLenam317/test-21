import { WeatherData } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrentWeatherProps {
  data: WeatherData;
  isLoading: boolean;
  className?: string;
}

const weatherIcons: Record<number, string> = {
  0: "wb_sunny", // Clear sky
  1: "wb_sunny", // Mainly clear
  2: "partly_cloudy_day", // Partly cloudy
  3: "cloud", // Overcast
  45: "foggy", // Fog
  48: "foggy", // Depositing rime fog
  51: "grain", // Light drizzle
  53: "grain", // Moderate drizzle
  55: "grain", // Dense drizzle
  56: "ac_unit", // Light freezing drizzle
  57: "ac_unit", // Dense freezing drizzle
  61: "rainy", // Slight rain
  63: "rainy", // Moderate rain
  65: "rainy", // Heavy rain
  66: "ac_unit", // Light freezing rain
  67: "ac_unit", // Heavy freezing rain
  71: "ac_unit", // Slight snow fall
  73: "ac_unit", // Moderate snow fall
  75: "ac_unit", // Heavy snow fall
  77: "ac_unit", // Snow grains
  80: "rainy", // Slight rain showers
  81: "rainy", // Moderate rain showers
  82: "thunderstorm", // Violent rain showers
  85: "ac_unit", // Slight snow showers
  86: "ac_unit", // Heavy snow showers
  95: "thunderstorm", // Thunderstorm
  96: "thunderstorm", // Thunderstorm with slight hail
  99: "thunderstorm", // Thunderstorm with heavy hail
};

const CurrentWeather = ({ data, isLoading, className = "" }: CurrentWeatherProps) => {
  if (isLoading || !data) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardContent className="p-6">
          <h3 className="text-lg font-heading font-medium mb-4">Current Weather in Hanoi</h3>
          <div className="flex flex-col md:flex-row items-center">
            <div className="text-center md:text-left md:mr-6 mb-4 md:mb-0">
              <div className="flex items-center justify-center md:justify-start">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-10 w-16 ml-2" />
              </div>
              <Skeleton className="h-4 w-24 mt-2" />
              <Skeleton className="h-4 w-20 mt-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-grow">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-6 w-6 mr-2" />
                  <div>
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-12 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="flex overflow-x-auto py-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col items-center mr-6 min-w-[60px]">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-6 w-6 my-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weatherIcon = data.current.weatherCode in weatherIcons 
    ? weatherIcons[data.current.weatherCode] 
    : "help_outline";

  return (
    <Card className={`shadow-md ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-lg font-heading font-medium mb-4">Current Weather in Hanoi</h3>
        <div className="flex flex-col md:flex-row items-center">
          <div className="text-center md:text-left md:mr-6 mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <span className="material-icons text-5xl text-primary-dark">{weatherIcon}</span>
              <span className="text-4xl font-light ml-2">{Math.round(data.current.temperature)}°C</span>
            </div>
            <p className="text-neutral-500">{data.current.weatherDescription}</p>
            <p className="text-sm text-neutral-600 mt-2">Feels like {Math.round(data.current.feelsLike)}°C</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-grow">
            <div className="flex items-center">
              <span className="material-icons text-neutral-500 mr-2">water_drop</span>
              <div>
                <p className="text-sm text-neutral-500">Humidity</p>
                <p className="font-medium">{data.current.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-neutral-500 mr-2">air</span>
              <div>
                <p className="text-sm text-neutral-500">Wind</p>
                <p className="font-medium">{data.current.windSpeed} km/h</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-neutral-500 mr-2">thermostat</span>
              <div>
                <p className="text-sm text-neutral-500">Pressure</p>
                <p className="font-medium">{data.current.pressure} hPa</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-neutral-500 mr-2">visibility</span>
              <div>
                <p className="text-sm text-neutral-500">Visibility</p>
                <p className="font-medium">{(data.current.visibility / 1000).toFixed(1)} km</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-neutral-600 mb-3">Today's Forecast</h4>
          <div className="flex overflow-x-auto py-2 justify-between">
            {(() => {
              const currentHour = new Date().getHours();
              const nextHour = currentHour + 1; // Get the next full hour
              const hourlyItems = [];
              
              // Find indexes for hours that are greater than or equal to the next hour
              if (data.hourly && data.hourly.time) {
                for (let i = 0; i < data.hourly.time.length; i++) {
                  const timeStr = data.hourly.time[i];
                  const time = new Date(timeStr);
                  const hour = time.getHours();
                  
                  // Only include hours from next hour onwards
                  if (hour >= nextHour || time.getDate() > new Date().getDate()) {
                    const displayHour = hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour > 12 ? `${hour-12}PM` : `${hour}AM`;
                    const temp = Math.round(data.hourly?.temperature?.[i] || 0);
                    const code = data.hourly?.weatherCode?.[i] || 0;
                    const icon = code in weatherIcons ? weatherIcons[code] : "help_outline";
                    
                    hourlyItems.push(
                      <div key={timeStr} className="flex flex-col items-center mx-auto min-w-[60px] px-2">
                        <p className="text-sm text-neutral-500">{displayHour}</p>
                        <span className="material-icons text-lg my-2">{icon}</span>
                        <p className="text-sm font-medium">{temp}°C</p>
                      </div>
                    );
                    
                    // Only show 8 hours
                    if (hourlyItems.length >= 8) break;
                  }
                }
              }
              
              return hourlyItems;
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeather;
