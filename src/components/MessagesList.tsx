import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, User } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, DocumentData, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Chat {
  recipientUid: string;
  recipientWallet: string;
  recipientEmail: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

interface MessagesListProps {
  onSelectChat: (recipientUid: string, recipientWallet: string, recipientEmail: string) => void;
}

export const MessagesList: React.FC<MessagesListProps> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const { currentUser } = useAuth();
  const emailCache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!currentUser) return;

    // Listen to messages where user is sender or recipient
    const messagesQuery = query(
      collection(db, 'messages'),
      where('senderUid', '==', currentUser.uid)
    );

    const recipientQuery = query(
      collection(db, 'messages'),
      where('recipientUid', '==', currentUser.uid)
    );

    const unsubscribe1 = onSnapshot(messagesQuery, (snapshot) => {
      updateChats(snapshot.docs);
    });

    const unsubscribe2 = onSnapshot(recipientQuery, (snapshot) => {
      updateChats(snapshot.docs);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [currentUser]);

  const updateChats = async (docs: DocumentData[]) => {
    const chatMap = new Map<string, Chat>();

    for (const docSnap of docs) {
      const data = docSnap.data();
      const otherUserUid = data.senderUid === currentUser?.uid ? data.recipientUid : data.senderUid;
      const otherUserWallet = data.senderUid === currentUser?.uid ? data.recipientWallet : data.senderWallet;

      // Fetch email if not already cached
      let recipientEmail = emailCache.current[otherUserUid];
      if (!recipientEmail) {
        try {
          const userDoc = await getDoc(doc(db, 'users', otherUserUid));
          recipientEmail = userDoc.exists() ? userDoc.data().email || '' : '';
          emailCache.current[otherUserUid] = recipientEmail;
        } catch {
          recipientEmail = '';
        }
      }

      // Fallback to wallet if no email, but never show 'No wallet'
      if (!recipientEmail) {
        recipientEmail = otherUserWallet && otherUserWallet !== 'No wallet'
          ? `${otherUserWallet.slice(0, 6)}...${otherUserWallet.slice(-4)}`
          : 'Unknown User';
      }

      const existing = chatMap.get(otherUserUid);
      const timestamp = data.timestamp?.toDate() || new Date();

      if (!existing || timestamp > existing.timestamp) {
        chatMap.set(otherUserUid, {
          recipientUid: otherUserUid,
          recipientWallet: otherUserWallet,
          recipientEmail,
          lastMessage: data.messageContent,
          timestamp,
          unreadCount: data.recipientUid === currentUser?.uid && !data.isRead ? 1 : 0
        });
      }
    }

    setChats(Array.from(chatMap.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  return (
    <Card className="glass-effect border-white/20 max-w-2xl mx-auto animate-glow">
      <CardHeader className="text-center">
        <CardTitle className="text-white flex items-center justify-center text-2xl">
          <MessageCircle className="w-6 h-6 mr-3" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chats.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages yet</p>
          </div>
        ) : (
          chats.map((chat) => (
            <Button
              key={chat.recipientUid}
              onClick={() => onSelectChat(chat.recipientUid, chat.recipientWallet, chat.recipientEmail)}
              variant="ghost"
              className="w-full p-4 h-auto text-left bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-white font-medium truncate">
                      {chat.recipientEmail}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm truncate">{chat.lastMessage}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {chat.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {chat.unreadCount > 0 && (
                  <Badge className="bg-blue-600 text-white ml-2">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </Button>
          ))
        )}
      </CardContent>
    </Card>
  );
};
