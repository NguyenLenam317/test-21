import { EnvironmentalSensitivities } from "@/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface EnvironmentalSensitivitiesProps {
  data: EnvironmentalSensitivities;
  onChange: (data: EnvironmentalSensitivities) => void;
}

const EnvironmentalSensitivitiesComponent = ({ data, onChange }: EnvironmentalSensitivitiesProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading font-medium mb-4">Environmental Sensitivities</h3>
      
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            How sensitive are you to air pollution?
          </Label>
          <div className="flex items-center mt-2">
            <Slider 
              id="pollution-sensitivity" 
              min={1} 
              max={5} 
              step={1}
              value={[data.pollutionSensitivity]}
              onValueChange={(value) => onChange({ ...data, pollutionSensitivity: value[0] })}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>Not sensitive</span>
            <span>Very sensitive</span>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            How sensitive are you to high UV radiation?
          </Label>
          <div className="flex items-center mt-2">
            <Slider 
              id="uv-sensitivity" 
              min={1} 
              max={5} 
              step={1}
              value={[data.uvSensitivity]}
              onValueChange={(value) => onChange({ ...data, uvSensitivity: value[0] })}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>Not sensitive</span>
            <span>Very sensitive</span>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            How sensitive are you to heat?
          </Label>
          <div className="flex items-center mt-2">
            <Slider 
              id="heat-sensitivity" 
              min={1} 
              max={5} 
              step={1}
              value={[data.heatSensitivity]}
              onValueChange={(value) => onChange({ ...data, heatSensitivity: value[0] })}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>Not sensitive</span>
            <span>Very sensitive</span>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-1">
            How sensitive are you to cold?
          </Label>
          <div className="flex items-center mt-2">
            <Slider 
              id="cold-sensitivity" 
              min={1} 
              max={5} 
              step={1}
              value={[data.coldSensitivity]}
              onValueChange={(value) => onChange({ ...data, coldSensitivity: value[0] })}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>Not sensitive</span>
            <span>Very sensitive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalSensitivitiesComponent;
