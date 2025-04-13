import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../UserContext';
import { Alert, WeatherData, AirQualityData, ClimateData } from '@/types';

import PersonalizedAlerts from './PersonalizedAlerts';
import CurrentWeather from './CurrentWeather';
import AirQuality from './AirQuality';
import ActivityRecommendations from './ActivityRecommendations';
import ClothingRecommendations from './ClothingRecommendations';
import ClimateChangeInsights from './ClimateChangeInsights';
import ExtremeWeatherPrediction from './ExtremeWeatherPrediction';
import AIChatbot from './AIChatbot';
import SustainabilityTips from './SustainabilityTips';
import SustainabilityPolls from './SustainabilityPolls';
import { queryClient } from '@/lib/queryClient';

const Dashboard = () => {
  const { user } = useUser();
  const [username, setUsername] = useState('User');
  const [greeting, setGreeting] = useState('Good day');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Fetch weather data
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['/api/weather/current'],
    enabled: true,
  });

  // Fetch air quality data
  const { data: airQualityData, isLoading: airQualityLoading } = useQuery({
    queryKey: ['/api/weather/air-quality'],
    enabled: true,
  });

  // Fetch climate change data
  const { data: climateData, isLoading: climateLoading } = useQuery({
    queryKey: ['/api/climate/data'],
    enabled: true,
  });

  // Fetch personalized alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/weather/alerts'],
    enabled: true,
  });

  useEffect(() => {
    // Set username from user profile
    if (user) {
      setUsername(user.username);
    }

    // Set appropriate greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    // Set alerts from API data
    if (alertsData) {
      setAlerts(alertsData);
    }
  }, [user, alertsData]);

  // Force refetch all data when user profile changes
  useEffect(() => {
    if (user && user.userProfile) {
      queryClient.invalidateQueries({ queryKey: ['/api/weather/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/weather/recommendations'] });
    }
  }, [user?.userProfile]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Personalized greeting */}
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-semibold">
          {greeting}, {username}!
        </h2>
        <p className="text-neutral-600">
          Here's your personalized environmental dashboard for Hanoi today.
        </p>
      </div>

      {/* Personalized alerts section */}
      {alerts && alerts.length > 0 && (
        <PersonalizedAlerts alerts={alerts} isLoading={alertsLoading} />
      )}

      {/* Current weather section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CurrentWeather 
          data={weatherData as WeatherData} 
          isLoading={weatherLoading}
          className="col-span-2" 
        />
        <AirQuality 
          data={airQualityData as AirQualityData} 
          isLoading={airQualityLoading}
          userProfile={user?.userProfile} 
        />
      </div>

      {/* Personalized recommendations section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ActivityRecommendations 
          weatherData={weatherData as WeatherData}
          airQualityData={airQualityData as AirQualityData}
          userProfile={user?.userProfile}
          isLoading={weatherLoading || airQualityLoading}
        />
        <ClothingRecommendations 
          weatherData={weatherData as WeatherData}
          userProfile={user?.userProfile}
          isLoading={weatherLoading}
        />
      </div>

      {/* Climate change insights section */}
      <ClimateChangeInsights 
        data={climateData as ClimateData} 
        isLoading={climateLoading}
        userProfile={user?.userProfile}
        className="mb-8"
      />

      {/* Extreme weather prediction section */}
      <div className="mb-8">
        <ExtremeWeatherPrediction 
          userProfile={user?.userProfile} 
        />
      </div>

      {/* AI Chatbot section - centered */}
      <div className="mb-8 max-w-3xl mx-auto">
        <AIChatbot userProfile={user?.userProfile} />
      </div>

      {/* Community and sustainability section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SustainabilityTips />
        <SustainabilityPolls className="col-span-1 md:col-span-2" />
      </div>
    </div>
  );
};

export default Dashboard;
