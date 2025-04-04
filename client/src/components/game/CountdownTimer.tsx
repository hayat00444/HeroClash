import { useMemo } from "react";
import { formatTime, getStrokeDashArray, getStrokeDashOffset } from "@/lib/gameUtils";

interface CountdownTimerProps {
  timeRemaining: number;
  totalTime: number;
}

export default function CountdownTimer({ timeRemaining, totalTime }: CountdownTimerProps) {
  const radius = 27;
  const circumference = useMemo(() => getStrokeDashArray(radius), [radius]);
  const dashOffset = useMemo(
    () => getStrokeDashOffset(radius, timeRemaining, totalTime),
    [radius, timeRemaining, totalTime]
  );
  
  // Change color when time is running low
  const strokeColor = timeRemaining <= 10 ? "#E74C3C" : "#4A00E0";
  
  return (
    <div className="relative w-[60px] h-[60px]">
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle 
          className="fill-transparent stroke-white stroke-opacity-10" 
          cx="30" 
          cy="30" 
          r={radius} 
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle 
          className="fill-transparent" 
          cx="30" 
          cy="30" 
          r={radius} 
          strokeWidth="5"
          strokeLinecap="round"
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xs text-gray-400">Countdown</span>
        <span className="font-bold">{formatTime(timeRemaining)}</span>
      </div>
    </div>
  );
}
