import { useState } from "react";
import { useGame } from "@/context/GameContext";
import BetPrompt from "./BetPrompt";

export default function NumberSelection() {
  const { selectedNumber, setSelectedNumber, getNumberColorClass } = useGame();
  const [promptOpen, setPromptOpen] = useState(false);
  const [activeBet, setActiveBet] = useState<{number: number, label: string} | null>(null);
  
  const numbers = Array.from({ length: 10 }, (_, i) => i);
  
  const handleNumberClick = (number: number) => {
    setSelectedNumber(number);
    setActiveBet({
      number: number,
      label: `Number ${number}`
    });
    setPromptOpen(true);
  };
  
  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        {numbers.map((number) => (
          <button
            key={number}
            className={`rounded-lg py-3 flex flex-col items-center justify-center ${getNumberColorClass(number)} bg-opacity-70 shadow transition-all duration-200 ${
              selectedNumber === number ? "ring-2 ring-white ring-opacity-50 transform scale-[1.05]" : ""
            }`}
            onClick={() => handleNumberClick(number)}
          >
            <span className="font-bold">{number}</span>
            <span className="text-xs font-medium">x9</span>
          </button>
        ))}
      </div>
      
      {activeBet && (
        <BetPrompt
          open={promptOpen}
          setOpen={setPromptOpen}
          betType="number"
          betValue={activeBet.number.toString()}
          betLabel={activeBet.label}
        />
      )}
    </>
  );
}
