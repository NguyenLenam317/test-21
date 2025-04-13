import { HealthProfile as HealthProfileType } from "@/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HealthProfileProps {
  data: HealthProfileType;
  onChange: (data: HealthProfileType) => void;
}

const HealthProfileComponent = ({ data, onChange }: HealthProfileProps) => {
  const handleRespiratoryChange = (value: string) => {
    const hasConditions = value === "yes";
    onChange({
      ...data,
      hasRespiratoryConditions: hasConditions,
      respiratoryConditions: hasConditions ? data.respiratoryConditions : [],
    });
  };

  const handleAllergiesChange = (value: string) => {
    const hasAllergies = value === "yes";
    onChange({
      ...data,
      hasAllergies,
      allergies: hasAllergies ? data.allergies : [],
    });
  };

  const handleRespiratoryConditionToggle = (condition: string) => {
    let updatedConditions = [...data.respiratoryConditions];
    if (updatedConditions.includes(condition)) {
      updatedConditions = updatedConditions.filter(c => c !== condition);
    } else {
      updatedConditions.push(condition);
    }
    onChange({ ...data, respiratoryConditions: updatedConditions });
  };

  const handleAllergyToggle = (allergyType: string) => {
    let updatedAllergies = [...data.allergies];
    if (updatedAllergies.includes(allergyType)) {
      updatedAllergies = updatedAllergies.filter(a => a !== allergyType);
    } else {
      updatedAllergies.push(allergyType);
    }
    onChange({ ...data, allergies: updatedAllergies });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading font-medium mb-4">Health Profile</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            Do you have any respiratory conditions?
          </Label>
          <RadioGroup 
            value={data.hasRespiratoryConditions ? "yes" : "no"}
            onValueChange={handleRespiratoryChange}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="resp-yes" />
              <Label htmlFor="resp-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="resp-no" />
              <Label htmlFor="resp-no">No</Label>
            </div>
          </RadioGroup>
          
          {data.hasRespiratoryConditions && (
            <div className="mt-2 pl-6">
              <Label className="text-sm font-medium text-neutral-700 mb-1">
                Please specify:
              </Label>
              <div className="space-y-2 mt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="asthma" 
                    checked={data.respiratoryConditions.includes("asthma")}
                    onCheckedChange={() => handleRespiratoryConditionToggle("asthma")}
                  />
                  <Label htmlFor="asthma">Asthma</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="bronchitis" 
                    checked={data.respiratoryConditions.includes("bronchitis")}
                    onCheckedChange={() => handleRespiratoryConditionToggle("bronchitis")}
                  />
                  <Label htmlFor="bronchitis">Bronchitis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="copd" 
                    checked={data.respiratoryConditions.includes("copd")}
                    onCheckedChange={() => handleRespiratoryConditionToggle("copd")}
                  />
                  <Label htmlFor="copd">COPD</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="other-resp" 
                    checked={data.respiratoryConditions.includes("other")}
                    onCheckedChange={() => handleRespiratoryConditionToggle("other")}
                  />
                  <Label htmlFor="other-resp">Other</Label>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            Do you have any allergies?
          </Label>
          <RadioGroup 
            value={data.hasAllergies ? "yes" : "no"}
            onValueChange={handleAllergiesChange}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="allergy-yes" />
              <Label htmlFor="allergy-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="allergy-no" />
              <Label htmlFor="allergy-no">No</Label>
            </div>
          </RadioGroup>
          
          {data.hasAllergies && (
            <div className="mt-2 pl-6">
              <Label className="text-sm font-medium text-neutral-700 mb-1">
                Please specify:
              </Label>
              <div className="space-y-2 mt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pollen" 
                    checked={data.allergies.includes("pollen")}
                    onCheckedChange={() => handleAllergyToggle("pollen")}
                  />
                  <Label htmlFor="pollen">Pollen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="dust" 
                    checked={data.allergies.includes("dust")}
                    onCheckedChange={() => handleAllergyToggle("dust")}
                  />
                  <Label htmlFor="dust">Dust</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="mold" 
                    checked={data.allergies.includes("mold")}
                    onCheckedChange={() => handleAllergyToggle("mold")}
                  />
                  <Label htmlFor="mold">Mold</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="food" 
                    checked={data.allergies.includes("food")}
                    onCheckedChange={() => handleAllergyToggle("food")}
                  />
                  <Label htmlFor="food">Food allergies</Label>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="fitness-level" className="text-sm font-medium text-neutral-700 mb-1">
            How would you describe your general fitness level?
          </Label>
          <Select 
            value={data.fitnessLevel}
            onValueChange={(value) => onChange({ ...data, fitnessLevel: value })}
          >
            <SelectTrigger id="fitness-level" className="mt-1">
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
              <SelectItem value="light">Light exercise (1-2 times a week)</SelectItem>
              <SelectItem value="moderate">Moderate exercise (3-5 times a week)</SelectItem>
              <SelectItem value="active">Active daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            Do you have any cardiovascular health concerns?
          </Label>
          <RadioGroup 
            value={data.cardiovascularConcerns ? "yes" : "no"}
            onValueChange={(value) => onChange({ 
              ...data, 
              cardiovascularConcerns: value === "yes" 
            })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="cardio-yes" />
              <Label htmlFor="cardio-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="cardio-no" />
              <Label htmlFor="cardio-no">No</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            Do you have any skin sensitivities or conditions?
          </Label>
          <RadioGroup 
            value={data.skinConditions ? "yes" : "no"}
            onValueChange={(value) => onChange({ 
              ...data, 
              skinConditions: value === "yes" 
            })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="skin-yes" />
              <Label htmlFor="skin-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="skin-no" />
              <Label htmlFor="skin-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default HealthProfileComponent;
