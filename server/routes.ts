import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getOpenMeteoForecast, getOpenMeteoAirQuality, getOpenMeteoHistorical, getOpenMeteoFloodRisk, getOpenMeteoPollen, getOpenMeteoClimateData } from "./api/open-meteo";
import { getGroqCompletion } from "./api/groq-client";
import { createWebSocketServer } from "./websocket";

// Define helper types for response data
interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    weatherDescription: string;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    isDay: boolean;
  };
  hourly: {
    time: string[];
    temperature: number[];
    weatherCode: number[];
    weatherDescription: string[];
  };
  daily: {
    time: string[];
    weatherCode: number[];
    temperatureMax: number[];
    temperatureMin: number[];
    sunrise: string[];
    sunset: string[];
    precipitationProbability: number[];
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============ USER ROUTES ============
  
  // Get user profile with survey and preferences
  app.get("/api/user/profile", async (req: Request, res: Response) => {
    try {
      // For now, using demo user with ID=0
      const userId = 0;
      const user = await storage.getUser(userId);
      const survey = await storage.getSurvey(userId);
      const hasSurveyCompleted = survey?.completed || false;
      
      // Get user profile data if survey is completed
      let userProfile = null;
      if (hasSurveyCompleted) {
        const healthProfile = await storage.getHealthProfile(userId);
        const lifestyleHabits = await storage.getLifestyleHabits(userId);
        const environmentalSensitivities = await storage.getEnvironmentalSensitivities(userId);
        const interests = await storage.getInterests(userId);
        
        userProfile = {
          healthProfile,
          lifestyleHabits,
          environmentalSensitivities,
          interests
        };
      }
      
      // Return user data
      res.json({
        id: userId,
        username: user?.username || "demo_user",
        hasSurveyCompleted,
        userProfile
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Error fetching user profile" });
    }
  });
  
  // Update user profile
  app.post("/api/user/profile", async (req: Request, res: Response) => {
    try {
      // For now, using demo user with ID=0
      const userId = 0;
      const profile = req.body;
      
      // Update each profile section if provided
      if (profile.healthProfile) {
        await storage.updateHealthProfile(userId, profile.healthProfile);
      }
      
      if (profile.lifestyleHabits) {
        await storage.updateLifestyleHabits(userId, profile.lifestyleHabits);
      }
      
      if (profile.environmentalSensitivities) {
        await storage.updateEnvironmentalSensitivities(userId, profile.environmentalSensitivities);
      }
      
      if (profile.interests) {
        await storage.updateInterests(userId, profile.interests);
      }
      
      // Get the updated profile to return
      const healthProfile = await storage.getHealthProfile(userId);
      const lifestyleHabits = await storage.getLifestyleHabits(userId);
      const environmentalSensitivities = await storage.getEnvironmentalSensitivities(userId);
      const interests = await storage.getInterests(userId);
      
      const userProfile = {
        healthProfile,
        lifestyleHabits,
        environmentalSensitivities,
        interests
      };
      
      res.json({ userProfile });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Error updating user profile" });
    }
  });
  
  // Mark survey as completed
  app.post("/api/user/survey/complete", async (req: Request, res: Response) => {
    try {
      // For now, using demo user with ID=0
      const userId = 0;
      const survey = await storage.getSurvey(userId);
      
      if (survey) {
        await storage.updateSurvey(userId, { ...survey, completed: true });
      } else {
        await storage.createSurvey(userId, { completed: true, lastStep: 3 });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing survey:", error);
      res.status(500).json({ message: "Error completing survey" });
    }
  });
  
  // ============ WEATHER ROUTES ============
  
  // Get current weather data
  app.get("/api/weather/current", async (req: Request, res: Response) => {
    try {
      const forecast = await getOpenMeteoForecast();
      
      // Process and format the data
      const currentHour = new Date().getHours();
      const currentWeatherCode = forecast.hourly.weather_code[currentHour];
      
      // Map weather code to description
      const weatherDescription = getWeatherDescription(currentWeatherCode);
      
      const weatherData: WeatherData = {
        current: {
          temperature: forecast.hourly.temperature_2m[currentHour],
          weatherCode: currentWeatherCode,
          weatherDescription,
          feelsLike: forecast.hourly.apparent_temperature[currentHour],
          humidity: forecast.hourly.relative_humidity_2m[currentHour],
          windSpeed: forecast.hourly.wind_speed_10m[currentHour],
          pressure: forecast.hourly.surface_pressure[currentHour],
          visibility: forecast.hourly.visibility[currentHour],
          isDay: forecast.hourly.is_day[currentHour] === 1
        },
        hourly: {
          time: forecast.hourly.time.slice(0, 24),
          temperature: forecast.hourly.temperature_2m.slice(0, 24),
          weatherCode: forecast.hourly.weather_code.slice(0, 24),
          weatherDescription: forecast.hourly.weather_code.slice(0, 24).map(code => getWeatherDescription(code))
        },
        daily: {
          time: forecast.daily.time,
          weatherCode: forecast.daily.weather_code,
          temperatureMax: forecast.daily.temperature_2m_max,
          temperatureMin: forecast.daily.temperature_2m_min,
          sunrise: forecast.daily.sunrise,
          sunset: forecast.daily.sunset,
          precipitationProbability: forecast.daily.precipitation_probability_max
        }
      };
      
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ message: "Error fetching weather data" });
    }
  });
  
  // Get air quality data
  app.get("/api/weather/air-quality", async (req: Request, res: Response) => {
    try {
      const airQualityData = await getOpenMeteoAirQuality();
      
      // Process and format the data
      const currentHour = new Date().getHours();
      const currentEuropeanAQI = airQualityData.hourly.european_aqi[currentHour];
      
      // Get AQI category
      const aqiCategory = getAQICategory(currentEuropeanAQI);
      
      const formattedData = {
        current: {
          pm2_5: airQualityData.hourly.pm2_5[currentHour],
          pm10: airQualityData.hourly.pm10[currentHour],
          no2: airQualityData.hourly.nitrogen_dioxide[currentHour],
          o3: airQualityData.hourly.ozone[currentHour],
          so2: airQualityData.hourly.sulphur_dioxide[currentHour],
          co: airQualityData.hourly.carbon_monoxide[currentHour],
          aqi: currentEuropeanAQI,
          aqiCategory
        },
        hourly: {
          time: airQualityData.hourly.time.slice(0, 24),
          pm2_5: airQualityData.hourly.pm2_5.slice(0, 24),
          pm10: airQualityData.hourly.pm10.slice(0, 24),
          aqi: airQualityData.hourly.european_aqi.slice(0, 24)
        }
      };
      
      res.json(formattedData);
    } catch (error) {
      console.error("Error fetching air quality data:", error);
      res.status(500).json({ message: "Error fetching air quality data" });
    }
  });
  
  // Get historical weather data
  app.get("/api/weather/historical", async (req: Request, res: Response) => {
    try {
      const historicalData = await getOpenMeteoHistorical();
      res.json(historicalData);
    } catch (error) {
      console.error("Error fetching historical weather data:", error);
      res.status(500).json({ message: "Error fetching historical weather data" });
    }
  });
  
  // Get forecast data
  app.get("/api/weather/forecast", async (req: Request, res: Response) => {
    try {
      const forecastData = await getOpenMeteoForecast();
      res.json(forecastData);
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
      res.status(500).json({ message: "Error fetching weather forecast" });
    }
  });
  
  // Get air quality forecast
  app.get("/api/weather/air-quality/forecast", async (req: Request, res: Response) => {
    try {
      const airQualityData = await getOpenMeteoAirQuality();
      res.json(airQualityData);
    } catch (error) {
      console.error("Error fetching air quality forecast:", error);
      res.status(500).json({ message: "Error fetching air quality forecast" });
    }
  });
  
  // Get historical air quality data
  app.get("/api/weather/air-quality/historical", async (req: Request, res: Response) => {
    try {
      // Using the same air quality API for now, but could be replaced with historical endpoint
      const airQualityData = await getOpenMeteoAirQuality();
      res.json(airQualityData);
    } catch (error) {
      console.error("Error fetching historical air quality data:", error);
      res.status(500).json({ message: "Error fetching historical air quality data" });
    }
  });
  
  // Get pollen data
  app.get("/api/weather/pollen", async (req: Request, res: Response) => {
    try {
      const pollenData = await getOpenMeteoPollen();
      res.json(pollenData);
    } catch (error) {
      console.error("Error fetching pollen data:", error);
      res.status(500).json({ message: "Error fetching pollen data" });
    }
  });
  
  // ============ CLIMATE ROUTES ============
  
  // Get climate data
  app.get("/api/climate/data", async (req: Request, res: Response) => {
    try {
      const climateData = await getOpenMeteoClimateData();
      
      // Process the data to create a historical dataset
      const years = Array.from({ length: 30 }, (_, i) => 1993 + i);
      const temperatureValues = years.map(year => {
        // Simulate a rising temperature trend with some variation
        const baseTemp = 24.5; // Base temperature for Hanoi
        const yearOffset = (year - 1993) * 0.04; // Gradual increase
        const variation = Math.random() * 0.3 - 0.15; // Random variation
        return +(baseTemp + yearOffset + variation).toFixed(1);
      });
      
      const precipitationValues = years.map(year => {
        // Simulate precipitation data with increasing variability
        const basePrecip = 1800; // Base annual precipitation for Hanoi in mm
        const variation = Math.random() * 400 - 200; // Random variation
        return Math.round(basePrecip + variation);
      });
      
      // Generate extreme events data
      const extremeEvents = {
        years,
        heatwaves: years.map(year => {
          // Increasing trend of heatwaves
          const baseCount = Math.floor((year - 1993) / 5); // Base increase
          const random = Math.floor(Math.random() * 2); // Random variation
          return Math.max(0, baseCount + random);
        }),
        floods: years.map(year => {
          // Slightly increasing trend of floods
          const baseCount = Math.floor((year - 1993) / 7); // Base increase
          const random = Math.floor(Math.random() * 2); // Random variation
          return Math.max(0, baseCount + random);
        }),
        droughts: years.map(year => {
          // Less frequent droughts
          const random = Math.floor(Math.random() * 2); // Random occurrence
          return Math.max(0, (year % 5 === 0 ? 1 : 0) + random - 1);
        })
      };
      
      const formattedClimateData = {
        temperature: {
          years,
          values: temperatureValues
        },
        precipitation: {
          years,
          values: precipitationValues
        },
        extremeEvents
      };
      
      res.json(formattedClimateData);
    } catch (error) {
      console.error("Error fetching climate data:", error);
      res.status(500).json({ message: "Error fetching climate data" });
    }
  });
  
  // Get flood risk data
  app.get("/api/climate/flood-risk", async (req: Request, res: Response) => {
    try {
      const floodData = await getOpenMeteoFloodRisk();
      
      // Process the data to create risk assessments
      const currentDate = new Date();
      const nextWeek = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(currentDate.getDate() + i);
        return date.toISOString().split('T')[0];
      });
      
      // Determine current risk level based on river discharge
      const currentDischarge = floodData.daily.river_discharge[0];
      let currentRisk: 'low' | 'moderate' | 'high' | 'severe' = 'low';
      
      if (currentDischarge > 1000) {
        currentRisk = 'severe';
      } else if (currentDischarge > 700) {
        currentRisk = 'high';
      } else if (currentDischarge > 400) {
        currentRisk = 'moderate';
      }
      
      // Create forecast data
      const forecast = nextWeek.map((date, index) => {
        const discharge = floodData.daily.river_discharge[index];
        let risk: 'low' | 'moderate' | 'high' | 'severe' = 'low';
        
        if (discharge > 1000) {
          risk = 'severe';
        } else if (discharge > 700) {
          risk = 'high';
        } else if (discharge > 400) {
          risk = 'moderate';
        }
        
        return { date, risk };
      });
      
      const formattedFloodData = {
        risk: currentRisk,
        forecast
      };
      
      res.json(formattedFloodData);
    } catch (error) {
      console.error("Error fetching flood risk data:", error);
      res.status(500).json({ message: "Error fetching flood risk data" });
    }
  });
  
  // Get climate projections
  app.get("/api/climate/projections", async (req: Request, res: Response) => {
    try {
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 28 }, (_, i) => currentYear + i);
      
      // Generate temperature projections for different scenarios
      const temperature = {
        optimistic: years.map((year, i) => {
          const baseTemp = 25.5; // Current average temperature
          const yearOffset = (i * 0.035); // Gradual increase in optimistic scenario
          const variation = Math.random() * 0.2 - 0.1; // Small random variation
          return +(baseTemp + yearOffset + variation).toFixed(1);
        }),
        moderate: years.map((year, i) => {
          const baseTemp = 25.5;
          const yearOffset = (i * 0.065); // Moderate increase
          const variation = Math.random() * 0.2 - 0.1;
          return +(baseTemp + yearOffset + variation).toFixed(1);
        }),
        pessimistic: years.map((year, i) => {
          const baseTemp = 25.5;
          const yearOffset = (i * 0.09); // Larger increase in pessimistic scenario
          const variation = Math.random() * 0.2 - 0.1;
          return +(baseTemp + yearOffset + variation).toFixed(1);
        })
      };
      
      res.json({
        years,
        temperature
      });
    } catch (error) {
      console.error("Error generating climate projections:", error);
      res.status(500).json({ message: "Error generating climate projections" });
    }
  });
  
  // ============ RECOMMENDATIONS ROUTES ============
  
  // Get weather-based alerts
  app.get("/api/weather/alerts", async (req: Request, res: Response) => {
    try {
      // Get current weather and air quality data
      const forecast = await getOpenMeteoForecast();
      const airQuality = await getOpenMeteoAirQuality();
      
      // Get user health profile for personalization (if available)
      const userId = 0; // Using demo user for now
      const healthProfile = await storage.getHealthProfile(userId);
      const environmentalSensitivities = await storage.getEnvironmentalSensitivities(userId);
      
      const alerts = [];
      const currentHour = new Date().getHours();
      
      // Check air quality
      const currentAQI = airQuality.hourly.european_aqi[currentHour];
      if (currentAQI > 100 || (healthProfile?.hasRespiratoryConditions && currentAQI > 50)) {
        alerts.push({
          type: 'air_quality',
          severity: currentAQI > 150 ? 'danger' : currentAQI > 100 ? 'warning' : 'info',
          title: `Air quality is ${getAQICategory(currentAQI)}`,
          description: healthProfile?.hasRespiratoryConditions 
            ? 'Based on your respiratory condition, consider limiting outdoor activities.'
            : 'Consider reducing prolonged outdoor exposure today.',
          icon: 'masks'
        });
      }
      
      // Check UV index
      const currentUV = airQuality.hourly.uv_index[currentHour];
      if (currentUV > 5 || (environmentalSensitivities?.uvSensitivity >= 4 && currentUV > 3)) {
        alerts.push({
          type: 'uv',
          severity: currentUV > 8 ? 'danger' : currentUV > 5 ? 'warning' : 'info',
          title: `High UV index (${currentUV})`,
          description: environmentalSensitivities?.uvSensitivity >= 4
            ? 'With your skin sensitivity, use SPF 50+ if outdoors between 10am-4pm.'
            : 'Use sunscreen and seek shade during peak hours.',
          icon: 'wb_sunny'
        });
      }
      
      // Check temperature
      const currentTemp = forecast.hourly.temperature_2m[currentHour];
      if (currentTemp > 32 || (environmentalSensitivities?.heatSensitivity >= 4 && currentTemp > 30)) {
        alerts.push({
          type: 'temperature',
          severity: currentTemp > 35 ? 'danger' : currentTemp > 32 ? 'warning' : 'info',
          title: `High temperature (${Math.round(currentTemp)}°C)`,
          description: environmentalSensitivities?.heatSensitivity >= 4
            ? 'Given your heat sensitivity, stay hydrated and limit outdoor activities.'
            : 'Stay hydrated and take breaks from the heat.',
          icon: 'thermostat'
        });
      }
      
      // Check precipitation
      const precipProb = forecast.hourly.precipitation_probability[currentHour];
      if (precipProb > 70) {
        alerts.push({
          type: 'precipitation',
          severity: precipProb > 90 ? 'warning' : 'info',
          title: `High chance of precipitation (${precipProb}%)`,
          description: 'Bring an umbrella or raincoat when going out today.',
          icon: 'umbrella'
        });
      }
      
      res.json(alerts);
    } catch (error) {
      console.error("Error generating weather alerts:", error);
      res.status(500).json({ message: "Error generating weather alerts" });
    }
  });
  
  // Get activity recommendations
  app.get("/api/weather/recommendations/activities", async (req: Request, res: Response) => {
    try {
      // Get current weather and air quality data
      const forecast = await getOpenMeteoForecast();
      const airQuality = await getOpenMeteoAirQuality();
      
      // Get user health profile and interests for personalization
      const userId = 0; // Using demo user for now
      const healthProfile = await storage.getHealthProfile(userId);
      const interests = await storage.getInterests(userId);
      const outdoorActivities = interests?.outdoorActivities || [];
      
      // Determine optimal times for activities
      const morningTemp = forecast.hourly.temperature_2m.slice(6, 10).reduce((a, b) => a + b, 0) / 4;
      const afternoonTemp = forecast.hourly.temperature_2m.slice(12, 16).reduce((a, b) => a + b, 0) / 4;
      const eveningTemp = forecast.hourly.temperature_2m.slice(17, 21).reduce((a, b) => a + b, 0) / 4;
      
      const morningAQI = airQuality.hourly.european_aqi.slice(6, 10).reduce((a, b) => a + b, 0) / 4;
      const afternoonAQI = airQuality.hourly.european_aqi.slice(12, 16).reduce((a, b) => a + b, 0) / 4;
      const eveningAQI = airQuality.hourly.european_aqi.slice(17, 21).reduce((a, b) => a + b, 0) / 4;
      
      const isMorningGood = morningTemp < 30 && morningAQI < 100 && (!healthProfile?.hasRespiratoryConditions || morningAQI < 50);
      const isAfternoonGood = afternoonTemp < 32 && afternoonAQI < 100 && (!healthProfile?.hasRespiratoryConditions || afternoonAQI < 50);
      const isEveningGood = eveningTemp < 30 && eveningAQI < 100 && (!healthProfile?.hasRespiratoryConditions || eveningAQI < 50);
      
      const optimalTimes = {
        morning: isMorningGood,
        afternoon: isAfternoonGood,
        evening: isEveningGood
      };
      
      // Generate activity recommendations
      const recommendations = [];
      const conditions = [];
      
      // Add general conditions info
      if (morningTemp < 30 || eveningTemp < 30) conditions.push('Comfortable temperature');
      if (morningAQI < 50 || eveningAQI < 50) conditions.push('Better air quality');
      if (forecast.hourly.relative_humidity_2m.slice(6, 21).some(h => h < 70)) conditions.push('Lower humidity');
      
      // Walking recommendations
      if ((outdoorActivities.includes('walking_parks') || outdoorActivities.length === 0) && 
          (isMorningGood || isEveningGood)) {
        recommendations.push({
          type: 'activity',
          title: 'Morning walk in Hoan Kiem Lake',
          description: isMorningGood 
            ? 'Ideal before 9 AM when air quality is best for walking.'
            : 'Consider an evening walk after 5 PM when conditions improve.',
          icon: 'park'
        });
      }
      
      // Indoor activity recommendation for poor outdoor conditions
      if (!isMorningGood && !isAfternoonGood && !isEveningGood) {
        recommendations.push({
          type: 'activity',
          title: 'Visit the Vietnam National Museum',
          description: 'Indoor activity recommended during high pollution or heat.',
          icon: 'museum'
        });
      }
      
      // Dining recommendation
      if (isEveningGood) {
        recommendations.push({
          type: 'activity',
          title: 'Outdoor dining in West Lake area',
          description: 'Pleasant evening temperatures after 6 PM.',
          icon: 'restaurant'
        });
      }
      
      // Personalized recommendations based on interests
      if (outdoorActivities.includes('cycling') && (isMorningGood || isEveningGood)) {
        recommendations.push({
          type: 'activity',
          title: 'Cycling around West Lake',
          description: isMorningGood
            ? 'Great conditions in the morning for cycling.'
            : 'Evening temperatures are suitable for cycling.',
          icon: 'directions_bike'
        });
      }
      
      if (outdoorActivities.includes('photography') && !isAfternoonGood && (isMorningGood || isEveningGood)) {
        recommendations.push({
          type: 'activity',
          title: 'Photography at Long Bien Bridge',
          description: isEveningGood
            ? 'Capture beautiful sunset views in the evening.'
            : 'Morning light is ideal for photography.',
          icon: 'photo_camera'
        });
      }
      
      res.json({
        recommendations,
        optimalTimes,
        conditions
      });
    } catch (error) {
      console.error("Error generating activity recommendations:", error);
      res.status(500).json({ message: "Error generating activity recommendations" });
    }
  });
  
  // Get clothing recommendations
  app.get("/api/weather/recommendations/clothing", async (req: Request, res: Response) => {
    try {
      // Get current weather data
      const forecast = await getOpenMeteoForecast();
      const airQuality = await getOpenMeteoAirQuality();
      
      // Get user preferences for personalization
      const userId = 0; // Using demo user for now
      const environmentalSensitivities = await storage.getEnvironmentalSensitivities(userId);
      const healthProfile = await storage.getHealthProfile(userId);
      const interests = await storage.getInterests(userId);
      
      const currentHour = new Date().getHours();
      const currentTemp = forecast.hourly.temperature_2m[currentHour];
      const maxTemp = Math.max(...forecast.hourly.temperature_2m.slice(currentHour, currentHour + 12));
      const precipProb = Math.max(...forecast.hourly.precipitation_probability.slice(currentHour, currentHour + 12));
      const currentUV = airQuality.hourly.uv_index[currentHour];
      
      // Generate clothing icons
      const icons = [];
      const specifics = [];
      
      // Basic clothing based on temperature
      if (maxTemp >= 30) {
        icons.push({
          icon: 'checkroom',
          label: 'Light, breathable clothing'
        });
        specifics.push('Light cotton t-shirt and shorts/skirt for the day');
      } else if (maxTemp >= 25) {
        icons.push({
          icon: 'checkroom',
          label: 'Light to medium clothing'
        });
        specifics.push('Light cotton clothing, consider a light long-sleeve for evening');
      } else {
        icons.push({
          icon: 'checkroom',
          label: 'Medium weight clothing'
        });
        specifics.push('Long pants and light long-sleeve shirt');
      }
      
      // UV protection
      if (currentUV > 3 || (environmentalSensitivities?.uvSensitivity && environmentalSensitivities.uvSensitivity >= 3)) {
        icons.push({
          icon: 'face',
          label: environmentalSensitivities?.uvSensitivity >= 4 ? 'SPF 50+ sunscreen' : 'SPF 30+ sunscreen'
        });
        
        if (environmentalSensitivities?.uvSensitivity >= 4) {
          specifics.push('Apply high SPF sunscreen every 2 hours when outdoors');
          specifics.push('Consider a wide-brimmed hat and UV-protective sunglasses');
        } else {
          specifics.push('Use sunscreen during peak daylight hours');
        }
      }
      
      // Rain protection
      if (precipProb > 30) {
        icons.push({
          icon: 'umbrella',
          label: `Bring umbrella (${precipProb}% chance of rain)`
        });
        specifics.push('Carry a compact umbrella or light raincoat');
      }
      
      // Air quality considerations
      if (healthProfile?.hasRespiratoryConditions || (airQuality.hourly.european_aqi[currentHour] > 100)) {
        icons.push({
          icon: 'masks',
          label: 'Face mask recommended'
        });
        specifics.push('Face mask recommended during commute times (for air quality protection)');
      }
      
      // Additional clothing recommendations
      if (interests?.clothingStyle === 'fashionable') {
        specifics.push('Light, fashionable layers work well with today\'s conditions');
      } else if (interests?.clothingStyle === 'business_casual') {
        specifics.push('Lightweight business casual attire appropriate for today\'s weather');
      }
      
      // Indoor considerations
      if (maxTemp >= 30) {
        specifics.push('Bring a light jacket for air-conditioned indoor spaces');
      }
      
      res.json({
        icons,
        specifics
      });
    } catch (error) {
      console.error("Error generating clothing recommendations:", error);
      res.status(500).json({ message: "Error generating clothing recommendations" });
    }
  });
  
  // Get health recommendations
  app.get("/api/health/recommendations", async (req: Request, res: Response) => {
    try {
      // Get current weather and air quality data
      const forecast = await getOpenMeteoForecast();
      const airQuality = await getOpenMeteoAirQuality();
      
      const currentHour = new Date().getHours();
      const currentTemp = forecast.hourly.temperature_2m[currentHour];
      const currentUV = airQuality.hourly.uv_index[currentHour];
      
      // Generate health recommendations
      const recommendations = {
        temperature: {
          current: Math.round(currentTemp),
          isHot: currentTemp > 30,
          isCold: currentTemp < 18,
          recommendations: generateTemperatureRecommendations(currentTemp)
        },
        uv: {
          index: currentUV,
          category: getUVCategory(currentUV),
          recommendations: generateUVRecommendations(currentUV)
        },
        airQuality: {
          aqi: airQuality.hourly.european_aqi[currentHour],
          category: getAQICategory(airQuality.hourly.european_aqi[currentHour]),
          recommendations: generateAirQualityRecommendations(airQuality.hourly.european_aqi[currentHour])
        }
      };
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating health recommendations:", error);
      res.status(500).json({ message: "Error generating health recommendations" });
    }
  });
  
  // ============ ACTIVITIES ROUTES ============
  
  // Get optimal time slots for activities
  app.get("/api/activities/time-slots", async (req: Request, res: Response) => {
    try {
      // Get current weather and air quality data
      const forecast = await getOpenMeteoForecast();
      const airQuality = await getOpenMeteoAirQuality();
      
      // Get user health profile for personalization
      const userId = 0; // Using demo user for now
      const healthProfile = await storage.getHealthProfile(userId);
      const environmentalSensitivities = await storage.getEnvironmentalSensitivities(userId);
      
      // Generate time slots data (next 12 hours)
      const currentHour = new Date().getHours();
      const timeSlots = [];
      
      for (let i = 0; i < 12; i++) {
        const hour = (currentHour + i) % 24;
        const formattedHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`;
        
        // Get conditions for this hour
        const temp = forecast.hourly.temperature_2m[hour];
        const precipProb = forecast.hourly.precipitation_probability[hour];
        const humidity = forecast.hourly.relative_humidity_2m[hour];
        const aqi = airQuality.hourly.european_aqi[hour];
        const uv = airQuality.hourly.uv_index[hour] || 0;
        
        // Determine conditions
        const conditions = [];
        if (temp > 32) conditions.push('Hot');
        else if (temp < 20) conditions.push('Cool');
        else conditions.push('Pleasant temperature');
        
        if (precipProb > 50) conditions.push('High precipitation chance');
        if (humidity > 80) conditions.push('High humidity');
        
        if (aqi < 50) conditions.push('Good air quality');
        else if (aqi < 100) conditions.push('Moderate air quality');
        else conditions.push('Poor air quality');
        
        if (hour >= 10 && hour <= 16 && uv > 5) conditions.push('High UV');
        
        // Determine if suitable for outdoor activities
        let suitable = true;
        if (temp > 35 || precipProb > 70 || aqi > 150) suitable = false;
        if (healthProfile?.hasRespiratoryConditions && aqi > 100) suitable = false;
        if (environmentalSensitivities?.heatSensitivity >= 4 && temp > 30) suitable = false;
        if (environmentalSensitivities?.uvSensitivity >= 4 && uv > 6 && hour >= 10 && hour <= 16) suitable = false;
        
        // Determine weather icon
        let icon = 'wb_sunny'; // default
        if (precipProb > 50) icon = 'umbrella';
        else if (forecast.hourly.cloud_cover[hour] > 70) icon = 'cloud';
        else if (aqi > 150) icon = 'masks';
        else if (!forecast.hourly.is_day[hour]) icon = 'nights_stay';
        
        timeSlots.push({
          hour,
          label: formattedHour,
          conditions,
          suitable,
          icon,
          temperature: Math.round(temp),
          precipitation: precipProb,
          humidity: Math.round(humidity),
          uv: Math.round(uv),
          aqi
        });
      }
      
      res.json(timeSlots);
    } catch (error) {
      console.error("Error generating optimal time slots:", error);
      res.status(500).json({ message: "Error generating optimal time slots" });
    }
  });
  
  // Get outdoor activities
  app.get("/api/activities/outdoor", async (req: Request, res: Response) => {
    try {
      // Get current weather and air quality data
      const forecast = await getOpenMeteoForecast();
      const airQuality = await getOpenMeteoAirQuality();
      
      const currentHour = new Date().getHours();
      const currentTemp = forecast.hourly.temperature_2m[currentHour];
      const currentAQI = airQuality.hourly.european_aqi[currentHour];
      const currentPrecipProb = forecast.hourly.precipitation_probability[currentHour];
      
      // Get user preferences
      const userId = 0; // Using demo user for now
      const interests = await storage.getInterests(userId);
      const healthProfile = await storage.getHealthProfile(userId);
      
      // Define outdoor activities
      const activities = [
        {
          id: "walking",
          name: "Walking & Strolling",
          description: "Explore Hanoi's parks, lakes, and historic districts on foot.",
          locations: [
            {
              name: "Hoan Kiem Lake",
              address: "Hang Trong, Hoan Kiem District",
              description: "Scenic lake in the heart of Hanoi with pedestrian-friendly paths.",
              coordinates: { lat: 21.0285, lng: 105.8524 },
              bestTimes: ["Early morning", "Late afternoon"]
            },
            {
              name: "West Lake Promenade",
              address: "Tay Ho District",
              description: "Peaceful walking path around Hanoi's largest lake.",
              coordinates: { lat: 21.0583, lng: 105.8232 },
              bestTimes: ["Sunset", "Early morning"]
            },
            {
              name: "Old Quarter",
              address: "Hoan Kiem District",
              description: "Historic area with narrow streets and architecture.",
              coordinates: { lat: 21.0345, lng: 105.8499 },
              bestTimes: ["Evening", "Early morning"]
            }
          ],
          bestWeather: ["Clear skies", "Mild temperatures", "Low humidity"],
          worstWeather: ["Heavy rain", "Extreme heat", "High pollution"],
          indoor: false,
          suitabilityScore: calculateSuitability(currentTemp, currentAQI, currentPrecipProb, 'walking', interests, healthProfile),
          currentAlert: getCurrentAlert(currentTemp, currentAQI, currentPrecipProb, 'walking', healthProfile)
        },
        {
          id: "cycling",
          name: "Cycling",
          description: "Ride around Hanoi's scenic routes and enjoy the urban landscape.",
          locations: [
            {
              name: "West Lake Circuit",
              address: "Tay Ho District",
              description: "17km cycling path around West Lake with beautiful views.",
              coordinates: { lat: 21.0622, lng: 105.8169 },
              bestTimes: ["Early morning", "Late afternoon"]
            },
            {
              name: "Red River Dyke Road",
              address: "Long Bien District",
              description: "Long, flat route with river views and rural scenery.",
              coordinates: { lat: 21.0492, lng: 105.8778 },
              bestTimes: ["Morning", "Late afternoon"]
            }
          ],
          bestWeather: ["Clear skies", "Mild temperatures", "Low pollution"],
          worstWeather: ["Rain", "High AQI", "Extreme heat"],
          indoor: false,
          suitabilityScore: calculateSuitability(currentTemp, currentAQI, currentPrecipProb, 'cycling', interests, healthProfile),
          currentAlert: getCurrentAlert(currentTemp, currentAQI, currentPrecipProb, 'cycling', healthProfile)
        },
        {
          id: "parks",
          name: "Parks & Gardens",
          description: "Relax in Hanoi's green spaces and botanical gardens.",
          locations: [
            {
              name: "Thong Nhat Park (Lenin Park)",
              address: "Hai Ba Trung District",
              description: "Large park with lake, gardens, and walking paths.",
              coordinates: { lat: 21.0124, lng: 105.8419 },
              bestTimes: ["Morning", "Late afternoon"]
            },
            {
              name: "Bach Thao Botanical Garden",
              address: "Ba Dinh District",
              description: "Diverse collection of plants and trees in a peaceful setting.",
              coordinates: { lat: 21.0359, lng: 105.8348 },
              bestTimes: ["Morning", "Afternoon"]
            }
          ],
          bestWeather: ["Clear skies", "Mild temperatures", "Low humidity"],
          worstWeather: ["Heavy rain", "Thunderstorms", "High pollution"],
          indoor: false,
          suitabilityScore: calculateSuitability(currentTemp, currentAQI, currentPrecipProb, 'parks', interests, healthProfile),
          currentAlert: getCurrentAlert(currentTemp, currentAQI, currentPrecipProb, 'parks', healthProfile)
        }
      ];
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching outdoor activities:", error);
      res.status(500).json({ message: "Error fetching outdoor activities" });
    }
  });
  
  // Get indoor activities
  app.get("/api/activities/indoor", async (req: Request, res: Response) => {
    try {
      // Get user preferences
      const userId = 0; // Using demo user for now
      const interests = await storage.getInterests(userId);
      
      // Define indoor activities
      const activities = [
        {
          id: "museums",
          name: "Museums & Galleries",
          description: "Explore Hanoi's rich cultural and historical exhibits.",
          locations: [
            {
              name: "Vietnam National Museum of History",
              address: "1 Trang Tien Street, Hoan Kiem District",
              description: "Extensive collection of Vietnamese historical artifacts.",
              coordinates: { lat: 21.0243, lng: 105.8583 },
              bestTimes: ["Weekday mornings", "Afternoons"]
            },
            {
              name: "Vietnam Fine Arts Museum",
              address: "66 Nguyen Thai Hoc Street, Ba Dinh District",
              description: "Collection of traditional and contemporary Vietnamese art.",
              coordinates: { lat: 21.0312, lng: 105.8393 },
              bestTimes: ["Afternoons", "Weekdays"]
            },
            {
              name: "Hanoi Museum",
              address: "Pham Hung Street, Nam Tu Liem District",
              description: "Modern museum showcasing Hanoi's history and culture.",
              coordinates: { lat: 21.0086, lng: 105.7758 },
              bestTimes: ["Morning", "Afternoon"]
            }
          ],
          bestWeather: ["Any weather", "Rainy days", "Hot days"],
          worstWeather: ["None"],
          indoor: true,
          personalizedNote: interests?.sustainabilityInterest >= 4 ? 
            "Many museums in Hanoi are implementing sustainable practices and exhibits on environmental awareness." : undefined
        },
        {
          id: "cafes",
          name: "Traditional Cafés",
          description: "Experience Hanoi's unique café culture and enjoy local beverages.",
          locations: [
            {
              name: "Café Giang - Egg Coffee",
              address: "39 Nguyen Huu Huan Street, Hoan Kiem District",
              description: "Famous for traditional Vietnamese egg coffee.",
              coordinates: { lat: 21.0341, lng: 105.8522 },
              bestTimes: ["Morning", "Afternoon"]
            },
            {
              name: "Café Dinh",
              address: "13 Dinh Tien Hoang Street, Hoan Kiem District",
              description: "Historic café serving traditional coffee in an authentic setting.",
              coordinates: { lat: 21.0304, lng: 105.8525 },
              bestTimes: ["Morning", "Afternoon"]
            }
          ],
          bestWeather: ["Any weather", "Rainy days"],
          worstWeather: ["None"],
          indoor: true,
          personalizedNote: interests?.sustainabilityInterest >= 3 ? 
            "Many cafés in Hanoi are now using biodegradable straws and sustainable practices." : undefined
        },
        {
          id: "workshops",
          name: "Cultural Workshops",
          description: "Learn traditional Vietnamese crafts and culinary arts.",
          locations: [
            {
              name: "Hanoi Cooking Centre",
              address: "44 Chau Long Street, Ba Dinh District",
              description: "Cooking classes featuring traditional Vietnamese cuisine.",
              coordinates: { lat: 21.0437, lng: 105.8441 },
              bestTimes: ["Morning classes", "Afternoon sessions"]
            },
            {
              name: "Vietnamese Craft Workshop",
              address: "23 Hang Bac Street, Hoan Kiem District",
              description: "Learn traditional crafts like lacquerware and silk painting.",
              coordinates: { lat: 21.0332, lng: 105.8505 },
              bestTimes: ["Afternoon", "Morning"]
            }
          ],
          bestWeather: ["Any weather"],
          worstWeather: ["None"],
          indoor: true,
          personalizedNote: interests?.sustainabilityInterest >= 4 ? 
            "Many workshops incorporate sustainable materials and traditional eco-friendly techniques." : undefined
        }
      ];
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching indoor activities:", error);
      res.status(500).json({ message: "Error fetching indoor activities" });
    }
  });
  
  // ============ SUSTAINABILITY ROUTES ============
  
  // Get sustainability tips
  app.get("/api/sustainability/tips", async (req: Request, res: Response) => {
    try {
      // Today's tip (rotated daily)
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      
      // Define a list of tips
      const tips = [
        {
          title: "Energy Conservation",
          content: "During Hanoi's hot season, set your air conditioner to 26°C to reduce energy consumption while staying comfortable.",
          icon: "bolt"
        },
        {
          title: "Reduce Plastic Waste",
          content: "Bring reusable containers when buying street food in Hanoi to reduce single-use plastic waste.",
          icon: "recycling"
        },
        {
          title: "Water Conservation",
          content: "Collect and reuse rainwater for plants during Hanoi's rainy season. A simple bucket under a downspout works well.",
          icon: "water_drop"
        },
        {
          title: "Sustainable Transportation",
          content: "Use Hanoi's public bus system or consider an electric scooter to reduce your carbon footprint.",
          icon: "directions_bus"
        },
        {
          title: "Local Food Choices",
          content: "Shop at local markets like Hom or Dong Xuan to support local farmers and reduce food miles.",
          icon: "shopping_basket"
        },
        {
          title: "Air Quality Protection",
          content: "Grow air-purifying plants like peace lilies and spider plants inside your home to improve indoor air quality.",
          icon: "spa"
        },
        {
          title: "Energy Efficient Lighting",
          content: "Switch to LED lights which use up to 75% less energy and last 25 times longer than incandescent lighting.",
          icon: "lightbulb"
        }
      ];
      
      // Select today's tip based on day of year
      const dailyTip = tips[dayOfYear % tips.length];
      
      // Previous tips (different from today's tip)
      const previousTips = tips.filter(tip => tip.title !== dailyTip.title).slice(0, 3);
      
      // Define local initiatives
      const localInitiatives = [
        {
          title: "Hanoi Plastic Reduction Program",
          description: "Collection points for recyclable plastics at all major supermarkets throughout Hanoi.",
          icon: "recycling"
        },
        {
          title: "New Bus Routes",
          description: "New bus routes connecting Ba Dinh to Tay Ho - reduce your carbon footprint by 60%.",
          icon: "directions_bus"
        },
        {
          title: "Community Garden Initiative",
          description: "Community garden initiative in Cau Giay district - volunteers welcome this Saturday.",
          icon: "park"
        }
      ];
      
      res.json({
        dailyTip,
        previousTips,
        localInitiatives
      });
    } catch (error) {
      console.error("Error fetching sustainability tips:", error);
      res.status(500).json({ message: "Error fetching sustainability tips" });
    }
  });
  
  // Get community initiatives
  app.get("/api/sustainability/initiatives", async (req: Request, res: Response) => {
    try {
      // Define upcoming initiatives
      const initiatives = [
        {
          title: "Hanoi River Cleanup",
          organizer: "Clean Hanoi Initiative",
          description: "Join us for a community cleanup along the Red River banks. Equipment and refreshments provided.",
          date: "July 24, 2023",
          time: "8:00 AM - 12:00 PM",
          location: "Red River Banks, Long Bien District",
          participants: 45,
          userJoined: false
        },
        {
          title: "Urban Gardening Workshop",
          organizer: "Green Thumbs Hanoi",
          description: "Learn how to grow your own vegetables in limited space using sustainable methods.",
          date: "July 30, 2023",
          time: "2:00 PM - 4:30 PM",
          location: "Tay Ho Community Center",
          participants: 28,
          userJoined: false
        },
        {
          title: "Eco-Friendly Market",
          organizer: "Sustainable Hanoi Network",
          description: "Shop from local vendors offering eco-friendly products and learn about sustainable living.",
          date: "August 5-6, 2023",
          time: "9:00 AM - 5:00 PM",
          location: "Hang Da Market, Hoan Kiem District",
          participants: 120,
          userJoined: false
        }
      ];
      
      res.json({ initiatives });
    } catch (error) {
      console.error("Error fetching community initiatives:", error);
      res.status(500).json({ message: "Error fetching community initiatives" });
    }
  });
  
  // Get sustainability polls
  app.get("/api/sustainability/polls", async (req: Request, res: Response) => {
    try {
      // Get all polls from storage
      const polls = await storage.getPolls();
      
      // Format the polls for frontend
      const formattedPolls = polls.map(poll => {
        // Calculate percentage for each option
        const totalVotes = poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
        const options = poll.options.map(option => ({
          text: option.text,
          votes: option.votes || 0,
          percentage: totalVotes > 0 ? Math.round((option.votes || 0) / totalVotes * 100) : 0
        }));
        
        return {
          id: poll.id,
          question: poll.question,
          options,
          totalVotes,
          expiresAt: poll.expiresAt,
          // In a real app, check if user voted on this poll
          userVoted: false,
          userVoteIndex: undefined
        };
      });
      
      res.json({ polls: formattedPolls });
    } catch (error) {
      console.error("Error fetching sustainability polls:", error);
      res.status(500).json({ message: "Error fetching sustainability polls" });
    }
  });
  
  // Vote on a poll
  app.post("/api/sustainability/vote", async (req: Request, res: Response) => {
    try {
      const { pollId, optionIndex } = req.body;
      
      if (pollId === undefined || optionIndex === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get the poll
      const poll = await storage.getPoll(pollId);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      // Check if option index is valid
      if (optionIndex < 0 || optionIndex >= poll.options.length) {
        return res.status(400).json({ message: "Invalid option index" });
      }
      
      // Update the vote count
      poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;
      
      // Save the updated poll
      await storage.updatePoll(pollId, poll);
      
      // Create a vote record (in a real app, tie to user ID)
      await storage.createPollVote({
        pollId,
        userId: 0, // Demo user ID
        optionIndex
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on poll:", error);
      res.status(500).json({ message: "Error voting on poll" });
    }
  });
  
  // Create a new poll
  app.post("/api/sustainability/polls/create", async (req: Request, res: Response) => {
    try {
      const { question, options, duration } = req.body;
      
      if (!question || !options || options.length < 2) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Create expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (duration || 7));
      
      // Format options with zero votes
      const pollOptions = options.map(text => ({ text, votes: 0 }));
      
      // Create the poll
      const newPoll = await storage.createPoll({
        question,
        options: pollOptions,
        expiresAt: expiresAt.toISOString()
      });
      
      res.json(newPoll);
    } catch (error) {
      console.error("Error creating poll:", error);
      res.status(500).json({ message: "Error creating poll" });
    }
  });
  
  // Get community ideas
  app.get("/api/sustainability/ideas", async (req: Request, res: Response) => {
    try {
      // In a real app, this would come from a database
      // For now, returning mock ideas
      const ideas = [
        {
          id: 1,
          author: "EcoFriend",
          content: "Hanoi should implement a bike-sharing program similar to those in other major cities. This would reduce traffic congestion and air pollution while providing residents with a healthy transportation option.",
          createdAt: "2023-07-10T08:30:00Z",
          likes: 24,
          comments: 5
        },
        {
          id: 2,
          author: "GreenThumb",
          content: "We need more vertical gardens on buildings in downtown Hanoi. They would help reduce the urban heat island effect, improve air quality, and make the city more beautiful.",
          createdAt: "2023-07-15T14:45:00Z",
          likes: 18,
          comments: 3
        },
        {
          id: 3,
          author: "CleanCity",
          content: "Hanoi should introduce a plastic bag tax or ban at all retail stores. This has been successful in reducing plastic waste in many other cities around the world.",
          createdAt: "2023-07-18T10:20:00Z",
          likes: 32,
          comments: 7
        }
      ];
      
      res.json({ ideas });
    } catch (error) {
      console.error("Error fetching community ideas:", error);
      res.status(500).json({ message: "Error fetching community ideas" });
    }
  });
  
  // Submit a new sustainability idea
  app.post("/api/sustainability/ideas/submit", async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // In a real app, save to database
      // For now, just return success
      
      res.json({
        success: true,
        id: Math.floor(Math.random() * 1000),
        author: "User",
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0
      });
    } catch (error) {
      console.error("Error submitting idea:", error);
      res.status(500).json({ message: "Error submitting idea" });
    }
  });
  
  // ============ CHAT ROUTES ============
  
  // Get chat history
  app.get("/api/chat/history", async (req: Request, res: Response) => {
    try {
      // Get user ID (using demo user for now)
      const userId = 0;
      
      // Get chat history from storage
      const chatHistory = await storage.getChatHistory(userId);
      
      // If no history, return empty array
      if (!chatHistory) {
        return res.json({ messages: [] });
      }
      
      res.json({ messages: chatHistory.messages });
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Error fetching chat history" });
    }
  });
  
  // Send a message to the AI chatbot
  app.post("/api/chat/message", async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Missing message content" });
      }
      
      // Get user ID and profile for personalization
      const userId = 0;
      const userProfile = {
        healthProfile: await storage.getHealthProfile(userId),
        lifestyleHabits: await storage.getLifestyleHabits(userId),
        environmentalSensitivities: await storage.getEnvironmentalSensitivities(userId),
        interests: await storage.getInterests(userId)
      };
      
      // Get current weather and air quality data for context
      const currentWeatherData = await getCurrentWeatherData();
      const currentAirQualityData = await getCurrentAirQualityData();
      
      // Get existing chat history or create new one
      let chatHistory = await storage.getChatHistory(userId);
      if (!chatHistory) {
        chatHistory = {
          userId,
          messages: []
        };
      }
      
      // Add user message to history
      chatHistory.messages.push({
        role: 'user',
        content: message
      });
      
      // Generate detailed system prompt with user profile info and current environmental data
      let systemPrompt = `You are an AI assistant specializing in environmental information for Hanoi, Vietnam. 
      Provide personalized, helpful information about Hanoi's weather, air quality, climate, and sustainability. 
      Your responses should be tailored to the user's specific needs and preferences.
      
      Current environmental conditions in Hanoi:
      - Temperature: ${currentWeatherData?.current?.temperature || 'Unknown'}°C
      - Weather: ${currentWeatherData?.current?.weatherDescription || 'Unknown'}
      - Air Quality Index: ${currentAirQualityData?.current?.aqi || 'Unknown'} (${currentAirQualityData?.current?.aqiCategory || 'Unknown'})
      - PM2.5: ${currentAirQualityData?.current?.pm2_5 || 'Unknown'} μg/m³
      - UV Index: ${currentWeatherData?.current?.uvIndex || 'Unknown'}
      - Humidity: ${currentWeatherData?.current?.humidity || 'Unknown'}%
      `;
      
      // Add detailed user profile information
      if (userProfile.healthProfile) {
        systemPrompt += "\n\nHEALTH PROFILE:\n";
        
        if (userProfile.healthProfile.hasRespiratoryConditions) {
          systemPrompt += "- Has respiratory conditions: " + 
            (userProfile.healthProfile.respiratoryConditions?.join(", ") || "unspecified") + 
            ". Provide air quality guidance and warnings when AQI is poor.\n";
        }
        
        if (userProfile.healthProfile.hasAllergies) {
          systemPrompt += "- Has allergies: " + 
            (userProfile.healthProfile.allergies?.join(", ") || "unspecified") + 
            ". Mention pollen levels and allergen information when relevant.\n";
        }
        
        if (userProfile.healthProfile.cardiovascularConcerns) {
          systemPrompt += "- Has cardiovascular concerns. Provide heat and exertion warnings during extreme weather.\n";
        }
        
        if (userProfile.healthProfile.skinConditions) {
          systemPrompt += "- Has skin conditions. Include UV protection advice when sun exposure is high.\n";
        }
        
        systemPrompt += "- Fitness level: " + (userProfile.healthProfile.fitnessLevel || "unknown") + 
          ". Tailor activity recommendations accordingly.\n";
      }
      
      if (userProfile.lifestyleHabits) {
        systemPrompt += "\n\nLIFESTYLE HABITS:\n";
        systemPrompt += "- Daily routine: " + (userProfile.lifestyleHabits.dailyRoutine || "unspecified") + ".\n";
        
        if (userProfile.lifestyleHabits.transportation?.length > 0) {
          systemPrompt += "- Transportation methods: " + userProfile.lifestyleHabits.transportation.join(", ") + 
            ". Provide relevant transportation advice based on weather and air quality.\n";
        }
        
        if (userProfile.lifestyleHabits.dietaryPreferences?.length > 0) {
          systemPrompt += "- Dietary preferences: " + userProfile.lifestyleHabits.dietaryPreferences.join(", ") + ".\n";
        }
        
        systemPrompt += "- Sleep habits: " + (userProfile.lifestyleHabits.sleepHabits || "unspecified") + ".\n";
      }
      
      if (userProfile.environmentalSensitivities) {
        systemPrompt += "\n\nENVIRONMENTAL SENSITIVITIES (scale 1-5):\n";
        systemPrompt += "- Pollution sensitivity: " + userProfile.environmentalSensitivities.pollutionSensitivity + "/5" + 
          (userProfile.environmentalSensitivities.pollutionSensitivity >= 4 ? " (HIGH)" : "") + ".\n";
        systemPrompt += "- UV sensitivity: " + userProfile.environmentalSensitivities.uvSensitivity + "/5" + 
          (userProfile.environmentalSensitivities.uvSensitivity >= 4 ? " (HIGH)" : "") + ".\n";
        systemPrompt += "- Heat sensitivity: " + userProfile.environmentalSensitivities.heatSensitivity + "/5" + 
          (userProfile.environmentalSensitivities.heatSensitivity >= 4 ? " (HIGH)" : "") + ".\n";
        systemPrompt += "- Cold sensitivity: " + userProfile.environmentalSensitivities.coldSensitivity + "/5" + 
          (userProfile.environmentalSensitivities.coldSensitivity >= 4 ? " (HIGH)" : "") + ".\n";
      }
      
      if (userProfile.interests) {
        systemPrompt += "\n\nINTERESTS AND PREFERENCES:\n";
        
        if (userProfile.interests.outdoorActivities?.length > 0) {
          systemPrompt += "- Outdoor activities: " + userProfile.interests.outdoorActivities.join(", ") + 
            ". Recommend these when conditions are favorable.\n";
        }
        
        systemPrompt += "- Clothing style: " + (userProfile.interests.clothingStyle || "unspecified") + 
          ". Tailor clothing recommendations to this style.\n";
        
        systemPrompt += "- Sustainability interest level: " + userProfile.interests.sustainabilityInterest + "/5" + 
          (userProfile.interests.sustainabilityInterest >= 4 ? " (HIGH)" : "") + ".\n";
        
        if (userProfile.interests.notifications?.length > 0) {
          systemPrompt += "- Notification preferences: " + userProfile.interests.notifications.join(", ") + ".\n";
        }
      }
      
      systemPrompt += `
      
      RESPONSE GUIDELINES:
      1. Always consider the user's health conditions when providing recommendations.
      2. Tailor activity suggestions based on current environmental conditions AND user preferences.
      3. Provide specific, actionable advice rather than general statements.
      4. For clothing recommendations, consider both weather conditions AND the user's style preferences.
      5. Include sustainability tips relevant to the user's interests and lifestyle.
      6. When discussing air quality or weather, explain the potential impact on the user based on their sensitivities.
      7. Keep responses friendly, helpful, and concise while still being personalized.
      `;
      
      // Get AI response
      const groqResponse = await getGroqCompletion(systemPrompt, chatHistory.messages);
      
      // Add AI response to history
      chatHistory.messages.push({
        role: 'assistant',
        content: groqResponse
      });
      
      // Save updated chat history
      await storage.updateChatHistory(userId, chatHistory);
      
      res.json({
        message: groqResponse
      });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Error processing chat message" });
    }
  });
  
  // Helper function to get current weather data
  async function getCurrentWeatherData() {
    try {
      // This would typically be a call to your weather API
      // For now, we'll return mock data
      return {
        current: {
          temperature: 28,
          weatherDescription: "Partly cloudy",
          uvIndex: 7,
          humidity: 75
        }
      };
    } catch (error) {
      console.error("Error fetching current weather data:", error);
      return null;
    }
  }
  
  // Helper function to get current air quality data
  async function getCurrentAirQualityData() {
    try {
      // This would typically be a call to your air quality API
      // For now, we'll return mock data
      return {
        current: {
          aqi: 85,
          aqiCategory: "Moderate",
          pm2_5: 25.4
        }
      };
    } catch (error) {
      console.error("Error fetching current air quality data:", error);
      return null;
    }
  }
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // WebSocket server temporarily disabled for troubleshooting
  console.log('WebSocket server disabled for troubleshooting');
  
  return httpServer;
}

// ============ HELPER FUNCTIONS ============

// Get weather description from code
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };
  
  return weatherCodes[code] || "Unknown";
}

// Get AQI category
function getAQICategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

// Get UV category
function getUVCategory(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

// Generate temperature recommendations
function generateTemperatureRecommendations(temp: number): string[] {
  if (temp > 32) {
    return [
      "Stay hydrated by drinking plenty of water",
      "Seek shade and avoid direct sun during peak hours",
      "Wear lightweight, loose-fitting clothing",
      "Use cooling towels or misting fans if available",
      "Take regular breaks from heat if working outdoors"
    ];
  } else if (temp > 28) {
    return [
      "Stay hydrated throughout the day",
      "Wear light, breathable clothing",
      "Use sunscreen when outdoors",
      "Limit intense physical activity during peak hours"
    ];
  } else if (temp < 18) {
    return [
      "Wear layers to stay warm",
      "Keep extremities covered (head, hands)",
      "Stay dry to avoid losing body heat",
      "Drink warm beverages to maintain body temperature"
    ];
  } else {
    return [
      "Comfortable temperature range",
      "Great conditions for most outdoor activities",
      "Regular hydration still recommended",
      "Carry a light jacket for evening temperature drops"
    ];
  }
}

// Generate UV recommendations
function generateUVRecommendations(uv: number): string[] {
  if (uv <= 2) {
    return [
      "Low UV risk - minimal protection needed",
      "Wear sunglasses in bright conditions"
    ];
  } else if (uv <= 5) {
    return [
      "Use SPF 30+ sunscreen",
      "Wear a hat when in direct sunlight",
      "Take breaks in the shade during peak hours",
      "Use sunglasses with UV protection"
    ];
  } else if (uv <= 7) {
    return [
      "Apply SPF 30+ sunscreen every 2 hours",
      "Wear protective clothing and a wide-brimmed hat",
      "Reduce sun exposure between 10am and 4pm",
      "Use sunglasses with high UV protection"
    ];
  } else {
    return [
      "Apply SPF 50+ sunscreen every 2 hours",
      "Wear sun-protective clothing (UPF-rated if possible)",
      "Avoid sun exposure between 10am and 4pm",
      "Seek shade whenever possible",
      "Use wrap-around sunglasses with UV 400 protection"
    ];
  }
}

// Generate air quality recommendations
function generateAirQualityRecommendations(aqi: number): string[] {
  if (aqi <= 50) {
    return [
      "Air quality is good - enjoy outdoor activities",
      "No special precautions needed"
    ];
  } else if (aqi <= 100) {
    return [
      "Sensitive individuals should limit prolonged outdoor exertion",
      "Consider wearing a mask if you have respiratory conditions",
      "Keep windows closed during high traffic times"
    ];
  } else if (aqi <= 150) {
    return [
      "People with respiratory or heart conditions should limit outdoor activities",
      "Everyone should reduce prolonged or intense outdoor activities",
      "Wear a proper mask (N95 or equivalent) when outdoors",
      "Use air purifiers indoors if available"
    ];
  } else {
    return [
      "Everyone should avoid outdoor activities",
      "Wear N95 masks when outdoors is necessary",
      "Keep windows closed and use air purifiers",
      "Follow local health authority guidance",
      "Consider rescheduling outdoor events"
    ];
  }
}

// Calculate activity suitability score
function calculateSuitability(temp: number, aqi: number, precipProb: number, activityType: string, interests?: any, healthProfile?: any): number {
  let score = 1.0; // Start with perfect score
  
  // Adjust for temperature
  if (temp > 35) score -= 0.5;
  else if (temp > 32) score -= 0.3;
  else if (temp < 15) score -= 0.2;
  
  // Adjust for AQI
  if (aqi > 150) score -= 0.6;
  else if (aqi > 100) score -= 0.3;
  else if (aqi > 50) score -= 0.1;
  
  // Adjust for precipitation probability
  if (precipProb > 70) score -= 0.5;
  else if (precipProb > 50) score -= 0.3;
  else if (precipProb > 30) score -= 0.1;
  
  // Adjust for health conditions if available
  if (healthProfile?.hasRespiratoryConditions && aqi > 100) {
    score -= 0.4;
  }
  
  // Adjust for user interests if available
  if (interests?.outdoorActivities && interests.outdoorActivities.length > 0) {
    if (activityType === 'walking' && interests.outdoorActivities.includes('walking_parks')) {
      score += 0.1;
    } else if (activityType === 'cycling' && interests.outdoorActivities.includes('cycling')) {
      score += 0.1;
    } else if (activityType === 'parks' && 
              (interests.outdoorActivities.includes('walking_parks') || 
               interests.outdoorActivities.includes('photography'))) {
      score += 0.1;
    }
  }
  
  // Ensure score stays between 0 and 1
  return Math.max(0, Math.min(1, score));
}

// Get current alert for activity
function getCurrentAlert(temp: number, aqi: number, precipProb: number, activityType: string, healthProfile?: any): string | undefined {
  if (precipProb > 70) {
    return "High chance of precipitation - check forecast before planning this activity";
  }
  
  if (aqi > 150) {
    return "Air quality is unhealthy today - consider indoor alternatives";
  } else if (aqi > 100 && healthProfile?.hasRespiratoryConditions) {
    return "Current air quality may affect your respiratory condition";
  }
  
  if (temp > 35) {
    return "Extreme heat today - avoid strenuous outdoor activities or plan for early morning";
  }
  
  return undefined;
}
