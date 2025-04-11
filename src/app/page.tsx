'use client';

import { useState, useEffect } from 'react';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { FlowControls } from '@/components/FlowControls';
import { FlowMeter } from '@/components/FlowMeter';
import { CardAuthModal } from '@/components/CardAuthModal';
import { PumpHistory } from '@/components/PumpHistory';
import Link from 'next/link';

export default function Home() {
  const [balance, setBalance] = useState<number | null>(null);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [isFlowing, setIsFlowing] = useState(false);
  const [flowRate, setFlowRate] = useState(0);
  const [totalLiters, setTotalLiters] = useState(0);
  const [literLimit, setLiterLimit] = useState(0);
  const [isCardAuthModalOpen, setIsCardAuthModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCardAuthenticated, setIsCardAuthenticated] = useState(false);
  const [pendingBalance, setPendingBalance] = useState<number | null>(null);
  const [lastPumpCost, setLastPumpCost] = useState(0);
  const [isSavingPump, setIsSavingPump] = useState(false);

  // Simulate water flow
  useEffect(() => {
    if (!isFlowing) return;

    const flowInterval = setInterval(() => {
      const rate = 2 + Math.random() * 0.5; // Random flow rate between 2-2.5 L/min
      setFlowRate(rate);

      setTotalLiters(prev => {
        const newTotal = Math.round((prev + (rate / 60)) * 100) / 100; // Round to 2 decimal places
        if (literLimit > 0 && newTotal >= literLimit) {
          setIsFlowing(false);
          if (balance !== null) {
            const cost = literLimit * 5; // 5 MVR per liter
            setPendingBalance(balance - cost);
            setLastPumpCost(cost);
            savePumpHistory(literLimit, cost);
          }
          return literLimit;
        }
        if (balance !== null) {
          const cost = newTotal * 5; // 5 MVR per liter
          setPendingBalance(balance - cost);
          setLastPumpCost(cost);
        }
        return newTotal;
      });
      
      // Stop flow if balance is depleted
      if (pendingBalance !== null && pendingBalance <= 0) {
        setIsFlowing(false);
        savePumpHistory(totalLiters, lastPumpCost);
      }
    }, 1000);

    return () => clearInterval(flowInterval);
  }, [isFlowing, balance, pendingBalance, literLimit, totalLiters, lastPumpCost]);

  const savePumpHistory = async (liters: number, cost: number) => {
    if (isSavingPump || !currentCardId || liters === 0) return;
    
    setIsSavingPump(true);
    try {
      const response = await fetch('/api/pump-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: currentCardId,
          liters,
          cost
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save pump history');
      }

      // Update card balance
      if (balance !== null && pendingBalance !== null) {
        const balanceResponse = await fetch('/api/cards', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: currentCardId,
            balance: pendingBalance,
          }),
        });

        if (!balanceResponse.ok) {
          throw new Error('Failed to update balance');
        }

        setBalance(pendingBalance);
      }
    } catch (error) {
      console.error('Error saving pump history:', error);
      setError('Failed to save pump record');
    } finally {
      setIsSavingPump(false);
    }
  };

  const handleCardAuth = async (cardId: string) => {
    try {
      const response = await fetch(`/api/cards?id=${cardId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentCardId(cardId);
        setBalance(data.balance);
        setPendingBalance(data.balance);
        setIsCardAuthenticated(true);
        setIsCardAuthModalOpen(false);
        setError(null);
      } else {
        throw new Error('Invalid card');
      }
    } catch (error) {
      console.error('Error authenticating card:', error);
      setError('Invalid card ID. Please try again.');
    }
  };

  const handleStart = () => {
    setIsCardAuthModalOpen(true);
  };

  const handleStartPumping = () => {
    setTotalLiters(0);
    setLastPumpCost(0);
    setPendingBalance(balance);
    setIsFlowing(true);
    setIsSavingPump(false);
  };

  const handleStop = async () => {
    setIsFlowing(false);
    await savePumpHistory(totalLiters, lastPumpCost);
    setTotalLiters(0);
    setFlowRate(0);
    setPendingBalance(balance);
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-800">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Kandutap</h1>
          <div className="flex gap-4">
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Admin Panel
            </Link>
            <Link 
              href="/topup" 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
            >
              Top Up
            </Link>
          </div>
        </div>

        {error && (
          <div className="w-full max-w-md bg-red-500/20 text-red-100 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        
        <div className="w-full max-w-md space-y-8">
          {balance !== null && (
            <BalanceDisplay balance={balance} />
          )}

          <FlowMeter 
            isFlowing={isFlowing}
            flowRate={flowRate} 
            totalLiters={totalLiters}
            cost={lastPumpCost}
          />
          <FlowControls 
            isFlowing={isFlowing}
            onStart={handleStart}
            onStop={handleStop}
            isCardAuthenticated={isCardAuthenticated}
            onStartPumping={handleStartPumping}
            literLimit={literLimit}
            onLiterLimitChange={setLiterLimit}
          />

          {error && (
            <div className="p-3 text-red-800 bg-red-100 rounded">
              {error}
            </div>
          )}

          {isCardAuthenticated && <PumpHistory cardId={currentCardId} />}

          <CardAuthModal 
            isOpen={isCardAuthModalOpen}
            onClose={() => setIsCardAuthModalOpen(false)}
            onSubmit={handleCardAuth}
          />
        </div>
      </div>
    </main>
  );
}
