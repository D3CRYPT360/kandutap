'use client';

import { useRouter } from 'next/navigation';

// Define the props interface directly
interface CardAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardId: string) => void;
}

export const CardAuthModal = ({ isOpen, onClose, onSubmit }: CardAuthModalProps) => {
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const cardId = (form.elements.namedItem('cardId') as HTMLInputElement).value;
    onSubmit(cardId);
    form.reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-3xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Scan Your Card</h2>
        <p className="text-blue-200 mb-4">Please enter your card ID number to continue</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="cardId"
            placeholder="Enter Card ID"
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl 
            text-white placeholder-blue-200 focus:outline-none focus:ring-2 
            focus:ring-cyan-400"
            required
            autoFocus
          />
          
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-cyan-300 
              hover:from-blue-500 hover:to-cyan-400 rounded-xl text-white font-medium
              transition-colors"
            >
              Submit
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-blue-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
