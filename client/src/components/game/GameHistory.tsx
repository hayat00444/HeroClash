import { useState } from "react";
import ResultChart from "./ResultChart";
import BettingHistory from "./BettingHistory";
import { useGame } from "@/context/GameContext";

export default function GameHistory() {
  const [activeTab, setActiveTab] = useState("game-history");
  const { gameHistory, getNumberColorClass } = useGame();
  
  return (
    <div className="bg-black bg-opacity-30 border-t border-white border-opacity-10 pt-2">
      {/* Tabs */}
      <div className="flex border-b border-white border-opacity-10">
        <button 
          className={`flex-1 py-2 text-center text-sm font-medium ${
            activeTab === "game-history" 
              ? "border-b-2 border-purple-700 text-white" 
              : "text-white text-opacity-60"
          }`}
          onClick={() => setActiveTab("game-history")}
        >
          Game History
        </button>
        <button 
          className={`flex-1 py-2 text-center text-sm font-medium ${
            activeTab === "chart" 
              ? "border-b-2 border-purple-700 text-white" 
              : "text-white text-opacity-60"
          }`}
          onClick={() => setActiveTab("chart")}
        >
          Chart
        </button>
        <button 
          className={`flex-1 py-2 text-center text-sm font-medium ${
            activeTab === "my-history" 
              ? "border-b-2 border-purple-700 text-white" 
              : "text-white text-opacity-60"
          }`}
          onClick={() => setActiveTab("my-history")}
        >
          My History
        </button>
      </div>
      
      {/* Game History Content */}
      <div className={`p-3 h-60 overflow-y-auto custom-scrollbar ${activeTab === "game-history" ? "block" : "hidden"}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs">
              <th className="text-left pb-2">Period</th>
              <th className="text-center pb-2">Number</th>
              <th className="text-center pb-2">Big/Small</th>
              <th className="text-right pb-2">Color</th>
            </tr>
          </thead>
          <tbody>
            {gameHistory.length > 0 ? (
              gameHistory.map((record) => (
                <tr key={record.period} className="border-b border-white border-opacity-5">
                  <td className="py-2 font-mono">{record.period}</td>
                  <td className="py-2 text-center">
                    <span className={`inline-block w-6 h-6 rounded-full ${getNumberColorClass(record.number)} text-center leading-6`}>
                      {record.number}
                    </span>
                  </td>
                  <td className="py-2 text-center capitalize">{record.bigSmall}</td>
                  <td className={`py-2 text-right capitalize ${
                    record.color === "green" ? "text-emerald-500" : 
                    record.color === "violet" ? "text-purple-500" : 
                    "text-red-500"
                  }`}>
                    {record.color}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">
                  No game history yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Chart Content */}
      <div className={`p-3 h-60 ${activeTab === "chart" ? "block" : "hidden"}`}>
        <ResultChart />
      </div>
      
      {/* My History Content */}
      <div className={`p-3 h-60 ${activeTab === "my-history" ? "block" : "hidden"}`}>
        <BettingHistory />
      </div>
    </div>
  );
}
