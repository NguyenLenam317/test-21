import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClimateData, UserProfile } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ClimateChangeInsightsProps {
  data?: ClimateData;
  isLoading: boolean;
  userProfile?: UserProfile;
  className?: string;
}

const ClimateChangeInsights = ({ data, isLoading, userProfile, className = "" }: ClimateChangeInsightsProps) => {
  if (isLoading || !data) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 mr-2 rounded-full" />
            <Skeleton className="h-6 w-64" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="p-4 bg-neutral-50 rounded-lg mb-4">
                <Skeleton className="h-5 w-48 mb-2" />
                <div className="bg-white p-2 rounded border h-[200px]">
                  <Skeleton className="h-full w-full" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
            
            <div>
              <div className="p-4 bg-neutral-50 rounded-lg h-full">
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-start">
                    <Skeleton className="h-5 w-5 mr-2 mt-0.5 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex items-start">
                    <Skeleton className="h-5 w-5 mr-2 mt-0.5 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex items-start">
                    <Skeleton className="h-5 w-5 mr-2 mt-0.5 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform climate data for recharts
  const temperatureData = data.temperature.years.map((year, i) => ({
    name: year,
    temperature: data.temperature.values[i],
  }));

  // Generate personalized impact messages based on user profile
  const getPersonalizedImpacts = () => {
    const impacts = [];
    
    if (!userProfile) {
      return [
        "Increased risk of respiratory issues during prolonged heat waves",
        "Higher chance of flood-related disruptions to daily activities",
        "Consider installing air purifiers at home to mitigate air quality concerns",
        "Stay informed about Hanoi's climate adaptation plans"
      ];
    }
    
    const healthProfile = userProfile.healthProfile;
    const hasRespiratoryIssues = healthProfile?.hasRespiratoryConditions;
    const hasAllergies = healthProfile?.hasAllergies;
    const heatSensitivity = userProfile.environmentalSensitivities?.heatSensitivity || 3;
    
    if (hasRespiratoryIssues) {
      impacts.push("Increased risk of respiratory issues during prolonged heat waves and high pollution days");
    }
    
    if (hasAllergies) {
      impacts.push("Higher pollen counts due to changing seasons may worsen your allergic reactions");
    }
    
    if (heatSensitivity >= 4) {
      impacts.push("Your heat sensitivity puts you at higher risk during increasingly frequent heat waves");
    }
    
    impacts.push("Higher chance of flood-related disruptions to daily activities");
    impacts.push("Consider installing air purifiers at home to mitigate air quality concerns");
    
    return impacts;
  };

  const personalizedImpacts = getPersonalizedImpacts();

  return (
    <Card className={`shadow-md ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-lg font-heading font-medium flex items-center mb-4">
          <span className="material-icons text-primary mr-2">insights</span>
          Climate Change Insights for Hanoi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="p-4 bg-neutral-50 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Temperature Trends (1990-2023)</h4>
              <div className="bg-white p-2 rounded border h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={temperatureData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}°C`, 'Temperature']}
                      labelFormatter={(year) => `Year: ${year}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#1976d2" 
                      activeDot={{ r: 8 }} 
                      name="Temperature (°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-neutral-600 mt-2">
                Hanoi has experienced a 1.2°C average temperature increase over the past 30 years, with more frequent heat waves.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium mb-2">Precipitation Changes</h4>
                <p className="text-sm text-neutral-700">
                  Rainfall patterns have become more erratic, with 15% increase in intense rain events since 2000.
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium mb-2">Air Quality Trends</h4>
                <p className="text-sm text-neutral-700">
                  Annual average PM2.5 concentration has decreased by 8% since 2015, but remains above WHO guidelines.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-4 bg-neutral-50 rounded-lg h-full">
              <h4 className="font-medium mb-2">What This Means For You</h4>
              <div className="space-y-3 text-sm text-neutral-700">
                <p>Based on your health profile{userProfile?.healthProfile?.hasRespiratoryConditions ? " as someone with respiratory conditions" : ""}:</p>
                
                {personalizedImpacts.map((impact, index) => {
                  const isWarning = index < 2; // First two items are warnings
                  return (
                    <div key={index} className="flex items-start">
                      <span className={`material-icons ${isWarning ? 'text-warning' : 'text-secondary'} mr-2 text-sm`}>
                        {isWarning ? 'warning' : 'tips_and_updates'}
                      </span>
                      <p>{impact}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClimateChangeInsights;
