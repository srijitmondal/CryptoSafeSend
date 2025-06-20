import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Zap, Sparkles, Star, LogOut } from 'lucide-react';
import { WalletProvider } from '@/contexts/WalletContext';
import { WalletButton } from '@/components/WalletButton';
import { Navigation } from '@/components/Navigation';
import { CreateTransaction } from '@/components/CreateTransaction';
import { ClaimFunds } from '@/components/ClaimFunds';
import { CancelTransaction } from '@/components/CancelTransaction';
import { TransactionViewer } from '@/components/TransactionViewer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessagesList } from '@/components/MessagesList';
import { ChatWindow } from '@/components/ChatWindow';
import { UsersList } from '@/components/UsersList';

const LOGO_SRC = "/lovable-uploads/87763936-c75c-476b-8bf3-487950a7530d.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  // Chat state
  const [selectedChat, setSelectedChat] = useState<{
    recipientUid: string;
    recipientWallet: string;
    recipientEmail: string;
  } | null>(null);
  const [showUsersList, setShowUsersList] = useState(false);

  // Chat handlers
  const handleSelectChat = (recipientUid: string, recipientWallet: string, recipientEmail: string) => {
    setSelectedChat({ recipientUid, recipientWallet, recipientEmail });
    setActiveTab('messages');
    setShowUsersList(false);
  };
  const handleSelectUser = (userUid: string, userWallet: string, userEmail: string) => {
    setSelectedChat({ recipientUid: userUid, recipientWallet: userWallet, recipientEmail: userEmail });
    setShowUsersList(false);
  };
  const handleBackFromChat = () => {
    setSelectedChat(null);
  };
  const handleShowUsersList = () => {
    setShowUsersList(true);
    setSelectedChat(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateTransaction />;
      case 'claim':
        return <ClaimFunds />;
      case 'cancel':
        return <CancelTransaction />;
      case 'view':
        return <TransactionViewer />;
      default:
        return <CreateTransaction />;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <WalletProvider>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Mouse Following Shadow */}
        <div 
          className="fixed pointer-events-none z-20 w-96 h-96 rounded-full opacity-30 blur-3xl transition-all duration-75 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.3) 35%, rgba(236, 72, 153, 0.2) 70%, transparent 100%)',
          }}
        />

        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          {/* Animated Grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10">
          {/* Header */}
          <header className="p-6 border-b border-gray-800/50 backdrop-blur-xl bg-black/30">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
              <div className="relative">
                {/* Logo Image */}
                <img
                  src={LOGO_SRC}
                  alt="CryptoSafeSend Logo"
                  className="w-14 h-14 rounded-2xl shadow-2xl bg-white/10 p-2 border-2 border-blue-300"
                  draggable="false"
                />
              </div>
                <div>
                  {/* Updated: Make CryptoSafeSend title clickable */}
                  <Link 
                    to="/why-cryptosafesend" 
                    className="flex items-center space-x-4 hover:opacity-80 transition-opacity cursor-pointer"
                    aria-label="Learn more about CryptoSafeSend"
                  >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent hover:from-blue-200 hover:via-purple-200 hover:to-pink-200 transition-all duration-300 cursor-pointer">
                      CryptoSafeSend
                    </h1>
                  </Link>
                  <p className="text-gray-400 text-sm flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Secure ETH transfers with passcode protection
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <WalletButton />
                {currentUser && (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-black/60 border-gray-700/50 text-white hover:bg-black/80 hover:border-red-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Hero Section */}
          
          <section className="px-6 py-16 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="relative mb-8">
                <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-fade-in" style={{ lineHeight: 1.2 }}>
                  Send ETH Securely
                </h2>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Star className="w-6 h-6 text-yellow-400 animate-bounce" />
                </div>
              </div>
              {/* Military-grade encryption badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-500/30 mx-auto mb-8">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Military-grade encryption</span>
              </div>
              
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in">
                Protect your Ethereum transfers with <Link to="/why-cryptosafesend" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors underline decoration-blue-400/30 hover:decoration-blue-300/50">military-grade encryption</Link>. 
                Only recipients with the correct secret can claim the funds.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {/* Updated: Passcode Protected Card */}
                <Link 
                  to="/why-passcode-protected" 
                  className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-3xl"
                  aria-label="Learn about passcode protection"
                >
                  <div className="relative p-8 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-800/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300">
                          <Lock className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">Passcode Protected</h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Each transaction is secured with a unique passcode</p>
                    </div>
                  </div>
                </Link>
                
                {/* Updated: Smart Contract Card */}
                <Link 
                  to="/why-smart-contract" 
                  className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-3xl"
                  aria-label="Learn about smart contract security"
                >
                  <div className="relative p-8 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-800/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-300">
                          <Shield className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">Smart Contract</h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Powered by secure Ethereum smart contracts</p>
                    </div>
                  </div>
                </Link>
                
                {/* Updated: Lightning Fast Card */}
                <Link 
                  to="/why-lightning-fast" 
                  className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-3xl"
                  aria-label="Learn about our fast interface"
                >
                  <div className="relative p-8 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-800/50 hover:border-pink-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/10 cursor-pointer h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-2xl group-hover:from-pink-500/30 group-hover:to-pink-600/30 transition-all duration-300">
                          <Zap className="w-12 h-12 text-pink-400 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors">Lightning Fast</h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Simple interface for sending and claiming funds</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <main className="px-6 pb-12">
            <div className="max-w-2xl mx-auto">
              <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="animate-fade-in">
                {activeTab === 'messages' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      {showUsersList ? (
                        <UsersList onSelectUser={(uid, wallet, email) => handleSelectUser(uid, wallet, email)} />
                      ) : (
                        <>
                          <div className="mb-4">
                            <Button
                              onClick={handleShowUsersList}
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:scale-105 transition-all duration-300"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Start New Conversation
                            </Button>
                          </div>
                          <MessagesList onSelectChat={(uid, wallet, email) => handleSelectChat(uid, wallet, email)} />
                        </>
                      )}
                    </div>
                    <div className="lg:col-span-2">
                      {selectedChat ? (
                        <ChatWindow
                          recipientUid={selectedChat.recipientUid}
                          recipientWallet={selectedChat.recipientWallet}
                          recipientEmail={selectedChat.recipientEmail}
                          onBack={handleBackFromChat}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-[600px] bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl">
                          <div className="text-center text-gray-400">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                              <LogOut className="relative w-16 h-16 mx-auto opacity-50" />
                            </div>
                            <p className="text-lg font-medium">Select a conversation to start messaging</p>
                            <p className="text-sm mt-2 opacity-75">or start a new conversation with another user</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  renderActiveComponent()
                )}
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="px-6 py-12 border-t border-gray-800/50 mt-12 backdrop-blur-xl bg-black/20">
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-gray-500 text-sm flex items-center justify-center">
                Built with <span className="text-red-400 mx-1 animate-pulse">💜 by SpiderStack</span> for secure Ethereum transfers. 
                <Shield className="w-4 h-4 ml-2 text-blue-400" />
              </p>
            </div>
          </footer>
        </div>
      </div>
    </WalletProvider>
  );
};

export default Index;