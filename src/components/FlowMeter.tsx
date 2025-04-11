interface FlowMeterProps {
  isFlowing: boolean;
  flowRate: number;
  totalLiters: number;
  cost: number;
}

export function FlowMeter({ isFlowing, flowRate, totalLiters, cost }: FlowMeterProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-blue-100">Flow Rate</div>
          <div className="text-2xl font-bold text-white">
            {flowRate.toFixed(2)} L/min
          </div>
        </div>
        <div>
          <div className="text-sm text-blue-100">Total Volume</div>
          <div className="text-2xl font-bold text-white">
            {totalLiters.toFixed(2)} L
          </div>
        </div>
        <div>
          <div className="text-sm text-blue-100">Cost (5 MVR/L)</div>
          <div className="text-2xl font-bold text-cyan-400">
            {cost.toFixed(2)} MVR
          </div>
        </div>
        <div>
          <div className="text-sm text-blue-100">Status</div>
          <div className={`text-2xl font-bold ${isFlowing ? 'text-green-400' : 'text-blue-200'}`}>
            {isFlowing ? 'Pumping' : 'Stopped'}
          </div>
        </div>
      </div>
    </div>
  );
}
