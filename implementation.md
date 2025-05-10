# KanduTap Implementation Documentation

## Project Overview

KanduTap is a smart water dispensing system that allows users to dispense water using RFID cards. The system includes user authentication, balance management, top-up functionality, and an admin dashboard for monitoring and management.

## Architecture

The project follows a client-server architecture with the following components:

### Frontend
- **Framework**: Next.js with React
- **Styling**: Tailwind CSS for responsive design
- **Data Visualization**: Chart.js for admin dashboard statistics
- **State Management**: React useState and useEffect hooks

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite
- **API Documentation**: Swagger UI via flask-restx
- **CORS**: Enabled for cross-origin requests

## Database Schema

### Cards Table
```sql
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    balance REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Top-ups Table
```sql
CREATE TABLE IF NOT EXISTS top_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id)
);
```

### Pump History Table
```sql
CREATE TABLE IF NOT EXISTS pump_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL,
    liters REAL NOT NULL,
    cost REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id)
);
```

## Key Features Implementation

### 1. Card Authentication

The card authentication process is implemented in both the main page and top-up page:

```typescript
// Card authentication with status check
const handleCardAuth = async (cardId: string) => {
  setError(null);
  try {
    // Get card balance using the API service
    const data = await cardApi.getBalance(cardId);
    
    // Check if card is disabled
    if (data.status === "disabled") {
      setError("This card has been disabled. Please contact an administrator.");
      return;
    }

    setCurrentCardId(cardId);
    setBalance(data.balance);
    setPendingBalance(data.balance);
    setIsCardAuthenticated(true);
    setIsCardAuthModalOpen(false);
  } catch (error: any) {
    // Error handling logic
  }
};
```

### 2. Water Dispensing Simulation

The water dispensing feature simulates a real-time flow with a random flow rate between 2-2.5 L/min:

```typescript
useEffect(() => {
  if (!isFlowing) return;

  const flowInterval = setInterval(() => {
    const rate = 2 + Math.random() * 0.5; // Random flow rate between 2-2.5 L/min
    setFlowRate(rate);

    setTotalLiters((prev) => {
      const newTotal = Math.round((prev + rate / 60) * 100) / 100; // Round to 2 decimal places
      if (literLimit > 0 && newTotal >= literLimit) {
        setIsFlowing(false);
        if (balance !== null) {
          const cost = literLimit * 5; // 5 MVR per liter
          setPendingBalance(balance - cost);
          setLastPumpCost(cost);
          savePumpHistory(literLimit, cost);
        }
        return literLimit;
      }
      if (balance !== null) {
        const cost = newTotal * 5; // 5 MVR per liter
        setPendingBalance(balance - cost);
        setLastPumpCost(cost);
      }
      return newTotal;
    });

    // Stop flow if balance is depleted
    if (pendingBalance !== null && pendingBalance <= 0) {
      setIsFlowing(false);
      savePumpHistory(totalLiters, lastPumpCost);
    }
  }, 1000); // Update every second

  return () => clearInterval(flowInterval);
}, [isFlowing, literLimit, balance, pendingBalance, totalLiters, lastPumpCost]);
```

### 3. Top-up Functionality

The top-up feature allows users to add balance to their cards:

```typescript
const handleTopUp = async () => {
  if (!card || !amount) return;

  try {
    // Use the API service to create a top-up
    await topUpApi.createTopUp(card.id, Number(amount));

    // Refresh top-up history
    const data = await topUpApi.getTopUps(card.id);
    setCard(data.card);
    setTopUps(data.topUps);
    setAmount("");
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to process top-up");
  }
};
```

### 4. Admin Dashboard

The admin dashboard provides statistics and card management features:

- **Statistics Visualization**: Uses Chart.js to display revenue trends, volume trends, hourly distribution, and top users
- **Card Management**: Allows admins to view all cards, enable/disable cards, and add new cards

### 5. Card Status Management

Admins can enable or disable cards using a toggle switch:

```typescript
const handleToggleStatus = async (cardId: string, currentStatus: string) => {
  // Set loading state for this specific card
  setLoading(prev => ({ ...prev, [cardId]: true }));
  setError(null);
  setSuccess(null);
  
  try {
    // Toggle the status
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    
    // Call the API to update the card status
    await adminApi.updateCardStatus(cardId, newStatus as 'active' | 'disabled');
    
    // Update the local state to reflect the change
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, status: newStatus } : card
      )
    );
    
    setSuccess(`Card ${cardId} has been ${newStatus}`);
  } catch (err: any) {
    console.error('Failed to update card status:', err);
    setError(err.message || 'Failed to update card status');
  } finally {
    // Clear loading state for this card
    setLoading(prev => ({ ...prev, [cardId]: false }));
  }
};
```

## API Implementation

The API is implemented using Flask with RESTful endpoints:

### Card Operations
- `GET /api/cards?id={cardId}` - Get card balance
- `POST /api/cards` - Create new card
- `PUT /api/cards` - Update card balance

### Top-up Operations
- `GET /api/topups?id={cardId}` - Get top-up history
- `POST /api/topups` - Add top-up to card

### Pump Operations
- `GET /api/pump-history?id={cardId}` - Get pump history
- `POST /api/pump-history` - Save pump history

### Admin Operations
- `GET /api/admin/cards` - Get admin statistics
- `PUT /api/admin/cards/status` - Update card status

## Timestamp Management

To ensure correct timestamps in the database, we implemented a custom function to get the current local time:

```python
def get_current_time():
    """Return current local time in ISO format"""
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
```

This function is used in all database operations that create or update records:

```python
# Example: Adding a top-up record with current local time
current_time = get_current_time()
cursor.execute('INSERT INTO top_ups (card_id, amount, created_at) VALUES (?, ?, ?)', 
              (card_id, amount, current_time))
```

## Navigation Implementation

The application provides seamless navigation between different sections:

- **Main Page**: Includes links to Top-up page
- **Top-up Page**: Includes a "Go to Home" button to return to the main page
- **Admin Dashboard**: Includes tabs for Dashboard, Manage Cards, and Add Card

## Error Handling

The application implements comprehensive error handling:

1. **Backend Validation**:
   - Card ID format validation
   - Card existence checks
   - Card status validation

2. **Frontend Error Display**:
   - Error messages are displayed in red notification boxes
   - Success messages are displayed in green notification boxes

## Responsive Design

The UI is built with Tailwind CSS, providing a responsive design that works well on different screen sizes:

- **Mobile-friendly**: All components adapt to smaller screens
- **Grid Layout**: Uses CSS grid for flexible layouts
- **Consistent Styling**: Maintains a consistent color scheme and design language

## Future Enhancements

1. **User Authentication**: Add user accounts with login/registration
2. **Payment Integration**: Add real payment gateway integration
3. **Notifications**: Implement email/SMS notifications for low balance
4. **Hardware Integration**: Connect with actual RFID readers and water dispensing hardware
5. **Advanced Analytics**: Add more detailed analytics and reporting features