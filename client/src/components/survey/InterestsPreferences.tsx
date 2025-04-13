import { Interests } from "@/types";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface InterestsPreferencesProps {
  data: Interests;
  onChange: (data: Interests) => void;
}

const InterestsPreferencesComponent = ({ data, onChange }: InterestsPreferencesProps) => {
  const handleActivityToggle = (activity: string) => {
    let updatedActivities = [...data.outdoorActivities];
    if (updatedActivities.includes(activity)) {
      updatedActivities = updatedActivities.filter(a => a !== activity);
    } else {
      updatedActivities.push(activity);
    }
    onChange({ ...data, outdoorActivities: updatedActivities });
  };

  const handleNotificationToggle = (notification: string) => {
    let updatedNotifications = [...data.notifications];
    if (updatedNotifications.includes(notification)) {
      updatedNotifications = updatedNotifications.filter(n => n !== notification);
    } else {
      updatedNotifications.push(notification);
    }
    onChange({ ...data, notifications: updatedNotifications });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading font-medium mb-4">Interests and Preferences</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            What types of outdoor activities do you enjoy in Hanoi?
          </Label>
          <div className="space-y-2 mt-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="walking-parks" 
                checked={data.outdoorActivities.includes("walking_parks")}
                onCheckedChange={() => handleActivityToggle("walking_parks")}
              />
              <Label htmlFor="walking-parks">Walking in parks</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cycling" 
                checked={data.outdoorActivities.includes("cycling")}
                onCheckedChange={() => handleActivityToggle("cycling")}
              />
              <Label htmlFor="cycling">Cycling</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sports" 
                checked={data.outdoorActivities.includes("sports")}
                onCheckedChange={() => handleActivityToggle("sports")}
              />
              <Label htmlFor="sports">Sports</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sightseeing" 
                checked={data.outdoorActivities.includes("sightseeing")}
                onCheckedChange={() => handleActivityToggle("sightseeing")}
              />
              <Label htmlFor="sightseeing">Sightseeing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="photography" 
                checked={data.outdoorActivities.includes("photography")}
                onCheckedChange={() => handleActivityToggle("photography")}
              />
              <Label htmlFor="photography">Photography</Label>
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="clothing-style" className="text-sm font-medium text-neutral-700 mb-1">
            What are your preferred clothing styles?
          </Label>
          <Select 
            value={data.clothingStyle}
            onValueChange={(value) => onChange({ ...data, clothingStyle: value })}
          >
            <SelectTrigger id="clothing-style" className="mt-1">
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comfortable">Comfortable and practical</SelectItem>
              <SelectItem value="fashionable">Fashionable</SelectItem>
              <SelectItem value="business_casual">Business casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="athletic">Athletic/sportswear</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            How interested are you in sustainability and environmental issues in Hanoi?
          </Label>
          <div className="flex items-center mt-2">
            <Slider 
              id="sustainability-interest" 
              min={1} 
              max={5} 
              step={1}
              value={[data.sustainabilityInterest]}
              onValueChange={(value) => onChange({ ...data, sustainabilityInterest: value[0] })}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>Not interested</span>
            <span>Very interested</span>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            Do you prefer to receive notifications about:
          </Label>
          <div className="space-y-2 mt-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="weather-alerts" 
                checked={data.notifications.includes("weather_alerts")}
                onCheckedChange={() => handleNotificationToggle("weather_alerts")}
              />
              <Label htmlFor="weather-alerts">Weather alerts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="air-quality" 
                checked={data.notifications.includes("air_quality")}
                onCheckedChange={() => handleNotificationToggle("air_quality")}
              />
              <Label htmlFor="air-quality">Air quality updates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="activity-suggestions" 
                checked={data.notifications.includes("activity_suggestions")}
                onCheckedChange={() => handleNotificationToggle("activity_suggestions")}
              />
              <Label htmlFor="activity-suggestions">Activity suggestions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sustainability-tips" 
                checked={data.notifications.includes("sustainability_tips")}
                onCheckedChange={() => handleNotificationToggle("sustainability_tips")}
              />
              <Label htmlFor="sustainability-tips">Sustainability tips</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestsPreferencesComponent;
