interface ConfidenceMeterProps {
  level: "high" | "medium" | "low";
  percentage?: number;
}

const ConfidenceMeter = ({ level, percentage }: ConfidenceMeterProps) => {
  const getColor = () => {
    switch (level) {
      case "high":
        return "bg-confidence-high";
      case "medium":
        return "bg-confidence-medium";
      case "low":
        return "bg-confidence-low";
    }
  };

  const getLabel = () => {
    switch (level) {
      case "high":
        return "High Confidence";
      case "medium":
        return "Medium Confidence";
      case "low":
        return "Low Confidence";
    }
  };

  const getWidth = () => {
    if (percentage !== undefined) {
      return `${percentage}%`;
    }
    switch (level) {
      case "high":
        return "90%";
      case "medium":
        return "60%";
      case "low":
        return "30%";
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{getLabel()}</span>
        {percentage !== undefined && (
          <span className="text-muted-foreground">{percentage}%</span>
        )}
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} rounded-full transition-all duration-500`}
          style={{ width: getWidth() }}
        />
      </div>
    </div>
  );
};

export default ConfidenceMeter;
