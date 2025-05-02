import { useEffect, useState } from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressPercent = (currentStep / totalSteps) * 100;
    setProgress(progressPercent);
  }, [currentStep, totalSteps]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-numourDark">Progress</span>
        <span className="text-sm font-medium text-numourPurple">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-numourLavender">
        <div 
          className="absolute inset-0 bg-numourPurple transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
