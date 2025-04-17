'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Link from 'next/link';
import { AddCardForm } from '@/components/AddCardForm';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

import type { AdminStats } from '@/types';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'addCard'>('dashboard');
  const [addCardLoading, setAddCardLoading] = useState(false);
  const [addCardError, setAddCardError] = useState<string | null>(null);
  const [addCardSuccess, setAddCardSuccess] = useState<string | null>(null);

  const handleAddCard = async (cardId: string, initialBalance: number) => {
    setAddCardLoading(true);
    setAddCardError(null);
    setAddCardSuccess(null);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, initialBalance })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add card');
      setAddCardSuccess('Card added successfully!');
    } catch (err: any) {
      setAddCardError(err.message || 'Failed to add card');
    } finally {
      setAddCardLoading(false);
    }
  };
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Tab Navigation
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-800 p-8">
      <div className="flex space-x-4 mb-8">
        <button
          className={`px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'dashboard' ? 'bg-cyan-600 text-white' : 'bg-white/10 text-blue-100 hover:bg-white/20'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'addCard' ? 'bg-cyan-600 text-white' : 'bg-white/10 text-blue-100 hover:bg-white/20'}`}
          onClick={() => setActiveTab('addCard')}
        >
          Add Card
        </button>
      </div>

      {activeTab === 'dashboard' && (
        loading ? (
          <div className="text-white text-center">Loading statistics...</div>
        ) : error || !stats ? (
          <div className="text-red-300">{error || 'Failed to load statistics'}</div>
        ) : (() => {
          // Chart and table data definitions scoped here
          const chartOptions = {
            responsive: true,
            plugins: {
              legend: {
                labels: {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              },
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              },
              y: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              },
            },
          };

          const revenueData = {
            labels: stats.dailyStats.map(day => new Date(day.date).toLocaleDateString()),
            datasets: [
              {
                label: 'Daily Revenue (MVR)',
                data: stats.dailyStats.map(day => day.revenue),
                borderColor: 'rgb(56, 189, 248)',
                backgroundColor: 'rgba(56, 189, 248, 0.5)',
                tension: 0.4,
              },
            ],
          };

          const volumeData = {
            labels: stats.dailyStats.map(day => new Date(day.date).toLocaleDateString()),
            datasets: [
              {
                label: 'Daily Volume (L)',
                data: stats.dailyStats.map(day => day.liters),
                borderColor: 'rgb(52, 211, 153)',
                backgroundColor: 'rgba(52, 211, 153, 0.5)',
                tension: 0.4,
              },
            ],
          };

          const hourlyData = {
            labels: stats.hourlyDistribution.map(h => `${h.hour}:00`),
            datasets: [
              {
                label: 'Pumps by Hour',
                data: stats.hourlyDistribution.map(h => h.count),
                backgroundColor: 'rgba(251, 146, 60, 0.7)',
              },
            ],
          };

          const topCardsData = {
            labels: stats.topCards.map(card => `Card ${card.card_id}`),
            datasets: [
              {
                label: 'Usage Distribution',
                data: stats.topCards.map(card => card.totalLiters),
                backgroundColor: [
                  'rgba(56, 189, 248, 0.7)',
                  'rgba(52, 211, 153, 0.7)',
                  'rgba(251, 146, 60, 0.7)',
                  'rgba(236, 72, 153, 0.7)',
                  'rgba(34, 197, 94, 0.7)',
                ],
              },
            ],
          };

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-100">Total Revenue 💰</h3>
                  <p className="text-3xl font-bold text-cyan-400">
                    {stats.totals.totalRevenue.toFixed(2)} MVR
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-100">Total Volume 💧</h3>
                  <p className="text-3xl font-bold text-emerald-400">
                    {stats.totals.totalLiters.toFixed(2)} L
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-100">Total Pumps ⛽</h3>
                  <p className="text-3xl font-bold text-orange-400">
                    {stats.totals.totalPumps}
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend 📈</h3>
                  <Line data={revenueData} options={chartOptions} />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Volume Trend 📊</h3>
                  <Line data={volumeData} options={chartOptions} />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Hourly Distribution 🕰️</h3>
                  <Bar data={hourlyData} options={chartOptions} />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Users 🌟</h3>
                  <Doughnut data={topCardsData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'right' as const,
                      },
                    },
                  }} />
                </div>
              </div>

              {/* Top Cards Table */}
              <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
                <h3 className="text-lg font-semibold text-white p-6 border-b border-white/10">
                  Top 5 Cards by Volume 💸
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                          Card ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                          Total Volume
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                          Total Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                          Total Pumps
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {stats.topCards.map((card) => (
                        <tr key={card.card_id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {card.card_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400">
                            {card.totalLiters.toFixed(2)} L
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">
                            {card.totalSpent.toFixed(2)} MVR
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-400">
                            {card.totalPumps}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          );
        })()
      )}

      {activeTab === 'addCard' && (
        <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Add New Card</h2>
          <AddCardForm onAdd={handleAddCard} loading={addCardLoading} error={addCardError} />
          {addCardSuccess && <div className="mt-4 text-green-400">{addCardSuccess}</div>}
        </div>
      )}
    </div>
  );
}
 