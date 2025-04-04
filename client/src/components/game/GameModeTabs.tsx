import { useState } from "react";

export default function GameModeTabs() {
  // Currently we only have one game mode, but this component is structured
  // to support multiple modes in the future
  const [activeTab, setActiveTab] = useState("win-go-1");
  
  const tabs = [
    { id: "win-go-1", label: "Win Go 1 Min" },
    { id: "win-go-30", label: "Win Go 30S" },
    { id: "fast-10", label: "Fast 10S" },
    { id: "777", label: "777" },
  ];
  
  return (
    <div className="bg-black bg-opacity-20 overflow-x-auto whitespace-nowrap px-2 py-2 border-b border-white border-opacity-10">
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
    </div>
  );
}
