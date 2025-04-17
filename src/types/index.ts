// Centralized shared types for Kandutap app

// Card types (used in both API and UI)
export interface Card {
  id: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
}

// TopUp record
export interface TopUp {
  id: number;
  amount: number;
  created_at: string;
}

// Pump history record
export interface PumpRecord {
  id: number;
  liters: number;
  cost: number;
  created_at: string;
}

// Admin stats
export interface AdminStats {
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

// Modal and form props

// Card Authentication Modal
export interface CardAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardId: string) => void;
}

// Top Up Modal
export interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

// Add Card Form
export interface AddCardFormProps {
  onAdd: (cardId: string, initialBalance: number) => void;
  loading: boolean;
  error: string | null;
}

// Pump History Props
export interface PumpHistoryProps {
  cardId: string | null;
}

// Flow Controls
export interface FlowControlsProps {
  isFlowing: boolean;
  onStart: () => void;
  onStartPumping: () => void;
  onStop: () => void;
  literLimit: number;
  onLiterLimitChange: (limit: number) => void;
  isCardAuthenticated: boolean;
}

// Flow Meter
export interface FlowMeterProps {
  isFlowing: boolean;
  flowRate: number;
  totalLiters: number;
  cost: number;
}

// Balance Display
export interface BalanceDisplayProps {
  balance: number;
}
