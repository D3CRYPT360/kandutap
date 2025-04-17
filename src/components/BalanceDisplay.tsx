interface BalanceDisplayProps {
  balance: number;
}

export const BalanceDisplay = ({ balance }: BalanceDisplayProps) => {
  // Calculate approximate liters (assuming 5 MVR per liter)
  const ratePerLiter = 5; // MVR per liter
  const approximateLiters = balance / ratePerLiter;
  
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
      <h2 className="text-sm text-blue-100 mb-1">Remaining Balance</h2>
      <div className="text-4xl font-bold text-white">
        {balance.toFixed(2)} MVR
      </div>
      <div className="mt-2 text-sm text-blue-200">
        <span className="flex items-center">
          <span className="mr-1">≈</span>
          <span className="font-medium">{approximateLiters.toFixed(2)} L</span>
          <span className="ml-1 opacity-75">remaining</span>
        </span>
      </div>
    </div>
  );
};
