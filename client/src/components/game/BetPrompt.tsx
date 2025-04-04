import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from "@/context/GameContext";
import { formatCurrency } from "@/lib/gameUtils";

interface BetPromptProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  betType: string;
  betValue: string;
  betLabel: string;
}

export default function BetPrompt({ open, setOpen, betType, betValue, betLabel }: BetPromptProps) {
  const { setBetAmount, placeBet, wallet } = useGame();
  const [amount, setAmount] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);

  const predefinedAmounts = [100, 500, 1000, 5000];
  const multipliers = [1, 2, 5, 10, 50, 100];

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
  };

  const handleMultiplierSelect = (selectedMultiplier: number) => {
    setMultiplier(selectedMultiplier);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setAmount(value);
    } else {
      setAmount(0);
    }
  };

  const totalBetAmount = amount * multiplier;

  const handlePlaceBet = async () => {
    if (totalBetAmount <= 0) return;
    
    setBetAmount(totalBetAmount);
    try {
      await placeBet();
      setOpen(false);
    } catch (error) {
      console.error("Failed to place bet:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Bet on {betLabel}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Choose Amount</h3>
            <div className="flex flex-wrap gap-2">
              {predefinedAmounts.map((presetAmount) => (
                <Button
                  key={presetAmount}
                  variant={amount === presetAmount ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAmountSelect(presetAmount)}
                >
                  {formatCurrency(presetAmount)}
                </Button>
              ))}
              <Input
                type="number"
                placeholder="Custom"
                value={amount === 0 ? "" : amount}
                onChange={handleCustomAmountChange}
                className="h-9 w-24"
              />
            </div>
          </div>
          
          <div>
            <h3 className="mb-2 text-sm font-medium">Choose Multiplier</h3>
            <div className="flex flex-wrap gap-2">
              {multipliers.map((m) => (
                <Button
                  key={m}
                  variant={multiplier === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMultiplierSelect(m)}
                >
                  {m}x
                </Button>
              ))}
            </div>
          </div>
          
          <div className="rounded-lg bg-muted p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Bet Amount:</span>
              <span className="font-bold text-lg">{formatCurrency(totalBetAmount)}</span>
            </div>
            {totalBetAmount > wallet.balance && (
              <p className="text-destructive text-sm mt-1">
                Insufficient balance
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePlaceBet}
            disabled={totalBetAmount <= 0 || totalBetAmount > wallet.balance}
          >
            Place Bet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}