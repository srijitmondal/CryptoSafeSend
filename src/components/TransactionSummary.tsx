import React, { useEffect, useState, useRef } from 'react';

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
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [warningPlayed, setWarningPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Function to generate and play voice warning
  const generateVoiceWarning = async () => {
    setAudioLoading(true);
    setAudioError(null);
    
    try {
      const warningText = `  Security Alert! You are about to send ${amount} ETH to the recipient's address. This is a secure escrow transaction. Your secret code is ${secretCode}. Please carefully verify all transaction details before proceeding.`;
      
      const apiKey = 'AIzaSyBS7eEK_JKUOW8YPgYtiH1AwbNOR3qXQpI';
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Convert this text to speech with a serious, warning tone: ${warningText}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to generate voice warning');
      }

      // For Gemini, we'll use the Web Speech API as a fallback since Gemini doesn't have direct TTS
      // In a real implementation, you'd use a proper TTS service like Google Cloud TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(warningText);
        
        // Get available voices and select the best one for warnings
        const voices = speechSynthesis.getVoices();
        const preferredVoices = voices.filter(voice => 
          voice.lang.includes('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Alex'))
        );
        
        if (preferredVoices.length > 0) {
          // Prefer deeper, more authoritative voices for warnings
          const deepVoice = preferredVoices.find(voice => 
            voice.name.toLowerCase().includes('david') || 
            voice.name.toLowerCase().includes('james') ||
            voice.name.toLowerCase().includes('mark')
          ) || preferredVoices[0];
          
          utterance.voice = deepVoice;
        }
        
        // Optimize speech parameters for natural warning tone
        utterance.rate = 0.85; // Slightly slower for emphasis and clarity
        utterance.pitch = 0.9; // Slightly lower pitch for authority
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
          setAudioPlaying(true);
          setWarningPlayed(true);
        };
        utterance.onend = () => setAudioPlaying(false);
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setAudioError('Failed to play voice warning');
          setAudioPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        throw new Error('Speech synthesis not supported in this browser');
      }
      
    } catch (err) {
      console.error('Voice warning generation failed:', err);
      setAudioError('Could not generate voice warning. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setAudioLoading(false);
    }
  };

  // Stop audio playback
  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setAudioPlaying(false);
    }
  };

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

  // Auto-play voice warning when component loads
  useEffect(() => {
    // Small delay to ensure component is fully rendered
    const timer = setTimeout(() => {
      generateVoiceWarning();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array - only runs once when component mounts

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="p-4 bg-blue-900/40 border border-blue-400/30 rounded-xl mb-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-white mb-2">⚠️ Warning : Transaction Summary</h3>
      
      {/* Voice Warning Controls */}
      <div className="mb-4 p-3 bg-orange-900/30 border border-orange-500/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-orange-200 font-medium">🔊 Voice Warning</span>
          <div className="flex gap-2">
            <button
              onClick={generateVoiceWarning}
              disabled={audioLoading || audioPlaying}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800/50 text-white text-sm rounded-md transition-colors"
            >
              {audioLoading ? 'Warning Loading...' : audioPlaying ? 'Playing...' : 'Play Warning'}
            </button>
            {audioPlaying && (
              <button
                onClick={stopAudio}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
              >
                Stop
              </button>
            )}
          </div>
        </div>
        {audioError && (
          <div className="text-red-400 text-sm">{audioError}</div>
        )}
        <div className="text-orange-100 text-sm">
          Listen to an audio warning about this transaction for enhanced security.
        </div>
      </div>

      {loading ? (
        <div className="text-blue-200">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <div className="text-blue-100 mb-4">{summary}</div>
      )}
      
      {/* Highlighted Transaction Details */}
      <div className="bg-blue-800/30 border border-blue-500/50 rounded-lg p-3 mb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-blue-200 font-medium">Amount:</span>
            <span className="text-yellow-300 font-bold text-lg bg-yellow-900/30 px-2 py-1 rounded">
              {amount} ETH
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-200 font-medium">Recipient:</span>
            <span className="text-green-300 font-mono text-sm bg-green-900/30 px-2 py-1 rounded break-all">
              {recipientAddress}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-200 font-medium">Secret Code:</span>
            <span className="text-purple-300 font-bold text-lg bg-purple-900/30 px-2 py-1 rounded">
              {secretCode}
            </span>
          </div>
        </div>
      </div>
      
      <button
        className={`w-full mt-2 text-white border-0 h-12 text-lg font-semibold rounded-xl transition-all duration-300 ${
          warningPlayed && !audioPlaying
            ? 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 hover:scale-105' 
            : 'bg-gray-600 cursor-not-allowed opacity-50'
        }`}
        onClick={onProceed}
        disabled={loading || !warningPlayed || audioPlaying}
      >
        {!warningPlayed ? '⚠️ Listen to Warning First' : audioPlaying ? '🔊 Warning Playing...WAIT' : 'Proceed to Payment'}
      </button>
    </div>
  );
};

export default TransactionSummary; 