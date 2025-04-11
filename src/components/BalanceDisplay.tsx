interface BalanceDisplayProps {
  balance: number;
}

export const BalanceDisplay = ({ balance }: BalanceDisplayProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
      <h2 className="text-sm text-blue-100 mb-1">Remaining Balance</h2>
      <div className="text-4xl font-bold text-white">
        {balance.toFixed(2)} MVR
      </div>
    </div>
  );
};
