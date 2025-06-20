import React, { useState } from 'react';
import { Send, Loader2, Shield, Zap, Lock } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { TransactionResult } from './TransactionResult';
import { TransactionSummary } from './TransactionSummary';

export const CreateTransaction: React.FC = () => {
  const { account, createTransaction } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    passcode: '',
    amount: '',
    purpose: ''
  });
  const [transactionResult, setTransactionResult] = useState<{
    txId: string;
    recipient: string;
    amount: string;
  } | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const txId = await createTransaction(formData.recipient, formData.passcode, formData.amount);
      setTransactionResult({
        txId,
        recipient: formData.recipient,
        amount: formData.amount
      });
      toast({
        title: "Transaction Created",
        description: "Your secure transaction has been created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setTransactionResult(null);
    setFormData({ recipient: '', passcode: '', amount: '', purpose: '' });
  };

  const handleProceed = async () => {
    setIsLoading(true);
    try {
      const txId = await createTransaction(formData.recipient, formData.passcode, formData.amount);
      setTransactionResult({
        txId,
        recipient: formData.recipient,
        amount: formData.amount
      });
      toast({
        title: "Transaction Created",
        description: "Your secure transaction has been created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowSummary(false);
    }
  };

  if (transactionResult) {
    return (
      <TransactionResult
        txId={transactionResult.txId}
        recipient={transactionResult.recipient}
        amount={transactionResult.amount}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  if (showSummary) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <TransactionSummary
          amount={formData.amount}
          recipientAddress={formData.recipient}
          secretCode={formData.passcode}
          purpose={formData.purpose}
          onProceed={handleProceed}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-12">
        {/* Removed military-grade encryption badge */}
      </div>

      

      {/* Transaction Form */}
      <Card className="glass-effect border-white/20 max-w-2xl mx-auto animate-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center text-2xl">
            <Send className="w-6 h-6 mr-3" />
            Create Secure Transaction
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Send ETH securely with passcode protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); setShowSummary(true); }} className="space-y-6">
            <div>
              <Label htmlFor="recipient" className="text-white text-sm font-medium">Recipient Address</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="0x..."
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mt-2 h-12 rounded-lg backdrop-blur-sm"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="passcode" className="text-white text-sm font-medium">Secret Passcode</Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter secure passcode"
                value={formData.passcode}
                onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mt-2 h-12 rounded-lg backdrop-blur-sm"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="amount" className="text-white text-sm font-medium">Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                placeholder="0.0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mt-2 h-12 rounded-lg backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <Label htmlFor="purpose" className="text-white text-sm font-medium">Purpose</Label>
              <Input
                id="purpose"
                type="text"
                placeholder="e.g. freelance payment, gift, etc."
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mt-2 h-12 rounded-lg backdrop-blur-sm"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !account}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0 h-14 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Creating Transaction...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-3" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
