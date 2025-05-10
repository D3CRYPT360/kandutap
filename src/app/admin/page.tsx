"use client";

import { useEffect, useState } from "react";
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
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import Link from "next/link";
import { AddCardForm } from "@/components/AddCardForm";
import { AdminAuthWrapper } from "@/components/AdminAuthWrapper";
import { CardManagementTable } from "@/components/CardManagementTable";
import { cardApi, adminApi } from "@/lib/api";
import type { AdminStats } from "@/types";

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

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "addCard" | "cards">(
    "dashboard"
  );
  const [addCardLoading, setAddCardLoading] = useState(false);
  const [addCardError, setAddCardError] = useState<string | null>(null);
  const [addCardSuccess, setAddCardSuccess] = useState<string | null>(null);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    window.location.href = "/";
  };

  const handleAddCard = async (cardId: string, initialBalance: number) => {
    setAddCardLoading(true);
    setAddCardError(null);
    setAddCardSuccess(null);
    try {
      // Use the API service to create a new card
      await cardApi.createCard(cardId, initialBalance);
      setAddCardSuccess("Card added successfully!");
    } catch (err: any) {
      setAddCardError(err.message || "Failed to add card");
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
        // Use the API service to get admin cards
        const data = await adminApi.getCards();

        // Create default structure if properties are missing
        const processedData: AdminStats = {
          totals: data.totals || {
            totalRevenue: 0,
            totalLiters: 0,
            totalPumps: 0,
          },
          dailyStats: data.dailyStats || [],
          topCards: data.topCards || [],
          hourlyDistribution: data.hourlyDistribution || [],
          cards: data.cards || [],
        };

        setStats(processedData);
      } catch (err) {
        setError("Failed to load statistics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-800 p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          <button
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "dashboard"
                ? "bg-cyan-600 text-white"
                : "bg-white/10 text-blue-100 hover:bg-white/20"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "cards"
                ? "bg-cyan-600 text-white"
                : "bg-white/10 text-blue-100 hover:bg-white/20"
            }`}
            onClick={() => setActiveTab("cards")}
          >
            Manage Cards
          </button>
          <button
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "addCard"
                ? "bg-cyan-600 text-white"
                : "bg-white/10 text-blue-100 hover:bg-white/20"
            }`}
            onClick={() => setActiveTab("addCard")}
          >
            Add Card
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
        >
          Logout
        </button>
      </div>

      {activeTab === "dashboard" &&
        (loading ? (
          <div className="text-white text-center">Loading statistics...</div>
        ) : error || !stats ? (
          <div className="text-red-300">
            {error || "Failed to load statistics"}
          </div>
        ) : (
          (() => {
            // Chart and table data definitions scoped here
            const chartOptions = {
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                },
                y: {
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                },
              },
            };

            // Ensure dailyStats exists and has items
            const dailyStats = stats.dailyStats || [];

            const revenueData = {
              labels: dailyStats.map((day: { date: string }) =>
                new Date(day.date).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Daily Revenue (MVR)",
                  data: dailyStats.map(
                    (day: { revenue: number }) => day.revenue || 0
                  ),
                  borderColor: "rgb(56, 189, 248)",
                  backgroundColor: "rgba(56, 189, 248, 0.5)",
                  tension: 0.4,
                },
              ],
            };

            const volumeData = {
              labels: dailyStats.map((day: { date: string }) =>
                new Date(day.date).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Daily Volume (L)",
                  data: dailyStats.map(
                    (day: { liters: number }) => day.liters || 0
                  ),
                  borderColor: "rgb(52, 211, 153)",
                  backgroundColor: "rgba(52, 211, 153, 0.5)",
                  tension: 0.4,
                },
              ],
            };

            // Ensure hourlyDistribution exists and has items
            const hourlyDistribution = stats.hourlyDistribution || [];

            const hourlyData = {
              labels: hourlyDistribution.map(
                (h: { hour: string }) => `${h.hour}:00`
              ),
              datasets: [
                {
                  label: "Pumps by Hour",
                  data: hourlyDistribution.map(
                    (h: { count: number }) => h.count || 0
                  ),
                  backgroundColor: "rgba(251, 146, 60, 0.7)",
                },
              ],
            };

            // Ensure topCards exists and has items
            const topCards = stats.topCards || [];

            const topCardsData = {
              labels: topCards.map(
                (card: { card_id: string }) =>
                  `Card ${card.card_id || "Unknown"}`
              ),
              datasets: [
                {
                  label: "Usage Distribution",
                  data: topCards.map(
                    (card: { totalLiters: number }) => card.totalLiters || 0
                  ),
                  backgroundColor: [
                    "rgba(56, 189, 248, 0.7)",
                    "rgba(52, 211, 153, 0.7)",
                    "rgba(251, 146, 60, 0.7)",
                    "rgba(236, 72, 153, 0.7)",
                    "rgba(34, 197, 94, 0.7)",
                  ],
                },
              ],
            };

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-100">
                      Total Revenue 💰
                    </h3>
                    <p className="text-3xl font-bold text-cyan-400">
                      {(stats.totals?.totalRevenue || 0).toFixed(2)} MVR
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-100">
                      Total Volume 💧
                    </h3>
                    <p className="text-3xl font-bold text-emerald-400">
                      {(stats.totals?.totalLiters || 0).toFixed(2)} L
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-100">
                      Total Pumps ⛽
                    </h3>
                    <p className="text-3xl font-bold text-orange-400">
                      {stats.totals?.totalPumps || 0}
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Revenue Trend 📈
                    </h3>
                    <Line data={revenueData} options={chartOptions} />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Volume Trend 📊
                    </h3>
                    <Line data={volumeData} options={chartOptions} />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Hourly Distribution 🕰️
                    </h3>
                    <Bar data={hourlyData} options={chartOptions} />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Top Users 🌟
                    </h3>
                    <Doughnut
                      data={topCardsData}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            ...chartOptions.plugins.legend,
                            position: "right" as const,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </>
            );
          })()
        ))}

      {activeTab === "cards" && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden mt-8">
          <h2 className="text-2xl font-bold text-white p-6 border-b border-white/10">
            Card Management
          </h2>
          <CardManagementTable stats={stats} />
        </div>
      )}

      {activeTab === "addCard" && (
        <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Add New Card</h2>
          <AddCardForm
            onAdd={handleAddCard}
            loading={addCardLoading}
            error={addCardError}
          />
          {addCardSuccess && (
            <div className="mt-4 text-green-400">{addCardSuccess}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminAuthWrapper>
      <AdminDashboard />
    </AdminAuthWrapper>
  );
}
