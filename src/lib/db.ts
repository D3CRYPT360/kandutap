import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const db = new Database(path.join(process.cwd(), 'kandutap.db'), {
    verbose: console.log
});

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        balance REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS top_ups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT NOT NULL,
        amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(id)
    );

    CREATE TABLE IF NOT EXISTS pump_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT NOT NULL,
        liters REAL NOT NULL,
        cost REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(id)
    );

    CREATE TRIGGER IF NOT EXISTS update_cards_timestamp 
    AFTER UPDATE ON cards
    BEGIN
        UPDATE cards SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
`);

// Initialize with some test data if the table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM cards').get() as { count: number };
if (count.count === 0) {
    const insert = db.prepare('INSERT INTO cards (id, balance) VALUES (?, ?)');
    
    // Insert test data
    const testCards = [
        ['12345', 150],
        ['67890', 75],
        ['11111', 200]
    ];
    
    testCards.forEach(([id, balance]) => {
        insert.run(id, balance);
    });
}

export { db };
