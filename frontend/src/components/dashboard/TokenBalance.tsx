'use client';

import { useEffect, useState } from 'react';
import { paymentAPI } from '../../lib/api';

export default function TokenBalance() {
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const result = await paymentAPI.getTokenBalance();
        if (result.success) {
          setTokens(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch token balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-secondary text-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">Token Balance</h3>
      <div className="text-4xl font-bold">{tokens ?? 0}</div>
      <p className="text-sm mt-2">Tokens available</p>
    </div>
  );
}
