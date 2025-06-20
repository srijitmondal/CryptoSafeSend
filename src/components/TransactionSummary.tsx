import React, { useEffect, useState } from 'react';

interface TransactionSummaryProps {
  amount: string;
  recipientAddress: string;
  secretCode: string;
  purpose: string;
  onProceed: () => void;
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  amount,
  recipientAddress,
  secretCode,
  purpose,
  onProceed,
}) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const prompt = `Generate a friendly, clear summary for a blockchain escrow transaction. The user is about to send ${amount} ETH to address ${recipientAddress}. The purpose is: ${purpose}. The secret code is: '${secretCode}'. Remind the user to share the code securely. Format as a single, concise sentence.`;
        const apiKey = 'AIzaSyBS7eEK_JKUOW8YPgYtiH1AwbNOR3qXQpI';
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });
        let data;
        try {
          data = await response.json();
        } catch (jsonErr) {
          console.error('Failed to parse Gemini API response as JSON:', jsonErr);
          setError('Gemini API returned invalid JSON.');
          setLoading(false);
          return;
        }
        console.log('Gemini API response:', data);
        if (!response.ok) {
          const apiError = data?.error?.message || 'Failed to fetch summary';
          setError('Gemini API error: ' + apiError);
          setLoading(false);
          return;
        }
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary available.';
        setSummary(text);
      } catch (err) {
        console.error('Gemini API call failed:', err);
        setError('Could not generate summary. ' + (err instanceof Error ? err.message : ''));
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [amount, recipientAddress, secretCode, purpose]);

  return (
    <div className="p-4 bg-blue-900/40 border border-blue-400/30 rounded-xl mb-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-white mb-2">Transaction Summary</h3>
      {loading ? (
        <div className="text-blue-200">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <div className="text-blue-100 mb-4">{summary}</div>
      )}
      <button
        className="w-full mt-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0 h-12 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
        onClick={onProceed}
        disabled={loading}
      >
        Proceed to Payment
      </button>
    </div>
  );
};

export default TransactionSummary; 