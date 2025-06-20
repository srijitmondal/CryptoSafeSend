import React, { useState } from 'react';
import { Search, Loader2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionData {
  id?: number;
  sender: string;
  recipient: string;
  amount: string;
  claimed: boolean;
  cancelled: boolean;
  error?: string;
}

export const TransactionViewer: React.FC = () => {
  const { getTransaction, getAllTransactions } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [txId, setTxId] = useState('');
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [allTransactions, setAllTransactions] = useState<TransactionData[]>([]);
  const [showAll, setShowAll] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId) return;

    setIsLoading(true);
    setTransaction(null);
    setShowAll(false);
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

  const handleFetchAll = async () => {
    setIsFetchingAll(true);
    setTransaction(null);
    try {
      const txs = await getAllTransactions();
      setAllTransactions(txs);
      setShowAll(true);
    } catch (error: any) {
      toast({
        title: "Failed to fetch transactions",
        description: error.message,
        variant: "destructive",
      });
      setAllTransactions([]);
      setShowAll(false);
    } finally {
      setIsFetchingAll(false);
    }
  };

  const getStatusBadge = (tx: TransactionData | null) => {
    if (!tx || tx.error) return <Badge variant="destructive">Error</Badge>;
    
    if (tx.cancelled) {
      return <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">
        <XCircle className="w-3 h-3 mr-1" />
        Cancelled
      </Badge>;
    }
    
    if (tx.claimed) {
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

  const renderTransactionItem = (tx: TransactionData) => (
    <div key={tx.id} className="p-3 bg-white/5 rounded-lg border border-white/10 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-white font-semibold">Transaction #{tx.id}</span>
          {tx.error ? (
            <span className="text-red-400 text-xs">{tx.error}</span>
          ) : (
            <span className="text-gray-400 text-xs font-mono">
              {tx.sender?.slice(0, 6)}...{tx.sender?.slice(-4)} → {tx.recipient?.slice(0, 6)}...{tx.recipient?.slice(-4)}
            </span>
          )}
        </div>
        {getStatusBadge(tx)}
      </div>
      {!tx.error && (
        <div className="text-right text-white font-bold mt-1">{tx.amount} ETH</div>
      )}
    </div>
  );

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

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20"></span>
            </div>
            <span className="relative px-2 text-xs uppercase text-gray-400 bg-card">Or</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full h-12"
            onClick={handleFetchAll}
            disabled={isFetchingAll}
          >
            {isFetchingAll ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Eye className="w-5 h-5 mr-2" />
            )}
            View All Transactions
          </Button>

          {transaction && !showAll && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                {getStatusBadge(transaction)}
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

          {showAll && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">All Transactions</h3>
              <ScrollArea className="h-72 w-full p-4 bg-black/30 rounded-lg border border-white/10">
                {allTransactions.length > 0 ? (
                  allTransactions.map(renderTransactionItem)
                ) : (
                  <p className="text-gray-400 text-center">No transactions found.</p>
                )}
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
