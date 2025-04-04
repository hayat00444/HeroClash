import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import useWebSocket from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { 
  GameRound, GameState, WebSocketMessage,
  NUMBER_COLOR_MAP
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface GameContextType {
  // Game state
  gameState: GameState | null;
  isConnected: boolean;
  wallet: {
    balance: number;
    isLoading: boolean;
  };
  
  // User selections
  selectedColor: string | null;
  selectedNumber: number | null;
  selectedSize: string | null;
  betAmount: number;
  
  // User actions
  setSelectedColor: (color: string | null) => void;
  setSelectedNumber: (number: number | null) => void;
  setSelectedSize: (size: string | null) => void;
  setBetAmount: (amount: number) => void;
  placeBet: () => Promise<void>;
  
  // Wallet actions
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  
  // Game data
  gameHistory: GameRound[];
  userBets: any[];
  chartData: Record<number, number>;
  
  // UI helpers
  getColorClass: (color: string) => string;
  getNumberColorClass: (number: number) => string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // WebSocket connection
  const { sendMessage, lastMessage, isConnected } = useWebSocket("/ws");
  const { toast } = useToast();
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameHistory, setGameHistory] = useState<GameRound[]>([]);
  const [userBets, setUserBets] = useState<any[]>([]);
  const [chartData, setChartData] = useState<Record<number, number>>({
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  });
  
  // User wallet
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false);
  
  // User selections
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage) as WebSocketMessage;
        
        switch (message.type) {
          case 'gameState':
            setGameState(message.data);
            if (message.data.lastResults.length > 0) {
              setGameHistory(message.data.lastResults);
            }
            break;
          case 'gameResult':
            toast({
              title: "Game Result",
              description: `Number: ${message.data.number}, Color: ${message.data.color}`,
              duration: 5000
            });
            // Update chart data
            setChartData(prev => ({
              ...prev,
              [message.data.number]: (prev[message.data.number] || 0) + 1
            }));
            break;
          case 'betResponse':
            if (message.success) {
              toast({
                title: "Bet Placed",
                description: message.message,
                duration: 3000
              });
              // Reset selections
              setSelectedColor(null);
              setSelectedNumber(null);
              setSelectedSize(null);
              // Update balance
              if (message.balance !== undefined) {
                setBalance(message.balance);
              }
            } else {
              toast({
                title: "Bet Failed",
                description: message.message,
                variant: "destructive",
                duration: 3000
              });
            }
            break;
          case 'walletUpdate':
            setBalance(message.balance);
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, toast]);
  
  // Load initial game history
  useEffect(() => {
    fetchGameHistory();
    fetchUserProfile();
    fetchStats();
  }, []);
  
  // Fetch game history
  const fetchGameHistory = async () => {
    try {
      const response = await fetch('/api/game/history');
      if (response.ok) {
        const data = await response.json();
        setGameHistory(data);
      }
    } catch (error) {
      console.error("Error fetching game history:", error);
    }
  };
  
  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        
        // Authenticate with WebSocket
        if (isConnected) {
          sendMessage(JSON.stringify({
            type: 'auth',
            userId: data.id
          }));
        }
        
        // Fetch user bets
        fetchUserBets();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  
  // Fetch user betting history
  const fetchUserBets = async () => {
    try {
      const response = await fetch('/api/user/history');
      if (response.ok) {
        const data = await response.json();
        setUserBets(data);
      }
    } catch (error) {
      console.error("Error fetching user bets:", error);
    }
  };
  
  // Fetch game statistics for chart
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/game/stats');
      if (response.ok) {
        const data = await response.json();
        setChartData(data.frequency);
      }
    } catch (error) {
      console.error("Error fetching game stats:", error);
    }
  };
  
  // Place a bet
  const placeBet = async () => {
    // Validate selection
    if (!selectedColor && selectedNumber === null && !selectedSize) {
      toast({
        title: "Selection Required",
        description: "Please select a color, number, or big/small",
        variant: "destructive"
      });
      return;
    }
    
    // Make bet payload
    let betPayload;
    if (selectedColor) {
      betPayload = {
        betType: "color",
        betValue: selectedColor,
        amount: betAmount
      };
    } else if (selectedNumber !== null) {
      betPayload = {
        betType: "number",
        betValue: selectedNumber.toString(),
        amount: betAmount
      };
    } else if (selectedSize) {
      betPayload = {
        betType: "bigSmall",
        betValue: selectedSize,
        amount: betAmount
      };
    } else {
      return; // Should not reach here due to validation above
    }
    
    try {
      const response = await apiRequest("POST", "/api/bet", betPayload);
      if (response.ok) {
        // The WebSocket will handle success notification and state updates
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Deposit funds
  const deposit = async (amount: number) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive amount",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingWallet(true);
    try {
      const response = await apiRequest("POST", "/api/user/deposit", { amount });
      if (response.ok) {
        toast({
          title: "Deposit Successful",
          description: `Added ₹${amount} to your wallet`
        });
        // Balance will be updated via WebSocket
      }
    } catch (error) {
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoadingWallet(false);
    }
  };
  
  // Withdraw funds
  const withdraw = async (amount: number) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive amount",
        variant: "destructive"
      });
      return;
    }
    
    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to withdraw",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingWallet(true);
    try {
      const response = await apiRequest("POST", "/api/user/withdraw", { amount });
      if (response.ok) {
        toast({
          title: "Withdrawal Successful",
          description: `Withdrawn ₹${amount} from your wallet`
        });
        // Balance will be updated via WebSocket
      }
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoadingWallet(false);
    }
  };
  
  // Helper for color classes
  const getColorClass = (color: string): string => {
    switch (color.toLowerCase()) {
      case 'green':
        return 'bg-emerald-500';
      case 'violet':
        return 'bg-purple-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Helper for number color classes
  const getNumberColorClass = (number: number): string => {
    const color = NUMBER_COLOR_MAP[number];
    return getColorClass(color);
  };
  
  const contextValue: GameContextType = {
    gameState,
    isConnected,
    wallet: {
      balance,
      isLoading: isLoadingWallet
    },
    selectedColor,
    selectedNumber,
    selectedSize,
    betAmount,
    setSelectedColor,
    setSelectedNumber,
    setSelectedSize,
    setBetAmount,
    placeBet,
    deposit,
    withdraw,
    gameHistory,
    userBets,
    chartData,
    getColorClass,
    getNumberColorClass
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
