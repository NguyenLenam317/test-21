import { LifestyleHabits } from "@/types";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LifestyleHabitsProps {
  data: LifestyleHabits;
  onChange: (data: LifestyleHabits) => void;
}

const LifestyleHabitsComponent = ({ data, onChange }: LifestyleHabitsProps) => {
  const handleTransportationToggle = (mode: string) => {
    let updatedModes = [...data.transportation];
    if (updatedModes.includes(mode)) {
      updatedModes = updatedModes.filter(m => m !== mode);
    } else {
      updatedModes.push(mode);
    }
    onChange({ ...data, transportation: updatedModes });
  };

  const handleDietaryToggle = (preference: string) => {
    let updatedPreferences = [...data.dietaryPreferences];
    if (updatedPreferences.includes(preference)) {
      updatedPreferences = updatedPreferences.filter(p => p !== preference);
    } else {
      updatedPreferences.push(preference);
    }
    onChange({ ...data, dietaryPreferences: updatedPreferences });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading font-medium mb-4">Lifestyle Habits</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="daily-routine" className="text-sm font-medium text-neutral-700 mb-1">
            What are your typical daily routines and activity patterns?
          </Label>
          <Select 
            value={data.dailyRoutine}
            onValueChange={(value) => onChange({ ...data, dailyRoutine: value })}
          >
            <SelectTrigger id="daily-routine" className="mt-1">
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mostly_indoors">Mostly indoors</SelectItem>
              <SelectItem value="frequent_outdoor_commuting">Frequent outdoor commuting</SelectItem>
              <SelectItem value="regular_outdoor_recreation">Regular outdoor recreation</SelectItem>
              <SelectItem value="mixed">Mix of indoor and outdoor activities</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            What are your primary modes of transportation in Hanoi?
          </Label>
          <div className="space-y-2 mt-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="motorbike" 
                checked={data.transportation.includes("motorbike")}
                onCheckedChange={() => handleTransportationToggle("motorbike")}
              />
              <Label htmlFor="motorbike">Motorbike</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="car" 
                checked={data.transportation.includes("car")}
                onCheckedChange={() => handleTransportationToggle("car")}
              />
              <Label htmlFor="car">Car</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="bus" 
                checked={data.transportation.includes("bus")}
                onCheckedChange={() => handleTransportationToggle("bus")}
              />
              <Label htmlFor="bus">Bus</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="walking" 
                checked={data.transportation.includes("walking")}
                onCheckedChange={() => handleTransportationToggle("walking")}
              />
              <Label htmlFor="walking">Walking</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="bicycle" 
                checked={data.transportation.includes("bicycle")}
                onCheckedChange={() => handleTransportationToggle("bicycle")}
              />
              <Label htmlFor="bicycle">Bicycle</Label>
            </div>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            Do you have any specific dietary preferences or restrictions?
          </Label>
          <div className="space-y-2 mt-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="vegetarian" 
                checked={data.dietaryPreferences.includes("vegetarian")}
                onCheckedChange={() => handleDietaryToggle("vegetarian")}
              />
              <Label htmlFor="vegetarian">Vegetarian</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="vegan" 
                checked={data.dietaryPreferences.includes("vegan")}
                onCheckedChange={() => handleDietaryToggle("vegan")}
              />
              <Label htmlFor="vegan">Vegan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="gluten-free" 
                checked={data.dietaryPreferences.includes("gluten_free")}
                onCheckedChange={() => handleDietaryToggle("gluten_free")}
              />
              <Label htmlFor="gluten-free">Gluten-free</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="other-diet" 
                checked={data.dietaryPreferences.includes("other")}
                onCheckedChange={() => handleDietaryToggle("other")}
              />
              <Label htmlFor="other-diet">Other</Label>
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="sleep-habits" className="text-sm font-medium text-neutral-700 mb-1">
            What are your typical sleep habits?
          </Label>
          <Select 
            value={data.sleepHabits}
            onValueChange={(value) => onChange({ ...data, sleepHabits: value })}
          >
            <SelectTrigger id="sleep-habits" className="mt-1">
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="early_riser">Early riser (before 6 AM)</SelectItem>
              <SelectItem value="normal_schedule">Normal schedule (6-8 AM rise)</SelectItem>
              <SelectItem value="night_owl">Night owl (sleep after midnight)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default LifestyleHabitsComponent;
