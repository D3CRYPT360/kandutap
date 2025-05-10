'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/api';
import type { AdminStats } from '@/types';

interface CardManagementTableProps {
  stats: AdminStats | null;
}

type Card = {
  id: string;
  balance: number;
  status: string;
  top_up_count: number;
  pump_count: number;
  created_at: string;
};

export function CardManagementTable({ stats }: CardManagementTableProps) {
  const [cards, setCards] = useState<Card[]>(stats?.cards || []);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggleStatus = async (cardId: string, currentStatus: string) => {
    // Set loading state for this specific card
    setLoading(prev => ({ ...prev, [cardId]: true }));
    setError(null);
    setSuccess(null);
    
    try {
      // Toggle the status
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      
      // Call the API to update the card status
      await adminApi.updateCardStatus(cardId, newStatus as 'active' | 'disabled');
      
      // Update the local state to reflect the change
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === cardId ? { ...card, status: newStatus } : card
        )
      );
      
      setSuccess(`Card ${cardId} has been ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update card status:', err);
      setError(err.message || 'Failed to update card status');
    } finally {
      // Clear loading state for this card
      setLoading(prev => ({ ...prev, [cardId]: false }));
      
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  if (!stats || !cards.length) {
    return <div className="p-6 text-white">No cards found.</div>;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 m-6 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 m-6 rounded-lg">
          {success}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Card ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Top-ups
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Pumps
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-white/5">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {card.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">
                  {card.balance.toFixed(2)} MVR
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    card.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {card.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {card.top_up_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {card.pump_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {new Date(card.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name={`toggle-${card.id}`}
                      id={`toggle-${card.id}`}
                      className="sr-only"
                      checked={card.status === 'active'}
                      onChange={() => handleToggleStatus(card.id, card.status)}
                      disabled={loading[card.id]}
                    />
                    <label
                      htmlFor={`toggle-${card.id}`}
                      className={`block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer ${
                        loading[card.id] ? 'opacity-50' : ''
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full transform transition-transform duration-200 ease-in ${
                          card.status === 'active'
                            ? 'translate-x-6 bg-green-500'
                            : 'translate-x-0 bg-red-500'
                        } ${loading[card.id] ? 'animate-pulse' : ''}`}
                      ></span>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
