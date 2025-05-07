'use client';

import { useState } from 'react';
import { CardAuthModal } from '@/components/CardAuthModal';
import { TopUpModal } from '@/components/TopUpModal';
import { topUpApi } from '@/lib/api';

// Define interfaces directly
interface TopUp {
  id: number;
  amount: number;
  created_at: string;
}

interface Card {
  id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export default function TopUpDashboard() {
  const [isCardAuthModalOpen, setIsCardAuthModalOpen] = useState(true);
  const [card, setCard] = useState<Card | null>(null);
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  const handleCardAuth = async (cardId: string) => {
    try {
      // Use the API service to get top-ups
      const data = await topUpApi.getTopUps(cardId);
      setCard(data.card);
      setTopUps(data.topUps);
      setIsCardAuthModalOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid card ID');
    }
  };

  const handleTopUp = async () => {
    if (!card || !amount) return;

    try {
      // Use the API service to create a top-up
      await topUpApi.createTopUp(card.id, Number(amount));

      // Refresh top-up history
      const data = await topUpApi.getTopUps(card.id);
      setCard(data.card);
      setTopUps(data.topUps);
      setAmount('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process top-up');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-800">
      <main className="container mx-auto px-4 py-8 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-white mb-4">Kandutap Top-Up Dashboard</h1>

        {error && (
          <div className="w-full max-w-md bg-red-500/20 text-red-100 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {card && (
          <div className="w-full max-w-2xl space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Card Information</h2>
              <div className="grid grid-cols-2 gap-4 text-blue-100">
                <div>
                  <p className="text-sm opacity-75">Card ID</p>
                  <p className="font-medium">{card.id}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Current Balance</p>
                  <p className="font-medium">{card.balance.toFixed(2)} MVR</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Add Top-Up</h2>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in MVR"
                  className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white placeholder-blue-200"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleTopUp}
                  disabled={!amount}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 
                  disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  Top Up
                </button>
                <button
                  onClick={() => setIsTopUpModalOpen(true)}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
                >
                  Quick Top-Up
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Top-Up History</h2>
              <div className="space-y-2">
                {topUps.length === 0 ? (
                  <p className="text-blue-100">No top-up history available</p>
                ) : (
                  topUps.map((topUp) => (
                    <div
                      key={topUp.id}
                      className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                    >
                      <div className="text-blue-100">
                        <p className="font-medium">{topUp.amount.toFixed(2)} MVR</p>
                        <p className="text-sm opacity-75">
                          {new Date(topUp.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <CardAuthModal
        isOpen={isCardAuthModalOpen}
        onClose={() => card && setIsCardAuthModalOpen(false)}
        onSubmit={handleCardAuth}
      />
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onTopUp={(amount) => {
          setAmount(String(amount));
          setIsTopUpModalOpen(false);
          setTimeout(() => handleTopUp(), 0);
        }}
      />
    </div>
  );
}
