import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Card {
  id: string;
  balance: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get('id');

  try {
    if (cardId) {
      const card = db.prepare('SELECT balance FROM cards WHERE id = ?').get(cardId) as Card | undefined;
      return NextResponse.json({ balance: card ? card.balance : 0 });
    } else {
      const cards = db.prepare('SELECT * FROM cards').all() as Card[];
      return NextResponse.json({ cards });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { cardId, initialBalance } = await request.json();
    db.prepare('INSERT INTO cards (id, balance) VALUES (?, ?)').run(cardId, initialBalance);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { cardId, balance } = await request.json();
    db.prepare('UPDATE cards SET balance = ? WHERE id = ?').run(balance, cardId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
