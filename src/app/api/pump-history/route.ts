import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get('id');

  try {
    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const history = db.prepare(`
      SELECT id, liters, cost, created_at 
      FROM pump_history 
      WHERE card_id = ? 
      ORDER BY created_at DESC
      LIMIT 10
    `).all(cardId);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Failed to fetch pump history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pump history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { cardId, liters, cost } = await request.json();

    if (!cardId || liters == null || cost == null) {
      return NextResponse.json(
        { error: 'Card ID, liters, and cost are required' },
        { status: 400 }
      );
    }

    db.prepare(
      'INSERT INTO pump_history (card_id, liters, cost) VALUES (?, ?, ?)'
    ).run(cardId, liters, cost);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save pump history:', error);
    return NextResponse.json(
      { error: 'Failed to save pump history' },
      { status: 500 }
    );
  }
}
