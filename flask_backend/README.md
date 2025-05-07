# KanduTap Flask Backend

This is a Flask implementation of the KanduTap backend API, converted from the original Next.js API routes.

## Setup Instructions

1. Make sure you have Python 3.7+ installed on your system.

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```
   python app.py
   ```

4. The server will start on `http://localhost:5000`

## API Endpoints

### Cards
- `GET /api/cards` - Get all cards
- `GET /api/cards?id={cardId}` - Get a specific card balance
- `POST /api/cards` - Create a new card
- `PUT /api/cards` - Update a card balance

### Top-ups
- `GET /api/topups?id={cardId}` - Get top-up history for a card
- `POST /api/topups` - Add a top-up to a card

### Pump History
- `GET /api/pump-history?id={cardId}` - Get pump history for a card
- `POST /api/pump-history` - Add a new pump history record

### Admin
- `GET /api/admin/cards` - Get all cards with statistics (for admin panel)

## Database

The application uses the same SQLite database (`kandutap.db`) as the original application, located in the parent directory.
