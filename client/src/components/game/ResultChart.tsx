import { useGame } from "@/context/GameContext";

export default function ResultChart() {
  const { chartData, getNumberColorClass } = useGame();
  
  // Find the maximum frequency to normalize heights
  const maxFrequency = Math.max(...Object.values(chartData), 1);
  
  // Create array of numbers 0-9
  const numbers = Array.from({ length: 10 }, (_, i) => i);
  
  return (
    <div className="bg-white bg-opacity-5 rounded-lg p-3 h-full flex flex-col">
      <h3 className="text-sm font-medium mb-2">Result Distribution</h3>
      <div className="flex-1 flex items-end space-x-1 sm:space-x-2">
        {numbers.map((number) => {
          const frequency = chartData[number] || 0;
          const heightPercentage = (frequency / maxFrequency) * 100;
          
          return (
            <div key={number} className="flex flex-col items-center flex-1">
              <div 
                className={`w-full ${getNumberColorClass(number)}`} 
                style={{ height: `${heightPercentage}%`, minHeight: '10px' }}
              ></div>
              <span className="text-xs mt-1">{number}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
