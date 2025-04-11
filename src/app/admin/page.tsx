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

interface AdminStats {
  totals: {
    totalRevenue: number;
    totalLiters: number;
    totalPumps: number;
  };
  dailyStats: Array<{
    date: string;
    revenue: number;
    liters: number;
    pumps: number;
  }>;
  topCards: Array<{
    card_id: string;
    totalLiters: number;
    totalSpent: number;
    totalPumps: number;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    count: number;
  }>;
}

export default function AdminDashboard() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-800 p-8">
        <div className="text-white text-center">Loading statistics...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-800 p-8">
        <div className="text-red-300">{error || 'Failed to load statistics'}</div>
      </div>
    );
  }

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
          'rgba(167, 139, 250, 0.7)',
          'rgba(236, 72, 153, 0.7)',
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-800">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Link 
            href="/" 
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Back to Water Station
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-100">Total Revenue</h3>
            <p className="text-3xl font-bold text-cyan-400">
              {stats.totals.totalRevenue.toFixed(2)} MVR
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-100">Total Volume</h3>
            <p className="text-3xl font-bold text-emerald-400">
              {stats.totals.totalLiters.toFixed(2)} L
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-100">Total Pumps</h3>
            <p className="text-3xl font-bold text-orange-400">
              {stats.totals.totalPumps}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
            <Line data={revenueData} options={chartOptions} />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Volume Trend</h3>
            <Line data={volumeData} options={chartOptions} />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Hourly Distribution</h3>
            <Bar data={hourlyData} options={chartOptions} />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Users</h3>
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
            Top 5 Cards by Volume
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
      </div>
    </div>
  );
}
