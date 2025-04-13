import { AirQualityData, UserProfile } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface AirQualityProps {
  data: AirQualityData;
  isLoading: boolean;
  userProfile?: UserProfile;
  className?: string;
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-rose-800";
};

const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return { label: "Good", color: "text-green-500" };
  if (aqi <= 100) return { label: "Moderate", color: "text-yellow-500" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "text-orange-500" };
  if (aqi <= 200) return { label: "Unhealthy", color: "text-red-500" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-500" };
  return { label: "Hazardous", color: "text-rose-800" };
};

const getPersonalizedAdvice = (aqi: number, userProfile?: UserProfile) => {
  if (!userProfile || !userProfile.healthProfile) {
    return "Check air quality before outdoor activities.";
  }

  const healthProfile = userProfile.healthProfile;
  const hasRespiratoryIssues = healthProfile.hasRespiratoryConditions;
  const hasAllergies = healthProfile.hasAllergies;
  const pollutionSensitivity = userProfile.environmentalSensitivities?.pollutionSensitivity || 3;

  if (aqi <= 50) {
    return "Air quality is good! Perfect for outdoor activities.";
  } else if (aqi <= 100) {
    if (hasRespiratoryIssues || pollutionSensitivity >= 4) {
      return "With your respiratory sensitivity, consider limiting prolonged outdoor activities.";
    }
    return "Air quality is acceptable. Consider reducing prolonged outdoor exertion if you experience symptoms.";
  } else if (aqi <= 150) {
    if (hasRespiratoryIssues) {
      return "With your respiratory conditions, limit outdoor activities and consider using an N95 mask outdoors.";
    } else if (hasAllergies || pollutionSensitivity >= 3) {
      return "Due to your sensitivities, limit outdoor exertion and stay hydrated.";
    }
    return "Unhealthy for sensitive groups. Consider spending more time indoors.";
  } else {
    if (hasRespiratoryIssues || hasAllergies) {
      return "With your health profile, avoid outdoor activities and keep windows closed. Use air purifiers if available.";
    }
    return "Air quality is unhealthy. Stay indoors and reduce physical activity.";
  }
};

const AirQuality = ({ data, isLoading, userProfile, className = "" }: AirQualityProps) => {
  if (isLoading || !data) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardContent className="p-6">
          <h3 className="text-lg font-heading font-medium mb-4">Air Quality</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <Skeleton className="w-full h-full rounded-full" />
            </div>
            
            <div className="w-full space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            
            <div className="mt-4 w-full pt-4 border-t">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const aqi = data.current.aqi;
  const aqiCategory = getAQICategory(aqi);
  const personalizedAdvice = getPersonalizedAdvice(aqi, userProfile);
  
  // Calculate the AQI progress circle values
  const circumference = 2 * Math.PI * 40; // 40 is the circle radius
  const progress = Math.max(0, Math.min(1, 1 - (aqi / 300)));
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Card className={`shadow-md ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-lg font-heading font-medium mb-4">Air Quality</h3>
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                className="text-neutral-200" 
                strokeWidth="10" 
                stroke="currentColor" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50"
              />
              <circle 
                className={`${aqiCategory.color} transform -rotate-90 origin-center`} 
                strokeWidth="10" 
                stroke="currentColor" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50"
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-medium ${aqiCategory.color}`}>{aqi}</span>
              <span className="text-sm text-neutral-500">{aqiCategory.label}</span>
            </div>
          </div>
          
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">PM2.5</span>
              <span className="text-sm font-medium">{data.current.pm2_5.toFixed(1)} μg/m³</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">PM10</span>
              <span className="text-sm font-medium">{data.current.pm10.toFixed(1)} μg/m³</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">NO₂</span>
              <span className="text-sm font-medium">{data.current.no2.toFixed(1)} μg/m³</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">O₃</span>
              <span className="text-sm font-medium">{data.current.o3.toFixed(1)} μg/m³</span>
            </div>
          </div>
          
          <div className="mt-4 w-full pt-4 border-t">
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Personalized advice:</span> {personalizedAdvice}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AirQuality;
