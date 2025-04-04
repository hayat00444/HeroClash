import { useState } from "react";
import { useGame } from "@/context/GameContext";
import BetPrompt from "./BetPrompt";

export default function BigSmallSelection() {
  const { selectedSize, setSelectedSize } = useGame();
  const [promptOpen, setPromptOpen] = useState(false);
  const [activeBet, setActiveBet] = useState<{id: string, label: string, range: string} | null>(null);
  
  const handleBigClick = () => {
    setSelectedSize("big");
    setActiveBet({
      id: "big",
      label: "Big (5-9)",
      range: "5-9"
    });
    setPromptOpen(true);
  };
  
  const handleSmallClick = () => {
    setSelectedSize("small");
    setActiveBet({
      id: "small",
      label: "Small (0-4)",
      range: "0-4"
    });
    setPromptOpen(true);
  };
  
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button
          className={`bg-white bg-opacity-10 rounded-lg py-3 flex flex-col items-center justify-center shadow transition-all duration-200 ${
            selectedSize === "big" ? "ring-2 ring-white ring-opacity-50 bg-opacity-20" : ""
          }`}
          onClick={handleBigClick}
        >
          <span className="font-bold">Big</span>
          <span className="text-xs text-gray-300">5-9</span>
          <span className="text-xs font-medium">x2</span>
        </button>
        <button
          className={`bg-white bg-opacity-10 rounded-lg py-3 flex flex-col items-center justify-center shadow transition-all duration-200 ${
            selectedSize === "small" ? "ring-2 ring-white ring-opacity-50 bg-opacity-20" : ""
          }`}
          onClick={handleSmallClick}
        >
          <span className="font-bold">Small</span>
          <span className="text-xs text-gray-300">0-4</span>
          <span className="text-xs font-medium">x2</span>
        </button>
      </div>
      
      {activeBet && (
        <BetPrompt
          open={promptOpen}
          setOpen={setPromptOpen}
          betType="size"
          betValue={activeBet.id}
          betLabel={activeBet.label}
        />
      )}
    </>
  );
}
