from flask import Flask, request, jsonify
import sqlite3
import os
from flask_cors import CORS
from flask_restx import Api, Resource, fields, Namespace

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Swagger documentation
api = Api(
    app,
    version='1.0',
    title='KanduTap API',
    description='KanduTap Flask Backend API',
    doc='/api/docs',
    validate=True
)

# Database setup
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'kandutap.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Ensure tables exist
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables if they don't exist
    cursor.executescript('''
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
    ''')
    
    # Check if we need to add test data
    cursor.execute('SELECT COUNT(*) as count FROM cards')
    count = cursor.fetchone()['count']
    
    if count == 0:
        # Insert test data
        test_cards = [
            ('12345', 150),
            ('67890', 75),
            ('11111', 200)
        ]
        
        for card_id, balance in test_cards:
            cursor.execute('INSERT INTO cards (id, balance) VALUES (?, ?)', (card_id, balance))
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# Create namespaces for API organization
cards_ns = Namespace('cards', description='Card operations')
topups_ns = Namespace('topups', description='Top-up operations')
pump_history_ns = Namespace('pump-history', description='Pump history operations')
admin_ns = Namespace('admin', description='Admin operations')

# Add namespaces to the API
api.add_namespace(cards_ns, path='/api/cards')
api.add_namespace(topups_ns, path='/api/topups')
api.add_namespace(pump_history_ns, path='/api/pump-history')
api.add_namespace(admin_ns, path='/api/admin')

# Define models for request and response validation
card_model = api.model('Card', {
    'id': fields.String(required=True, description='Card ID'),
    'balance': fields.Float(required=True, description='Card balance'),
    'created_at': fields.String(required=False, description='Creation timestamp'),
    'updated_at': fields.String(required=False, description='Last update timestamp')
})

card_create_model = api.model('CardCreate', {
    'cardId': fields.String(required=True, description='Card ID'),
    'initialBalance': fields.Float(required=True, description='Initial balance')
})

card_update_model = api.model('CardUpdate', {
    'id': fields.String(required=True, description='Card ID'),
    'balance': fields.Float(required=True, description='New balance')
})

topup_model = api.model('TopUp', {
    'id': fields.Integer(description='Top-up ID'),
    'amount': fields.Float(required=True, description='Top-up amount'),
    'created_at': fields.String(description='Creation timestamp')
})

topup_create_model = api.model('TopUpCreate', {
    'cardId': fields.String(required=True, description='Card ID'),
    'amount': fields.Float(required=True, description='Top-up amount')
})

pump_history_model = api.model('PumpHistory', {
    'id': fields.Integer(description='Pump history ID'),
    'liters': fields.Float(required=True, description='Liters pumped'),
    'cost': fields.Float(required=True, description='Cost of pumping'),
    'created_at': fields.String(description='Creation timestamp')
})

pump_history_create_model = api.model('PumpHistoryCreate', {
    'cardId': fields.String(required=True, description='Card ID'),
    'liters': fields.Float(required=True, description='Liters pumped'),
    'cost': fields.Float(required=True, description='Cost of pumping')
})

# Routes for cards
@cards_ns.route('')
class CardList(Resource):
    @cards_ns.doc('list_cards')
    @cards_ns.param('id', 'Card ID (optional)')
    @cards_ns.response(200, 'Success')
    @cards_ns.response(400, 'Bad Request')
    def get(self):
        card_id = request.args.get('id')
        
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            if card_id:
                cursor.execute('SELECT balance FROM cards WHERE id = ?', (card_id,))
                card = cursor.fetchone()
                conn.close()
                return {'balance': card['balance'] if card else 0}
            else:
                cursor.execute('SELECT * FROM cards')
                cards = [dict(card) for card in cursor.fetchall()]
                conn.close()
                return {'cards': cards}
        except Exception as e:
            return {'error': str(e)}, 400

    @cards_ns.doc('create_card')
    @cards_ns.expect(card_create_model)
    @cards_ns.response(200, 'Success')
    @cards_ns.response(400, 'Bad Request')
    def post(self):
        try:
            data = request.json
            card_id = data.get('cardId')
            initial_balance = data.get('initialBalance')
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('INSERT INTO cards (id, balance) VALUES (?, ?)', (card_id, initial_balance))
            conn.commit()
            conn.close()
            
            return {'success': True}
        except Exception as e:
            return {'error': str(e)}, 400

    @cards_ns.doc('update_card')
    @cards_ns.expect(card_update_model)
    @cards_ns.response(200, 'Success')
    @cards_ns.response(400, 'Bad Request')
    def put(self):
        try:
            data = request.json
            card_id = data.get('id')
            balance = data.get('balance')
            
            print(f'Updating card balance: {card_id}, {balance}')
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('UPDATE cards SET balance = ? WHERE id = ?', (balance, card_id))
            changes = cursor.rowcount
            conn.commit()
            conn.close()
            
            print(f'Update result: {changes} rows affected')
            return {'success': True, 'changes': changes}
        except Exception as e:
            print(f'Error updating card balance: {str(e)}')
            return {'error': str(e)}, 400

# Routes for topups
@topups_ns.route('')
class TopUpList(Resource):
    @topups_ns.doc('get_topups')
    @topups_ns.param('id', 'Card ID (required)')
    @topups_ns.response(200, 'Success')
    @topups_ns.response(400, 'Bad Request')
    @topups_ns.response(404, 'Card Not Found')
    @topups_ns.response(500, 'Internal Server Error')
    def get(self):
        card_id = request.args.get('id')
        
        try:
            if not card_id:
                return {'error': 'Card ID is required'}, 400
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Get card details
            cursor.execute('SELECT * FROM cards WHERE id = ?', (card_id,))
            card = cursor.fetchone()
            
            if not card:
                conn.close()
                return {'error': 'Card not found'}, 404
            
            # Get top-up history
            cursor.execute('''
                SELECT id, amount, created_at 
                FROM top_ups 
                WHERE card_id = ? 
                ORDER BY created_at DESC
            ''', (card_id,))
            
            top_ups = [dict(top_up) for top_up in cursor.fetchall()]
            conn.close()
            
            return {'card': dict(card), 'topUps': top_ups}
        except Exception as e:
            print(f'Failed to fetch top-ups: {str(e)}')
            return {'error': 'Failed to fetch top-up history'}, 500

    @topups_ns.doc('create_topup')
    @topups_ns.expect(topup_create_model)
    @topups_ns.response(200, 'Success')
    @topups_ns.response(400, 'Bad Request')
    @topups_ns.response(404, 'Card Not Found')
    @topups_ns.response(500, 'Internal Server Error')
    def post(self):
        try:
            data = request.json
            card_id = data.get('cardId')
            amount = data.get('amount')
            
            if not card_id or amount is None:
                return {'error': 'Card ID and amount are required'}, 400
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check if card exists
            cursor.execute('SELECT * FROM cards WHERE id = ?', (card_id,))
            card = cursor.fetchone()
            
            if not card:
                conn.close()
                return {'error': 'Card not found'}, 404
            
            # Start transaction
            conn.execute('BEGIN TRANSACTION')
            
            # Add top-up record
            cursor.execute('INSERT INTO top_ups (card_id, amount) VALUES (?, ?)', (card_id, amount))
            
            # Update card balance
            new_balance = card['balance'] + amount
            cursor.execute('UPDATE cards SET balance = ? WHERE id = ?', (new_balance, card_id))
            
            # Commit transaction
            conn.commit()
            conn.close()
            
            return {'success': True}
        except Exception as e:
            print(f'Failed to process top-up: {str(e)}')
            return {'error': 'Failed to process top-up'}, 500

# Routes for pump history
@pump_history_ns.route('')
class PumpHistoryList(Resource):
    @pump_history_ns.doc('get_pump_history')
    @pump_history_ns.param('id', 'Card ID (required)')
    @pump_history_ns.response(200, 'Success')
    @pump_history_ns.response(400, 'Bad Request')
    @pump_history_ns.response(500, 'Internal Server Error')
    def get(self):
        card_id = request.args.get('id')
        
        try:
            if not card_id:
                return {'error': 'Card ID is required'}, 400
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, liters, cost, created_at 
                FROM pump_history 
                WHERE card_id = ? 
                ORDER BY created_at DESC
                LIMIT 10
            ''', (card_id,))
            
            history = [dict(record) for record in cursor.fetchall()]
            conn.close()
            
            return {'history': history}
        except Exception as e:
            print(f'Failed to fetch pump history: {str(e)}')
            return {'error': 'Failed to fetch pump history'}, 500

    @pump_history_ns.doc('create_pump_history')
    @pump_history_ns.expect(pump_history_create_model)
    @pump_history_ns.response(200, 'Success')
    @pump_history_ns.response(400, 'Bad Request')
    @pump_history_ns.response(500, 'Internal Server Error')
    def post(self):
        try:
            data = request.json
            card_id = data.get('cardId')
            liters = data.get('liters')
            cost = data.get('cost')
            
            if not card_id or liters is None or cost is None:
                return {'error': 'Card ID, liters, and cost are required'}, 400
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                'INSERT INTO pump_history (card_id, liters, cost) VALUES (?, ?, ?)',
                (card_id, liters, cost)
            )
            
            conn.commit()
            conn.close()
            
            return {'success': True}
        except Exception as e:
            print(f'Failed to save pump history: {str(e)}')
            return {'error': 'Failed to save pump history'}, 500

# Admin routes
@admin_ns.route('/cards')
class AdminCardList(Resource):
    @admin_ns.doc('admin_get_cards')
    @admin_ns.response(200, 'Success')
    @admin_ns.response(500, 'Internal Server Error')
    def get(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Get total stats
            cursor.execute('''
                SELECT 
                    SUM(t.amount) as totalRevenue,
                    SUM(p.liters) as totalLiters,
                    COUNT(p.id) as totalPumps
                FROM cards c
                LEFT JOIN top_ups t ON c.id = t.card_id
                LEFT JOIN pump_history p ON c.id = p.card_id
            ''')
            
            totals = dict(cursor.fetchone())
            
            # Get daily stats for the last 7 days
            cursor.execute('''
                SELECT 
                    date(p.created_at) as date,
                    SUM(p.cost) as revenue,
                    SUM(p.liters) as liters,
                    COUNT(p.id) as pumps
                FROM pump_history p
                GROUP BY date(p.created_at)
                ORDER BY date(p.created_at) DESC
                LIMIT 7
            ''')
            
            dailyStats = [dict(day) for day in cursor.fetchall()]
            
            # Get top 5 cards by usage
            cursor.execute('''
                SELECT 
                    p.card_id,
                    SUM(p.liters) as totalLiters,
                    SUM(p.cost) as totalSpent,
                    COUNT(p.id) as totalPumps
                FROM pump_history p
                GROUP BY p.card_id
                ORDER BY totalLiters DESC
                LIMIT 5
            ''')
            
            topCards = [dict(card) for card in cursor.fetchall()]
            
            # Get hourly distribution
            cursor.execute('''
                SELECT 
                    strftime('%H', p.created_at) as hour,
                    COUNT(p.id) as count
                FROM pump_history p
                GROUP BY strftime('%H', p.created_at)
                ORDER BY hour
            ''')
            
            hourlyDistribution = [dict(hour) for hour in cursor.fetchall()]
            
            # Get all cards for admin table
            cursor.execute('''
                SELECT c.id, c.balance, c.created_at, c.updated_at,
                       COUNT(DISTINCT t.id) as top_up_count,
                       COUNT(DISTINCT p.id) as pump_count
                FROM cards c
                LEFT JOIN top_ups t ON c.id = t.card_id
                LEFT JOIN pump_history p ON c.id = p.card_id
                GROUP BY c.id
                ORDER BY c.updated_at DESC
            ''')
            
            cards = [dict(card) for card in cursor.fetchall()]
            conn.close()
            
            # Return the complete admin stats structure
            return {
                'totals': totals,
                'dailyStats': dailyStats,
                'topCards': topCards,
                'hourlyDistribution': hourlyDistribution,
                'cards': cards
            }
        except Exception as e:
            print(f'Failed to fetch admin cards: {str(e)}')
            return {'error': 'Failed to fetch cards'}, 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
