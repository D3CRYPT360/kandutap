import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Card {
  id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get('id');

  try {
    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(cardId) as Card | undefined;
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const topUps = db.prepare(`
      SELECT id, amount, created_at 
      FROM top_ups 
      WHERE card_id = ? 
      ORDER BY created_at DESC
    `).all(cardId);

    return NextResponse.json({ card, topUps });
  } catch (error) {
    console.error('Failed to fetch top-ups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top-up history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { cardId, amount } = await request.json();

    if (!cardId || !amount) {
      return NextResponse.json(
        { error: 'Card ID and amount are required' },
        { status: 400 }
      );
    }

    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(cardId) as Card | undefined;
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Start a transaction
    db.transaction(() => {
      // Add top-up record
      db.prepare('INSERT INTO top_ups (card_id, amount) VALUES (?, ?)').run(cardId, amount);
      
      // Update card balance
      const newBalance = card.balance + amount;
      db.prepare('UPDATE cards SET balance = ? WHERE id = ?').run(newBalance, cardId);
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process top-up:', error);
    return NextResponse.json(
      { error: 'Failed to process top-up' },
      { status: 500 }
    );
  }
}
