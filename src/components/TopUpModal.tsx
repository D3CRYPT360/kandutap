import { useRouter } from "next/navigation";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

export const TopUpModal = ({ isOpen, onClose, onTopUp }: TopUpModalProps) => {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-3xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Quick-Top Up</h2>

        <div className="space-y-4">
          {[100, 200, 500, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => {
                onTopUp(amount);
                onClose();
              }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium
              transition-colors"
            >
              {amount} MVR
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-blue-200 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
