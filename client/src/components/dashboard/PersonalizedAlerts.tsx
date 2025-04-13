import { Alert } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface PersonalizedAlertsProps {
  alerts: Alert[];
  isLoading: boolean;
}

const alertBackgroundColors = {
  air_quality: {
    info: "bg-blue-100 border-blue-500",
    warning: "bg-yellow-100 border-yellow-500",
    danger: "bg-red-100 border-red-500",
  },
  uv: {
    info: "bg-blue-100 border-blue-500",
    warning: "bg-yellow-100 border-yellow-500",
    danger: "bg-red-100 border-red-500",
  },
  temperature: {
    info: "bg-blue-100 border-blue-500",
    warning: "bg-yellow-100 border-yellow-500",
    danger: "bg-red-100 border-red-500",
  },
  precipitation: {
    info: "bg-blue-100 border-blue-500",
    warning: "bg-yellow-100 border-yellow-500",
    danger: "bg-red-100 border-red-500",
  },
  wind: {
    info: "bg-blue-100 border-blue-500",
    warning: "bg-yellow-100 border-yellow-500",
    danger: "bg-red-100 border-red-500",
  },
};

const alertTextColors = {
  info: "text-blue-800",
  warning: "text-yellow-800",
  danger: "text-red-800",
};

const PersonalizedAlerts = ({ alerts, isLoading }: PersonalizedAlertsProps) => {
  if (isLoading) {
    return (
      <div className="bg-primary-light bg-opacity-10 rounded-lg p-4 mb-8">
        <div className="flex items-center mb-2">
          <Skeleton className="h-6 w-6 mr-2 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary-light bg-opacity-10 rounded-lg p-4 mb-8">
      <h3 className="text-lg font-heading font-medium flex items-center mb-2">
        <span className="material-icons text-primary mr-2">notifications_active</span>
        Personalized Alerts
      </h3>
      <div className="space-y-2">
        {alerts.map((alert, index) => {
          const bgColor = alertBackgroundColors[alert.type][alert.severity];
          const textColor = alertTextColors[alert.severity];
          
          return (
            <div 
              key={index} 
              className={`rounded-lg p-3 border-l-4 ${bgColor}`}
            >
              <div className="flex items-start">
                <span className={`material-icons ${textColor} mr-2`}>{alert.icon}</span>
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-neutral-700">{alert.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalizedAlerts;
