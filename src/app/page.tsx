'use client';

import { useState, useEffect } from 'react';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { FlowControls } from '@/components/FlowControls';
import { FlowMeter } from '@/components/FlowMeter';
import { CardAuthModal } from '@/components/CardAuthModal';
import { PumpHistory } from '@/components/PumpHistory';
import Link from 'next/link';
import { cardApi, pumpHistoryApi } from '@/lib/api';

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
      // Save pump history using the API service
      await pumpHistoryApi.savePumpHistory(currentCardId, liters, cost);

      // Update card balance
      if (balance !== null && pendingBalance !== null) {
        try {
          console.log('Sending balance update to API:', { id: currentCardId, balance: pendingBalance });
          
          // Update balance using the API service
          const balanceResult = await cardApi.updateBalance(currentCardId, pendingBalance);
          console.log('Balance update response:', balanceResult);
          
          setBalance(pendingBalance);
          console.log('Balance updated successfully to:', pendingBalance);
        } catch (balanceError) {
          console.error('Balance update error:', balanceError);
          setError('Failed to update balance. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error saving pump history:', error);
      setError('Failed to save pump history. Please try again.');
    } finally {
      setIsSavingPump(false);
    }
  };

  const handleCardAuth = async (cardId: string) => {
    setError(null);
    try {
      // Get card balance using the API service
      const data = await cardApi.getBalance(cardId);
      
      setCurrentCardId(cardId);
      setBalance(data.balance);
      setPendingBalance(data.balance);
      setIsCardAuthenticated(true);
      setIsCardAuthModalOpen(false);
    } catch (error) {
      console.error('Card authentication error:', error);
      setError('Failed to authenticate card. Please try again.');
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
    // Make sure we save the current pendingBalance before resetting it
    const finalCost = lastPumpCost;
    const finalLiters = totalLiters;
    const finalPendingBalance = pendingBalance;
    
    // Reset UI values
    setTotalLiters(0);
    setFlowRate(0);
    
    // Save pump history with the correct balance
    if (finalLiters > 0 && finalCost > 0) {
      // Only update balance in DB if we actually pumped something
      await savePumpHistory(finalLiters, finalCost);
      // Update local balance state after DB update is complete
      if (finalPendingBalance !== null) {
        setBalance(finalPendingBalance);
      }
      
      // Set a timer to redirect to home page after 5 seconds
      const redirectTimer = setTimeout(() => {
        // Reset card authentication state
        setCurrentCardId(null);
        setIsCardAuthenticated(false);
        setBalance(null);
        setPendingBalance(null);
        // Show the card auth modal again
        setIsCardAuthModalOpen(true);
        
        console.log('Session completed - returning to card authentication');
      }, 5000);
      
      // Display a message about the redirect
      setError('✅ Pumping completed. Returning to card authentication in 5 seconds...');
      
      // Clean up timer if component unmounts
      return () => clearTimeout(redirectTimer);
    }
    
    // Reset pending balance to match current balance
    setPendingBalance(balance);
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-800">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Kandutap 🚿</h1>
          <div className="flex gap-4">
            <Link 
              href="/topup" 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
            >
              Top Up
            </Link>
          </div>
        </div>

        {error && error.startsWith('✅') ? (
          <div className="w-full max-w-md bg-green-500/20 text-green-100 px-4 py-3 rounded-xl">
            {error}
          </div>
        ) : error ? (
          <div className="w-full max-w-md bg-red-500/20 text-red-100 px-4 py-3 rounded-xl">
            {error}
          </div>
        ) : null}
        
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

          {/* Removed duplicate error display */}

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
