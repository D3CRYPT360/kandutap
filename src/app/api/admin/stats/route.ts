import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total revenue and volume
    const totals = db.prepare(`
      SELECT 
        SUM(liters * 5) as totalRevenue,
        SUM(liters) as totalLiters,
        COUNT(*) as totalPumps
      FROM pump_history
    `).get();

    // Get daily stats for the last 30 days
    const dailyStats = db.prepare(`
      SELECT 
        date(created_at) as date,
        SUM(liters * 5) as revenue,
        SUM(liters) as liters,
        COUNT(*) as pumps
      FROM pump_history
      WHERE created_at >= date('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `).all();

    // Get top cards by volume
    const topCards = db.prepare(`
      SELECT 
        card_id,
        SUM(liters) as totalLiters,
        SUM(liters * 5) as totalSpent,
        COUNT(*) as totalPumps
      FROM pump_history
      GROUP BY card_id
      ORDER BY totalLiters DESC
      LIMIT 5
    `).all();

    // Get hourly distribution
    const hourlyDistribution = db.prepare(`
      SELECT 
        strftime('%H', created_at) as hour,
        COUNT(*) as count
      FROM pump_history
      GROUP BY strftime('%H', created_at)
      ORDER BY hour
    `).all();

    return NextResponse.json({
      totals,
      dailyStats,
      topCards,
      hourlyDistribution
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
