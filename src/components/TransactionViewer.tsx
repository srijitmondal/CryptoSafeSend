import React, { useState } from 'react';
import { Search, Loader2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface TransactionData {
  sender: string;
  recipient: string;
  amount: string;
  claimed: boolean;
  cancelled: boolean;
}

export const TransactionViewer: React.FC = () => {
  const { getTransaction } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState('');
  const [transaction, setTransaction] = useState<TransactionData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId) return;

    setIsLoading(true);
    try {
      const tx = await getTransaction(txId);
      setTransaction(tx);
    } catch (error: any) {
      toast({
        title: "Transaction Not Found",
        description: error.message,
        variant: "destructive",
      });
      setTransaction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!transaction) return null;
    
    if (transaction.cancelled) {
      return <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">
        <XCircle className="w-3 h-3 mr-1" />
        Cancelled
      </Badge>;
    }
    
    if (transaction.claimed) {
      return <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        Claimed
      </Badge>;
    }
    
    return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
      <Clock className="w-3 h-3 mr-1" />
      Pending
    </Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <Card className="glass-effect border-white/20 max-w-2xl mx-auto animate-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center text-2xl">
            <Eye className="w-6 h-6 mr-3" />
            Transaction Viewer
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            View transaction details and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="searchTxId" className="text-white sr-only">Transaction ID</Label>
              <Input
                id="searchTxId"
                type="text"
                placeholder="Enter transaction ID"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-12 rounded-lg backdrop-blur-sm"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 h-12 rounded-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </form>
          {transaction && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                {getStatusBadge()}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sender:</span>
                  <span className="text-white font-mono">{transaction.sender.slice(0, 6)}...{transaction.sender.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white font-mono">{transaction.recipient.slice(0, 6)}...{transaction.recipient.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-bold">{transaction.amount} ETH</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
