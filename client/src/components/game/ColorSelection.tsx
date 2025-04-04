import { useGame } from "@/context/GameContext";

export default function ColorSelection() {
  const { selectedColor, setSelectedColor, getColorClass } = useGame();
  
  const colors = [
    { id: "green", label: "Green", multiplier: 2 },
    { id: "violet", label: "Violet", multiplier: 4.5 },
    { id: "red", label: "Red", multiplier: 2 }
  ];
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {colors.map((color) => (
        <button
          key={color.id}
          className={`flex-1 ${getColorClass(color.id)} bg-opacity-90 rounded-lg py-3 flex flex-col items-center justify-center shadow-lg transition-all duration-200 ${
            selectedColor === color.id ? "ring-2 ring-white ring-opacity-50 transform scale-[1.02]" : ""
          }`}
          onClick={() => setSelectedColor(selectedColor === color.id ? null : color.id)}
        >
          <span className="font-bold">{color.label}</span>
          <span className="text-sm font-medium">x{color.multiplier}</span>
        </button>
      ))}
    </div>
  );
}
