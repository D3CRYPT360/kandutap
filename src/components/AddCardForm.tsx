import { useState } from 'react';

// Define the props interface directly
interface AddCardFormProps {
  onAdd: (cardId: string, initialBalance: number) => void;
  loading: boolean;
  error: string | null;
}

export function AddCardForm({ onAdd, loading, error }: AddCardFormProps) {
  const [cardId, setCardId] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId || !initialBalance) return;
    onAdd(cardId, parseFloat(initialBalance));
    setCardId('');
    setInitialBalance('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-blue-100 mb-1">Card ID</label>
        <input
          type="text"
          value={cardId}
          onChange={e => setCardId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/10 text-white focus:outline-none"
          required
        />
      </div>
      <div>
        <label className="block text-blue-100 mb-1">Initial Balance (MVR)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={initialBalance}
          onChange={e => setInitialBalance(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/10 text-white focus:outline-none"
          required
        />
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-bold transition-colors"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Card'}
      </button>
    </form>
  );
}
