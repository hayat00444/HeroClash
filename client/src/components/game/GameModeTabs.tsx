import { useState } from "react";
import { useGame } from "@/context/GameContext";

export default function GameModeTabs() {
  const { gameState, wallet } = useGame();
  const [activeTab, setActiveTab] = useState("color-prediction");
  
  const tabs = [
    { id: "color-prediction", label: "COLOR PREDICTION" },
  ];
  
  return (
    <div className="bg-black bg-opacity-20 overflow-x-auto whitespace-nowrap px-2 py-2 border-b border-white border-opacity-10">
      <div className="flex justify-between items-center px-2">
        <div className="inline-flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-1 text-sm font-medium rounded-full ${
                activeTab === tab.id
                  ? "bg-purple-700"
                  : "text-white text-opacity-70"
              } transition-colors`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-10 px-3 py-1 rounded-lg flex items-center gap-2">
            <span className="text-xs text-gray-400">Balance:</span>
            <span className="font-medium">₹{wallet.balance.toFixed(2)}</span>
          </div>
          
          <div className="bg-white bg-opacity-10 px-3 py-1 rounded-lg flex items-center gap-2">
            <span className="text-xs text-gray-400">Time:</span>
            <span className="font-medium">{gameState?.timeRemaining || 0}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
