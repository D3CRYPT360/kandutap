// Define the props interface directly
interface FlowControlsProps {
  isFlowing: boolean;
  onStart: () => void;
  onStartPumping: () => void;
  onStop: () => void;
  literLimit: number;
  onLiterLimitChange: (limit: number) => void;
  isCardAuthenticated: boolean;
}

export const FlowControls = ({
  isFlowing,
  onStart,
  onStartPumping,
  onStop,
  literLimit,
  onLiterLimitChange,
  isCardAuthenticated,
}: FlowControlsProps) => {
  return (
    <div className="space-y-6">
      {isCardAuthenticated && !isFlowing && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full">
            <label htmlFor="literLimit" className="block text-blue-100 text-sm font-medium mb-2">
              Set Water Limit (Liters)
            </label>
            <input
              id="literLimit"
              type="number"
              value={literLimit}
              onChange={(e) => onLiterLimitChange(Number(e.target.value))}
              className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white placeholder-blue-200"
              placeholder="Optional"
              min="0"
              step="0.1"
            />
          </div>
          
          <button
            onClick={onStartPumping}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-white font-bold
            transition-colors text-lg"
          >
            Start Pumping
          </button>
        </div>
      )}
      
      {!isCardAuthenticated && !isFlowing && (
        <button
          onClick={onStart}
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-white font-bold
          transition-colors text-lg"
        >
          Tap to Start
        </button>
      )}

      {isFlowing && (
        <button
          onClick={onStop}
          className="w-full py-4 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold
          transition-colors text-lg"
        >
          Stop
        </button>
      )}
    </div>
  );
};
