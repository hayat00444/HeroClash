import { useGame } from "@/context/GameContext";

export default function BettingControls() {
  const { 
    betAmount, 
    setBetAmount, 
    wallet,
    selectedColor,
    selectedNumber,
    selectedSize,
    placeBet,
    gameState
  } = useGame();
  
  const amounts = [
    { value: 1, label: "x1" },
    { value: 5, label: "x5" },
    { value: 10, label: "x10" },
    { value: 50, label: "x50" },
    { value: 100, label: "x100" },
    { value: wallet.balance, label: "MAX" }
  ];
  
  // Generate a random selection
  const handleRandom = () => {
    // Clear all selections first
    setSelectedColor(null);
    setSelectedNumber(null);
    setSelectedSize(null);
    
    // Pick one of the three bet types randomly
    const betType = Math.floor(Math.random() * 3);
    
    switch (betType) {
      case 0: // Color
        const colors = ["green", "violet", "red"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setSelectedColor(randomColor);
        break;
      case 1: // Number
        const randomNumber = Math.floor(Math.random() * 10);
        setSelectedNumber(randomNumber);
        break;
      case 2: // Big/Small
        const sizes = ["big", "small"];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        setSelectedSize(randomSize);
        break;
    }
  };
  
  // Check if something is selected
  const hasSelection = selectedColor || selectedNumber !== null || selectedSize;
  
  // Check if game is active
  const isGameActive = gameState?.roundActive;
  
  // Check if user has enough balance
  const hasEnoughBalance = wallet.balance >= betAmount;
  
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-2">
        <button 
          className="px-3 py-1 bg-white bg-opacity-10 rounded-full text-sm"
          onClick={handleRandom}
        >
          Random
        </button>
        <div className="text-sm">
          <span className="text-gray-400">Amount:</span>
          <span className="font-medium text-white"> ₹{betAmount}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        {amounts.map((amount, index) => (
          <button
            key={index}
            className={`px-1 py-2 rounded text-sm font-medium transition-all ${
              betAmount === amount.value
                ? "bg-purple-700"
                : "bg-white bg-opacity-10 hover:bg-white hover:bg-opacity-20"
            }`}
            onClick={() => setBetAmount(amount.value)}
          >
            {amount.label}
          </button>
        ))}
      </div>
      
      <button 
        className={`w-full mt-4 bg-gradient-to-r from-purple-800 to-purple-600 py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 ${
          (!hasSelection || !isGameActive || !hasEnoughBalance) 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:opacity-90 active:scale-[0.98]"
        }`}
        onClick={placeBet}
        disabled={!hasSelection || !isGameActive || !hasEnoughBalance}
      >
        Confirm
      </button>
    </div>
  );
}
