import { ReactNode } from "react";

interface HeaderProps {
  balance: number;
  depositTrigger: ReactNode;
  withdrawTrigger: ReactNode;
}

export default function Header({ balance, depositTrigger, withdrawTrigger }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-purple-800 to-purple-600 px-4 py-2 flex justify-between items-center shadow-lg">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">V3.Game</h1>
      </div>
      <div className="flex items-center space-x-3">
        <div className="bg-white bg-opacity-10 px-3 py-1 rounded-full flex items-center">
          <span className="font-medium">₹{balance.toFixed(2)}</span>
        </div>
        {depositTrigger}
        <div className="hidden sm:block">
          {withdrawTrigger}
        </div>
      </div>
    </header>
  );
}
