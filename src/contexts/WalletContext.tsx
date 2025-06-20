import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther, keccak256, toUtf8Bytes, getAddress } from 'ethers';

interface WalletContextType {
  account: string | null;
  provider: BrowserProvider | null;
  contract: Contract | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  createTransaction: (recipient: string, passcode: string, amount: string) => Promise<string>;
  claimFunds: (txId: string, passcode: string) => Promise<void>;
  cancelTransaction: (txId: string) => Promise<void>;
  getTransaction: (txId: string) => Promise<any>;
  getAllTransactions: () => Promise<any[]>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Updated ABI to match your SafeSend contract
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "txId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "Cancelled",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_txId",
        "type": "uint256"
      }
    ],
    "name": "cancelTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "txId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "Claimed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_txId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_code",
        "type": "string"
      }
    ],
    "name": "claimFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "txId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Created",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_recipient",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "_codeHash",
        "type": "bytes32"
      }
    ],
    "name": "createTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_txId",
        "type": "uint256"
      }
    ],
    "name": "getTransaction",
    "outputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "claimed",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "cancelled",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "transactions",
    "outputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "codeHash",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "claimed",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "cancelled",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "txCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Updated with your actual deployed contract address from Ganache
const CONTRACT_ADDRESS = "0xCE8aeE980EF5052fFe93757C9925aC09feA6802f"; // Your SafeSend contract address

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setProvider(provider);
          const signer = await provider.getSigner();
          // Use getAddress to ensure proper checksum
          const checksummedAddress = getAddress(CONTRACT_ADDRESS);
          const contract = new Contract(checksummedAddress, CONTRACT_ABI, signer);
          setContract(contract);
        }
      } catch (error) {
        console.log('No wallet connected');
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    setIsConnecting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      // Check if connected to correct network (Ganache typically uses chainId 1337 or 5777)
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.chainId);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      setProvider(provider);
      
      // Use getAddress to ensure proper checksum
      const checksummedAddress = getAddress(CONTRACT_ADDRESS);
      const contract = new Contract(checksummedAddress, CONTRACT_ABI, signer);
      setContract(contract);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
  };

  const createTransaction = async (recipient: string, passcode: string, amount: string): Promise<string> => {
    if (!contract || !account || !provider) {
      console.error('Contract, account, or provider not initialized');
      throw new Error('Wallet not properly connected');
    }
    
    try {
      console.log('=== Creating transaction ===');
      console.log('Recipient:', recipient);
      console.log('Amount:', amount);
      console.log('Account:', account);
      console.log('Contract address:', CONTRACT_ADDRESS);
      
      // Validate and checksum addresses
      let validRecipient: string;
      try {
        validRecipient = getAddress(recipient);
        console.log('Checksummed recipient:', validRecipient);
      } catch (addressError) {
        throw new Error('Invalid recipient address format');
      }

      const checksummedContractAddress = getAddress(CONTRACT_ADDRESS);
      console.log('Checksummed contract address:', checksummedContractAddress);
      
      // Validate inputs
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid amount');
      }
      
      if (!passcode || passcode.trim().length === 0) {
        throw new Error('Passcode cannot be empty');
      }

      // Check network connectivity
      try {
        const network = await provider.getNetwork();
        console.log('Network details:', {
          chainId: network.chainId,
          name: network.name
        });
      } catch (networkError) {
        console.error('Network connection failed:', networkError);
        throw new Error('Cannot connect to blockchain network. Please check your connection.');
      }

      // Enhanced contract deployment check
      try {
        const contractCode = await provider.getCode(checksummedContractAddress);
        console.log('Contract code length:', contractCode.length);
        console.log('Contract code preview:', contractCode.substring(0, 20) + '...');
        
        // More lenient check for development - sometimes contracts have minimal bytecode
        if (contractCode === '0x' || contractCode.length <= 2) {
          console.error('Contract deployment check failed:');
          console.error('- Contract address:', checksummedContractAddress);
          console.error('- Network chain ID:', (await provider.getNetwork()).chainId);
          console.error('- Code at address:', contractCode);
          
          // Try to provide helpful guidance
          const networkInfo = await provider.getNetwork();
          if (networkInfo.chainId === 1337n || networkInfo.chainId === 5777n) {
            throw new Error(`No SafeSend contract deployed at ${checksummedContractAddress} on your local Ganache network (Chain ID: ${networkInfo.chainId}). Please:\n1. Make sure Ganache is running\n2. Deploy your SafeSend contract to Ganache\n3. Update the contract address in the frontend\n4. Ensure the contract address matches exactly`);
          } else {
            throw new Error(`No contract found at address ${checksummedContractAddress} on network ${networkInfo.chainId}. Please verify the SafeSend contract is deployed to the correct network.`);
          }
        }
        
        console.log('✓ Contract found at address');
      } catch (codeError: any) {
        console.error('Contract code check failed:', codeError);
        if (codeError.message.includes('No SafeSend contract deployed')) {
          throw codeError; // Re-throw our custom error
        }
        throw new Error('Failed to verify contract deployment - network connectivity issue');
      }

      // Test basic contract interaction with better error handling
      try {
        console.log('Testing contract interaction...');
        const txCounter = await contract.txCounter();
        console.log('✓ Contract interaction successful - current transaction counter:', txCounter.toString());
      } catch (interactionError: any) {
        console.error('Contract interaction test failed:', interactionError);
        
        if (interactionError.code === 'CALL_EXCEPTION') {
          throw new Error('Contract exists but is not responding correctly. The contract may not be the expected SafeSend contract or may have compilation issues.');
        } else if (interactionError.message?.includes('network')) {
          throw new Error('Network error when trying to interact with contract. Please check your Ganache connection.');
        } else {
          throw new Error(`Cannot communicate with smart contract: ${interactionError.message}`);
        }
      }
      
      // Check balance
      const balance = await provider.getBalance(account);
      const amountWei = parseEther(amount);
      console.log('Account balance:', formatEther(balance), 'ETH');
      console.log('Transaction amount:', amount, 'ETH');
      
      if (balance < amountWei) {
        throw new Error('Insufficient balance');
      }
      
      // Generate code hash using the same method as your contract (abi.encodePacked)
      // In ethers.js v6, use solidityPackedKeccak256
      const { solidityPackedKeccak256 } = await import('ethers');
      const codeHash = solidityPackedKeccak256(['string'], [passcode]);
      console.log('Code hash (matching contract):', codeHash);
      
      // Estimate gas with detailed error handling
      try {
        console.log('Estimating gas...');
        const gasEstimate = await contract.createTransaction.estimateGas(validRecipient, codeHash, {
          value: amountWei
        });
        console.log('✓ Gas estimation successful:', gasEstimate.toString());
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        
        // Try to get more specific error information
        if (gasError.reason) {
          throw new Error(`Contract execution would fail: ${gasError.reason}`);
        } else if (gasError.message?.includes('revert')) {
          throw new Error('Transaction would be reverted by the contract');
        } else if (gasError.message?.includes('network')) {
          throw new Error('Network error during gas estimation');
        } else {
          throw new Error('Gas estimation failed - transaction may not be valid');
        }
      }
      
      // Call the smart contract
      console.log('Calling contract.createTransaction...');
      const tx = await contract.createTransaction(validRecipient, codeHash, {
        value: amountWei,
        gasLimit: 500000 // Increased gas limit
      });
      
      console.log('Transaction sent:', tx.hash);
      console.log('Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      
      // Extract transaction ID from the Created event
      let txId = null;
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          console.log('Parsed log:', parsedLog);
          
          if (parsedLog?.name === 'Created') {
            txId = parsedLog.args.txId.toString();
            console.log('Found Created event with txId:', txId);
            break;
          }
        } catch (parseError) {
          // Log might not be from our contract, skip it
          continue;
        }
      }
      
      if (!txId) {
        console.error('No Created event found in transaction receipt');
        console.log('All logs:', receipt.logs);
        throw new Error('Transaction created but ID not found in events');
      }
      
      console.log('✓ Transaction created successfully with ID:', txId);
      return txId;
      
    } catch (error: any) {
      console.error('=== Transaction creation failed ===');
      console.error('Error details:', error);
      
      // Enhanced error parsing
      if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error.code === 'CALL_EXCEPTION') {
        throw new Error('Smart contract call failed. Please verify the contract is deployed correctly.');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for transaction and gas fees.');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Cannot estimate gas limit. Transaction may fail or contract may not be deployed.');
      } else if (error.message?.includes('user rejected')) {
        throw new Error('Transaction rejected by user');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your connection to the blockchain network.');
      } else if (error.message?.includes('nonce')) {
        throw new Error('Transaction nonce error. Please reset your MetaMask account.');
      } else if (error.reason) {
        throw new Error(error.reason);
      } else {
        throw new Error(error.message || 'Unknown error occurred during transaction creation');
      }
    }
  };

  const claimFunds = async (txId: string, passcode: string) => {
    if (!contract || !account) throw new Error('Contract not initialized');
    
    try {
      // Parse txId as number or BigInt
      let parsedTxId: any = txId;
      if (/^\d+$/.test(txId)) {
        parsedTxId = BigInt(txId);
      }

      // Debug log: recipient
      const recipientOnChain = await contract.transactions(parsedTxId).then((tx: any) => tx.recipient);
      console.log('Current connected account:', account);
      console.log('On-chain intended recipient:', recipientOnChain);

      if (account.toLowerCase() !== recipientOnChain.toLowerCase()) {
        // Error toast: user must switch account
        throw new Error("Your wallet is not the intended recipient. Please switch to the correct MetaMask account.");
      }

      const tx = await contract.claimFunds(parsedTxId, passcode);
      console.log('Claim transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Claim transaction confirmed:', receipt);
    } catch (error: any) {
      console.error('Error claiming funds:', error);

      // Parse contract error messages
      if (error.reason) {
        throw new Error(error.reason);
      } else if (typeof error.message === 'string') {
        // Find common smart contract errors
        if (error.message.toLowerCase().includes('invalid code')) {
          throw new Error('Invalid passcode');
        } else if (error.message.toLowerCase().includes('already claimed')) {
          throw new Error('Transaction has already been claimed');
        } else if (error.message.toLowerCase().includes('transaction cancelled')) {
          throw new Error('Transaction has been cancelled');
        } else if (error.message.toLowerCase().includes('not the intended recipient')) {
          throw new Error('Only the intended recipient can claim this transaction (please switch to the recipient’s MetaMask account)');
        } else if (error.message.toLowerCase().includes('invalid number value')) {
          throw new Error('Transaction ID must be a number');
        } else if (error.message.toLowerCase().includes('not the intended recipient')) {
          throw new Error('Your wallet is not the recipient for this transaction. Please login with the recipient address.');
        } else {
          throw new Error(error.message);
        }
      } else {
        throw new Error('Failed to claim funds');
      }
    }
  };

  const cancelTransaction = async (txId: string) => {
    if (!contract || !account) throw new Error('Contract not initialized');
    
    try {
      console.log('Cancelling transaction:', txId);
      
      // First check if the transaction exists and if user is the sender
      const transaction = await contract.getTransaction(txId);
      
      if (transaction.sender.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Only the sender can cancel this transaction');
      }
      
      if (transaction.claimed) {
        throw new Error('Cannot cancel a claimed transaction');
      }
      
      if (transaction.cancelled) {
        throw new Error('Transaction is already cancelled');
      }
      
      const tx = await contract.cancelTransaction(txId);
      console.log('Cancel transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Cancel transaction confirmed:', receipt);
    } catch (error: any) {
      console.error('Error cancelling transaction:', error);
      
      // Parse contract error messages
      if (error.reason) {
        throw new Error(error.reason);
      } else if (error.message.includes('Not sender')) {
        throw new Error('Only the sender can cancel this transaction');
      } else if (error.message.includes('Already claimed')) {
        throw new Error('Cannot cancel a claimed transaction');
      } else if (error.message.includes('Already cancelled')) {
        throw new Error('Transaction is already cancelled');
      } else {
        throw new Error('Failed to cancel transaction');
      }
    }
  };

  const getTransaction = async (txId: string) => {
    if (!contract) throw new Error("Contract not initialized");
    try {
      const tx = await contract.getTransaction(txId);
      return {
        sender: getAddress(tx.sender),
        recipient: getAddress(tx.recipient),
        amount: formatEther(tx.amount),
        claimed: tx.claimed,
        cancelled: tx.cancelled,
      };
    } catch (error) {
      console.error("Error getting transaction:", error);
      throw new Error("Could not fetch transaction. Please check the ID and network.");
    }
  };

  const getAllTransactions = async () => {
    if (!contract) throw new Error("Contract not initialized");
    try {
      const txCount = await contract.txCounter();
      const count = Number(txCount);
      const transactions = [];

      for (let i = 1; i <= count; i++) {
        try {
          const tx = await contract.getTransaction(i);
          transactions.push({
            id: i,
            sender: getAddress(tx.sender),
            recipient: getAddress(tx.recipient),
            amount: formatEther(tx.amount),
            claimed: tx.claimed,
            cancelled: tx.cancelled,
          });
        } catch (innerError) {
          console.warn(`Could not fetch transaction ID ${i}:`, innerError);
          // Optionally, add a placeholder for failed transactions
          transactions.push({
            id: i,
            error: `Failed to load transaction ${i}`,
          });
        }
      }
      return transactions.reverse(); // Show newest first
    } catch (error) {
      console.error("Error getting all transactions:", error);
      throw new Error("Could not fetch all transactions from the contract.");
    }
  };

  const value: WalletContextType = {
    account,
    provider,
    contract,
    isConnecting,
    connectWallet,
    disconnectWallet,
    createTransaction,
    claimFunds,
    cancelTransaction,
    getTransaction,
    getAllTransactions,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
