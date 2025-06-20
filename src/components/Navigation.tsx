import React from 'react';
import { Send, Download, X, Eye, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'create', label: 'Send', icon: Send, gradient: 'from-green-400 to-blue-500' },
  { id: 'claim', label: 'Claim', icon: Download, gradient: 'from-purple-400 to-pink-500' },
  { id: 'cancel', label: 'Cancel', icon: X, gradient: 'from-red-400 to-pink-500' },
  { id: 'view', label: 'View', icon: Eye, gradient: 'from-blue-400 to-cyan-500' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, gradient: 'from-purple-500 to-pink-600' },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/20 shadow-2xl mb-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={isActive ? 'default' : 'outline'}
            className={
              isActive
                ? `bg-gradient-to-r ${tab.gradient} text-white border-0 hover:scale-105 transition-all duration-300`
                : 'bg-black/40 border-gray-700/50 text-white hover:bg-black/60 backdrop-blur-sm hover:scale-105 transition-all duration-300'
            }
            size="lg"
          >
            <Icon className="w-5 h-5 mr-2" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
};
