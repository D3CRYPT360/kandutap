import { useEffect, useState } from 'react';

// Define the interfaces directly
interface PumpRecord {
  id: number;
  liters: number;
  cost: number;
  created_at: string;
}

interface PumpHistoryProps {
  cardId: string | null;
}

export function PumpHistory({ cardId }: PumpHistoryProps) {
  const [history, setHistory] = useState<PumpRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!cardId) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/pump-history?id=${cardId}`);
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        setHistory(data.history);
      } catch (error) {
        console.error('Error fetching pump history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [cardId]);

  if (!cardId) return null;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Recent Pump History</h2>
      {loading ? (
        <div className="text-blue-200 text-center py-4">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-blue-200 text-center py-4">No pump history yet</div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-blue-200">
                  {new Date(record.created_at).toLocaleString()}
                </div>
                <div className="text-lg font-bold text-cyan-400">
                  {record.cost.toFixed(2)} MVR
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-white">
                  {record.liters.toFixed(2)}L
                </div>
                <div className="text-sm text-blue-200">
                  @ 5 MVR/L
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
