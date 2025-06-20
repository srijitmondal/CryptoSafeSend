import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, MessageCircle, Send, User, Users, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { MessagesList } from './MessagesList';
import { ChatWindow } from './ChatWindow';
import { UsersList } from './UsersList';
import { Navigation } from './Navigation';
import { CreateTransaction } from './CreateTransaction';
import { ClaimFunds } from './ClaimFunds';
import { CancelTransaction } from './CancelTransaction';
import { TransactionViewer } from './TransactionViewer';
import { WalletButton } from './WalletButton';
import { EnhancedBackground } from './EnhancedBackground';
import { useToast } from '@/hooks/use-toast';

const LOGO_SRC = "/lovable-uploads/87763936-c75c-476b-8bf3-487950a7530d.png";

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedChat, setSelectedChat] = useState<{
    recipientUid: string;
    recipientWallet: string;
  } | null>(null);
  const [showUsersList, setShowUsersList] = useState(false);
  const { currentUser, userWallet, logout } = useAuth();
  const { account } = useWallet();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSelectChat = (recipientUid: string, recipientWallet: string) => {
    setSelectedChat({ recipientUid, recipientWallet });
    setActiveTab('messages');
    setShowUsersList(false);
  };

  const handleSelectUser = (userUid: string, userWallet: string) => {
    setSelectedChat({ recipientUid: userUid, recipientWallet: userWallet });
    setShowUsersList(false);
  };

  const handleBackFromChat = () => {
    setSelectedChat(null);
  };

  const handleShowUsersList = () => {
    setShowUsersList(true);
    setSelectedChat(null);
  };

  return (
    <EnhancedBackground>
      {/* Header */}
      <header className="backdrop-blur-xl bg-black/40 border-b border-gray-800/50 p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {/* Logo - use the uploaded image */}
              <img
                src={LOGO_SRC}
                alt="CryptoSafeSend Logo"
                className="w-12 h-12 rounded-xl shadow-lg bg-white/10 border-2 border-blue-300"
                draggable="false"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                CryptoSafeSend
              </h1>
            </div>
            {userWallet && (
              <div className="flex items-center text-gray-300 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-800/50">
                <User className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-sm font-mono">
                  {userWallet.slice(0, 6)}...{userWallet.slice(-4)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <WalletButton />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-black/60 border-gray-700/50 text-white hover:bg-black/80 hover:border-red-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-3 bg-black/40 backdrop-blur-xl rounded-2xl p-3 border border-gray-800/50 shadow-2xl">
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <Button
              onClick={() => {
                setActiveTab('messages');
                setSelectedChat(null);
                setShowUsersList(false);
              }}
              variant={activeTab === 'messages' ? 'default' : 'outline'}
              className={
                activeTab === 'messages'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:scale-105 transition-all duration-300'
                  : 'bg-black/60 border-gray-700/50 text-white hover:bg-black/80 backdrop-blur-sm hover:scale-105 transition-all duration-300'
              }
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Messages
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'messages' ? (
            <>
              <div className="lg:col-span-1">
                {showUsersList ? (
                  <UsersList onSelectUser={handleSelectUser} />
                ) : (
                  <>
                    <div className="mb-4">
                      <Button
                        onClick={handleShowUsersList}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Start New Conversation
                      </Button>
                    </div>
                    <MessagesList onSelectChat={handleSelectChat} />
                  </>
                )}
              </div>
              <div className="lg:col-span-2">
                {selectedChat ? (
                  <ChatWindow
                    recipientUid={selectedChat.recipientUid}
                    recipientWallet={selectedChat.recipientWallet}
                    onBack={handleBackFromChat}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px] bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl">
                    <div className="text-center text-gray-400">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                        <MessageCircle className="relative w-16 h-16 mx-auto opacity-50" />
                      </div>
                      <p className="text-lg font-medium">Select a conversation to start messaging</p>
                      <p className="text-sm mt-2 opacity-75">or start a new conversation with another user</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="lg:col-span-3">
              {activeTab === 'create' && <CreateTransaction />}
              {activeTab === 'claim' && <ClaimFunds />}
              {activeTab === 'cancel' && <CancelTransaction />}
              {activeTab === 'view' && <TransactionViewer />}
            </div>
          )}
        </div>
      </div>
    </EnhancedBackground>
  );
};
