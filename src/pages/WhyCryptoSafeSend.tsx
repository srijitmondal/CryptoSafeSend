import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Zap, ArrowLeft, CheckCircle, Star, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WhyCryptoSafeSend = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
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

      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Large Gradient Orbs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-cyan-500/5 to-blue-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>

        {/* Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 border-b border-gray-800/50 backdrop-blur-xl bg-black/30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  CryptoSafeSend
                </h1>
                <p className="text-gray-400 text-sm flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Secure ETH transfers with passcode protection
                </p>
              </div>
            </Link>
            <Link to="/">
              <Button variant="outline" className="bg-black/40 border-gray-700/50 text-white hover:bg-black/60 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-20">
              <div className="relative mb-8">
                <h1 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-fade-in" style={{ lineHeight: 1.2 }}>
                  Why Choose CryptoSafeSend?
                </h1>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>
              </div>
              <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in">
                The most <span className="text-blue-400 font-semibold">secure</span> and <span className="text-purple-400 font-semibold">user-friendly</span> way to send Ethereum with advanced protection mechanisms
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
              <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 group">
                <CardHeader className="pb-4">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300">
                      <Lock className="w-16 h-16 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-2xl text-center group-hover:text-blue-300 transition-colors">Passcode Protected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6 text-center leading-relaxed">
                    Every transaction is secured with a unique passcode that only you and the recipient know. No one else can access the funds without it.
                  </p>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Encrypted passcode protection</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Only recipient can claim</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Zero knowledge proof</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 group">
                <CardHeader className="pb-4">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-300">
                      <Shield className="w-16 h-16 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-2xl text-center group-hover:text-purple-300 transition-colors">Smart Contract</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6 text-center leading-relaxed">
                    Built on battle-tested Ethereum smart contracts that ensure your funds are secure and transactions are immutable.
                  </p>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Audited smart contracts</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Decentralized execution</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Immutable transactions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50 hover:border-pink-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/10 group">
                <CardHeader className="pb-4">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-2xl group-hover:from-pink-500/30 group-hover:to-pink-600/30 transition-all duration-300">
                      <Zap className="w-16 h-16 text-pink-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-2xl text-center group-hover:text-pink-300 transition-colors">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6 text-center leading-relaxed">
                    Optimized for speed without compromising security. Send and receive ETH in seconds with minimal gas fees.
                  </p>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Instant transaction creation</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Optimized gas usage</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Real-time notifications</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Section */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-10 border border-gray-800/50 mb-16 hover:border-gray-700/50 transition-all duration-300">
              <h2 className="text-4xl font-bold text-white mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Additional Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                      🔒
                    </div>
                    Enhanced Security
                  </h3>
                  <ul className="space-y-4 text-gray-300 text-lg">
                    <li className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-yellow-400" />
                      End-to-end encryption
                    </li>
                    <li className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-yellow-400" />
                      No central authority needed
                    </li>
                    <li className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-yellow-400" />
                      Funds locked until claimed
                    </li>
                    <li className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-yellow-400" />
                      Automatic refund after timeout
                    </li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-4">
                      ⚡
                    </div>
                    User Experience
                  </h3>
                  <ul className="space-y-4 text-gray-300 text-lg">
                    <li className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-yellow-400" />
                      Simple, intuitive interface
                    </li>
                    <li className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-yellow-400" />
                      No complex wallet setup
                    </li>
                    <li className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-yellow-400" />
                      Transaction tracking
                    </li>
                    <li className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-yellow-400" />
                      Mobile-friendly design
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Ready to Send Securely?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of users who trust CryptoSafeSend for their secure Ethereum transfers.
              </p>
              <Link to="/">
                <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-12 py-4 text-xl rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                  <Sparkles className="w-5 h-5 mr-3" />
                  Start Sending Now
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WhyCryptoSafeSend;
