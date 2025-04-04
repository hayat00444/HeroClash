import { useState } from "react";
import Header from "@/components/game/Header";
import GameModeTabs from "@/components/game/GameModeTabs";
import CountdownTimer from "@/components/game/CountdownTimer";
import ColorSelection from "@/components/game/ColorSelection";
import NumberSelection from "@/components/game/NumberSelection";
import BigSmallSelection from "@/components/game/BigSmallSelection";
import BettingControls from "@/components/game/BettingControls";
import GameHistory from "@/components/game/GameHistory";
import { useGame } from "@/context/GameContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Game() {
  const { gameState, wallet, deposit, withdraw } = useGame();
  const [depositAmount, setDepositAmount] = useState(100);
  const [withdrawAmount, setWithdrawAmount] = useState(10);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header with wallet and deposit/withdraw options */}
      <Header 
        balance={wallet.balance}
        depositTrigger={
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white text-purple-700 hover:bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                Deposit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Deposit Funds</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="deposit-amount">Amount</label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    min={10}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={() => deposit(depositAmount)}
                  disabled={wallet.isLoading}
                >
                  {wallet.isLoading ? "Processing..." : "Deposit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
        withdrawTrigger={
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="withdraw-amount">Amount</label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    min={10}
                    max={wallet.balance}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={() => withdraw(withdrawAmount)}
                  disabled={wallet.isLoading || withdrawAmount > wallet.balance}
                >
                  {wallet.isLoading ? "Processing..." : "Withdraw"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      
      {/* Game mode tabs */}
      <GameModeTabs />
      
      {/* Game container */}
      <div className="flex-1 p-4 flex flex-col space-y-4">
        {/* Game info and countdown */}
        <div className="flex justify-between items-center">
          <div className="bg-white bg-opacity-5 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-400">Period</span>
            <div className="font-medium">{gameState?.currentPeriod || "Loading..."}</div>
          </div>
          
          <CountdownTimer 
            timeRemaining={gameState?.timeRemaining || 0} 
            totalTime={60}
          />
        </div>
        
        {/* Color selection */}
        <ColorSelection />
        
        {/* Number selection */}
        <NumberSelection />
        
        {/* Big/Small selection */}
        <BigSmallSelection />
        
        {/* Betting controls */}
        <BettingControls />
      </div>
      
      {/* Game history tabs and content */}
      <GameHistory />
    </div>
  );
}
