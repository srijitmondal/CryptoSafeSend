import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const ClaimFunds: React.FC = () => {
  const { account, claimFunds } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    txId: '',
    passcode: ''
  });

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
      await claimFunds(formData.txId, formData.passcode);
      toast({
        title: "Funds Claimed",
        description: "Successfully claimed the funds!",
      });
      setFormData({ txId: '', passcode: '' });
    } catch (error: any) {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <Card className="glass-effect border-white/20 max-w-2xl mx-auto animate-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center text-2xl">
            <Download className="w-6 h-6 mr-3" />
            Claim Funds
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Enter transaction ID and passcode to claim your funds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="txId" className="text-white text-sm font-medium">Transaction ID</Label>
              <Input
                id="txId"
                type="text"
                placeholder="Enter transaction ID"
                value={formData.txId}
                onChange={(e) => setFormData({ ...formData, txId: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mt-2 h-12 rounded-lg backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <Label htmlFor="passcode" className="text-white text-sm font-medium">Secret Passcode</Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter the secret passcode"
                value={formData.passcode}
                onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mt-2 h-12 rounded-lg backdrop-blur-sm"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !account}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 h-14 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Claiming Funds...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-3" />
                  Claim Funds
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
