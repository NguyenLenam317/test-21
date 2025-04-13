import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserProfile } from "@/types";
import { useUser } from "../UserContext";

import HealthProfile from "./HealthProfile";
import LifestyleHabits from "./LifestyleHabits";
import EnvironmentalSensitivities from "./EnvironmentalSensitivities";
import InterestsPreferences from "./InterestsPreferences";

// Define the initial state for each survey section
const initialHealthProfile = {
  respiratoryConditions: [],
  hasRespiratoryConditions: false,
  allergies: [],
  hasAllergies: false,
  cardiovascularConcerns: false,
  skinConditions: false,
  fitnessLevel: "",
};

const initialLifestyleHabits = {
  dailyRoutine: "",
  transportation: [],
  dietaryPreferences: [],
  sleepHabits: "",
};

const initialEnvironmentalSensitivities = {
  pollutionSensitivity: 3,
  uvSensitivity: 3,
  heatSensitivity: 3,
  coldSensitivity: 3,
};

const initialInterests = {
  outdoorActivities: [],
  clothingStyle: "",
  sustainabilityInterest: 3,
  notifications: ["weather_alerts", "air_quality", "activity_suggestions"],
};

interface SurveyProps {
  onComplete: () => void;
}

const Survey = ({ onComplete }: SurveyProps) => {
  const { toast } = useToast();
  const { updateUserProfile, setHasSurveyCompleted } = useUser();
  
  const [currentSection, setCurrentSection] = useState(0);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  
  const [healthProfile, setHealthProfile] = useState(initialHealthProfile);
  const [lifestyleHabits, setLifestyleHabits] = useState(initialLifestyleHabits);
  const [environmentalSensitivities, setEnvironmentalSensitivities] = useState(initialEnvironmentalSensitivities);
  const [interests, setInterests] = useState(initialInterests);

  const sections = [
    { name: "Health Profile", component: <HealthProfile data={healthProfile} onChange={setHealthProfile} /> },
    { name: "Lifestyle Habits", component: <LifestyleHabits data={lifestyleHabits} onChange={setLifestyleHabits} /> },
    { name: "Environmental Sensitivities", component: <EnvironmentalSensitivities data={environmentalSensitivities} onChange={setEnvironmentalSensitivities} /> },
    { name: "Interests & Preferences", component: <InterestsPreferences data={interests} onChange={setInterests} /> },
  ];

  const progress = ((currentSection + 1) / sections.length) * 100;

  const goToNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      handleSurveyCompletion();
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSurveyCompletion = async () => {
    try {
      const userProfile: UserProfile = {
        healthProfile,
        lifestyleHabits,
        environmentalSensitivities,
        interests,
      };

      await updateUserProfile(userProfile);
      
      // After successfully updating the profile, mark the survey as completed
      await apiRequest('POST', '/api/user/survey/complete', {});
      setHasSurveyCompleted(true);
      
      toast({
        title: "Survey Completed",
        description: "Thank you for completing the survey. Your environmental dashboard is now personalized.",
      });
      
      onComplete();
    } catch (error) {
      console.error("Error completing survey:", error);
      toast({
        title: "Error",
        description: "There was an error saving your survey. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setShowCloseWarning(true);
  };

  const confirmClose = () => {
    setShowCloseWarning(false);
    onComplete();
  };

  const cancelClose = () => {
    setShowCloseWarning(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-heading font-semibold">Welcome to EcoSense Hanoi</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <span className="material-icons">close</span>
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <p className="mt-2 text-neutral-600">Please complete this survey to personalize your experience.</p>
          
          <div className="mt-4 relative pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-primary">
                  Survey Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
          </div>
        </div>
        
        <CardContent className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          {sections[currentSection].component}
        </CardContent>
        
        <div className="p-6 border-t flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPreviousSection} 
            disabled={currentSection === 0}
          >
            Back
          </Button>
          <Button onClick={goToNextSection}>
            {currentSection < sections.length - 1 ? "Next" : "Complete"}
          </Button>
        </div>
      </Card>
      
      {showCloseWarning && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Close Survey?</h3>
              <p className="text-neutral-600 mb-4">
                Your progress will be lost. Are you sure you want to close the survey?
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={cancelClose}>Cancel</Button>
                <Button variant="destructive" onClick={confirmClose}>Close Survey</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Survey;
