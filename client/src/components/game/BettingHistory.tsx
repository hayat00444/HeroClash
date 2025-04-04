import { useGame } from "@/context/GameContext";
import { formatCurrency } from "@/lib/gameUtils";

export default function BettingHistory() {
  const { userBets } = useGame();
  
  // If there are no bets, show empty state
  if (userBets.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <div className="mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-sm">No betting history yet</p>
        <button className="mt-3 px-4 py-1 bg-purple-700 rounded-full text-sm">
          Place a bet
        </button>
      </div>
    );
  }
  
  // Otherwise, show the betting history
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-xs">
            <th className="text-left pb-2">Period</th>
            <th className="text-center pb-2">Bet</th>
            <th className="text-center pb-2">Amount</th>
            <th className="text-right pb-2">Result</th>
          </tr>
        </thead>
        <tbody>
          {userBets.map((bet) => (
            <tr key={bet.id} className="border-b border-white border-opacity-5">
              <td className="py-2 font-mono text-xs">{bet.period}</td>
              <td className="py-2 text-center capitalize">
                {bet.betType === "number" ? `Number ${bet.betValue}` : 
                 bet.betType === "color" ? `${bet.betValue}` : 
                 `${bet.betValue}`}
              </td>
              <td className="py-2 text-center">{formatCurrency(bet.amount)}</td>
              <td className="py-2 text-right">
                {bet.isWin === null ? (
                  <span className="text-yellow-400">Pending</span>
                ) : bet.isWin ? (
                  <span className="text-green-500">+{formatCurrency(bet.payout || 0)}</span>
                ) : (
                  <span className="text-red-500">Lost</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
