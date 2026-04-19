'use client';

import { useEffect, useState } from 'react';
import { emailAPI } from '../../lib/api';
import { Generation } from '../../types/index';

export default function GenerationHistory() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await emailAPI.getHistory(5);
        if (result.success) {
          setGenerations(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Generations</h2>

      {generations.length === 0 ? (
        <p className="text-gray-600">No generations yet. Start creating emails!</p>
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => (
            <div key={gen._id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{gen.inputParams.targetRole} - {gen.inputParams.targetIndustry}</h3>
                <span className="text-sm text-gray-600">
                  {new Date(gen.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {gen.generatedOutput.emails.length} emails | {gen.tokensUsed} tokens used
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
