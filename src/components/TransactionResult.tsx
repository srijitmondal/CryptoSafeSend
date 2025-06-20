import React from 'react';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface TransactionResultProps {
  txId: string;
  recipient: string;
  amount: string;
  onCreateAnother: () => void;
}

export const TransactionResult: React.FC<TransactionResultProps> = ({
  txId,
  recipient,
  amount,
  onCreateAnother
}) => {
  const { toast } = useToast();

  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(txId);
      toast({
        title: "Copied!",
        description: "Transaction ID copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the transaction ID manually",
        variant: "destructive",
      });
    }
  };

  const shareInstructions = `Send this Transaction ID to the recipient: ${txId}`;

  const copyInstructions = async () => {
    try {
      await navigator.clipboard.writeText(shareInstructions);
      toast({
        title: "Instructions Copied!",
        description: "Share instructions copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the instructions manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-green-500/10 border-green-500/20 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
          Transaction Created Successfully!
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your secure transaction has been created. Share the transaction ID with the recipient.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="text-white font-medium mb-2">Transaction Details:</h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div><strong>Recipient:</strong> {recipient.slice(0, 10)}...{recipient.slice(-8)}</div>
            <div><strong>Amount:</strong> {amount} ETH</div>
            <div><strong>Transaction ID:</strong> {txId}</div>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <h4 className="text-white font-medium mb-2 flex items-center">
            <ExternalLink className="w-4 h-4 mr-2" />
            Share with Recipient:
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            The recipient needs this Transaction ID to claim the funds using the passcode you provided.
          </p>
          <div className="bg-gray-800 p-3 rounded border border-gray-700 mb-3">
            <code className="text-white text-sm break-all">{txId}</code>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={copyTransactionId}
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy ID
            </Button>
            <Button
              onClick={copyInstructions}
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Instructions
            </Button>
          </div>
        </div>

        <Button
          onClick={onCreateAnother}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
        >
          Create Another Transaction
        </Button>
      </CardContent>
    </Card>
  );
};
