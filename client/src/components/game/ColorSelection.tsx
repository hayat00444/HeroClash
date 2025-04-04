import { useState } from "react";
import { useGame } from "@/context/GameContext";
import BetPrompt from "./BetPrompt";

export default function ColorSelection() {
  const { selectedColor, setSelectedColor, getColorClass } = useGame();
  const [promptOpen, setPromptOpen] = useState(false);
  const [activeBet, setActiveBet] = useState<{id: string, label: string, multiplier: number} | null>(null);
  
  const colors = [
    { id: "green", label: "Green", multiplier: 2 },
    { id: "violet", label: "Violet", multiplier: 4.5 },
    { id: "red", label: "Red", multiplier: 2 }
  ];
  
  const handleColorClick = (color: typeof colors[0]) => {
    setSelectedColor(color.id);
    setActiveBet(color);
    setPromptOpen(true);
  };
  
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {colors.map((color) => (
          <button
            key={color.id}
            className={`flex-1 ${getColorClass(color.id)} bg-opacity-90 rounded-lg py-3 flex flex-col items-center justify-center shadow-lg transition-all duration-200 ${
              selectedColor === color.id ? "ring-2 ring-white ring-opacity-50 transform scale-[1.02]" : ""
            }`}
            onClick={() => handleColorClick(color)}
          >
            <span className="font-bold">{color.label}</span>
            <span className="text-sm font-medium">x{color.multiplier}</span>
          </button>
        ))}
      </div>
      
      {activeBet && (
        <BetPrompt
          open={promptOpen}
          setOpen={setPromptOpen}
          betType="color"
          betValue={activeBet.id}
          betLabel={activeBet.label}
        />
      )}
    </>
  );
}
