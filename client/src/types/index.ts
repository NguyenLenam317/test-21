export interface WeatherData {
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
    temperature?: number[];
    temperature_2m?: number[];
    apparent_temperature?: number[];
    apparentTemperature?: number[];
    weather_code?: number[];
    precipitation?: number[];
    precipitation_sum?: number[];
    precipitation_probability?: number[];
    weatherCode?: number[];
    weatherDescription?: string[];
    wind_speed_10m?: number[];
    wind_speed?: number[];
    relative_humidity_2m?: number[];
    humidity?: number[];
  };
  daily: {
    time: string[];
    weather_code?: number[];
    weatherCode?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    temperatureMax?: number[];
    temperatureMin?: number[];
    sunrise?: string[];
    sunset?: string[];
    precipitation_sum?: number[];
    precipitation?: number[];
    precipitation_probability_max?: number[];
    precipitationProbability?: number[];
    wind_speed_10m_max?: number[];
    wind_speed_max_10m?: number[];
    relative_humidity_2m_max?: number[];
    humidity_max?: number[];
  };
}

export interface AirQualityData {
  current: {
    pm2_5: number;
    pm10: number;
    no2: number;
    o3: number;
    so2: number;
    co: number;
    aqi: number;
    aqiCategory: string;
  };
  hourly: {
    time: string[];
    pm2_5: number[];
    pm10: number[];
    aqi: number[];
  };
}

export interface ClimateData {
  temperature: {
    years: number[];
    values: number[];
  };
  precipitation: {
    years: number[];
    values: number[];
  };
  extremeEvents: {
    years: number[];
    heatwaves: number[];
    floods: number[];
    droughts: number[];
  };
}

export interface FloodRiskData {
  risk: 'low' | 'moderate' | 'high' | 'severe';
  forecast: {
    date: string;
    risk: 'low' | 'moderate' | 'high' | 'severe';
  }[];
}

export interface HealthProfile {
  respiratoryConditions: string[];
  hasRespiratoryConditions: boolean;
  allergies: string[];
  hasAllergies: boolean;
  cardiovascularConcerns: boolean;
  skinConditions: boolean;
  fitnessLevel: string;
}

export interface LifestyleHabits {
  dailyRoutine: string;
  transportation: string[];
  dietaryPreferences: string[];
  sleepHabits: string;
}

export interface EnvironmentalSensitivities {
  pollutionSensitivity: number;
  uvSensitivity: number;
  heatSensitivity: number;
  coldSensitivity: number;
}

export interface Interests {
  outdoorActivities: string[];
  clothingStyle: string;
  sustainabilityInterest: number;
  notifications: string[];
}

export interface UserProfile {
  healthProfile?: HealthProfile;
  lifestyleHabits?: LifestyleHabits;
  environmentalSensitivities?: EnvironmentalSensitivities;
  interests?: Interests;
}

export interface User {
  id: number;
  username: string;
  hasSurveyCompleted: boolean;
  userProfile?: UserProfile;
}

export interface WeatherRecommendation {
  type: 'activity' | 'clothing' | 'health';
  title: string;
  description: string;
  icon: string;
  severity?: 'info' | 'warning' | 'danger';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SustainabilityTip {
  title: string;
  content: string;
  icon: string;
}

export interface LocalInitiative {
  title: string;
  description: string;
  icon: string;
}

export interface PollOption {
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiresAt: string;
  userVoted?: boolean;
  userVoteIndex?: number;
}

export interface PollVote {
  pollId: number;
  optionIndex: number;
}

export interface Alert {
  type: 'air_quality' | 'uv' | 'temperature' | 'precipitation' | 'wind';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
  icon: string;
}

export interface SurveyState {
  currentStep: number;
  healthProfile: HealthProfile;
  lifestyleHabits: LifestyleHabits;
  environmentalSensitivities: EnvironmentalSensitivities;
  interests: Interests;
}
