import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, ArrowLeft } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc,
  DocumentData,
  or,
  and
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  senderUid: string;
  senderWallet: string;
  messageContent: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatWindowProps {
  recipientUid: string;
  recipientWallet: string;
  recipientEmail: string;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  recipientUid, 
  recipientWallet, 
  recipientEmail,
  onBack 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { currentUser, userWallet } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentUser) return;

    console.log('Setting up messages listener for chat between:', currentUser.uid, 'and', recipientUid);

    // Create a better query that specifically targets messages between these two users
    const messagesQuery = query(
      collection(db, 'messages'),
      or(
        and(
          where('senderUid', '==', currentUser.uid),
          where('recipientUid', '==', recipientUid)
        ),
        and(
          where('senderUid', '==', recipientUid),
          where('recipientUid', '==', currentUser.uid)
        )
      ),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      console.log('Messages snapshot received, size:', snapshot.size);
      console.log('Snapshot changes:', snapshot.docChanges());
      
      const messagesList: Message[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Processing message:', doc.id, data);
        
        messagesList.push({
          id: doc.id,
          senderUid: data.senderUid,
          senderWallet: data.senderWallet || 'No wallet',
          messageContent: data.messageContent,
          timestamp: data.timestamp?.toDate() || new Date(),
          isRead: data.isRead
        });
      });
      
      console.log('Final messages list:', messagesList);
      setMessages(messagesList);
      
      // Mark messages as read
      messagesList.forEach(async (message) => {
        if (message.senderUid === recipientUid && !message.isRead) {
          await updateDoc(doc(db, 'messages', message.id), { isRead: true });
        }
      });
    }, (error) => {
      console.error('Error in messages listener:', error);
    });

    return unsubscribe;
  }, [currentUser, recipientUid]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Send message clicked');
    console.log('New message:', newMessage);
    console.log('Current user:', currentUser?.uid);
    console.log('User wallet:', userWallet);
    console.log('Recipient UID:', recipientUid);
    console.log('Recipient wallet:', recipientWallet);

    if (!newMessage.trim()) {
      console.log('Message is empty, not sending');
      return;
    }
    
    if (!currentUser) {
      console.log('No current user, not sending');
      return;
    }

    setSending(true);
    try {
      console.log('Attempting to send message to Firestore...');
      const messageData = {
        senderUid: currentUser.uid,
        senderWallet: userWallet || 'No wallet',
        recipientUid,
        recipientWallet: recipientWallet || 'No wallet',
        messageContent: newMessage.trim(),
        timestamp: serverTimestamp(),
        isRead: false
      };
      
      console.log('Message data:', messageData);
      
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      console.log('Message sent successfully with ID:', docRef.id);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        code: (error as any).code,
        message: (error as any).message
      });
    }
    setSending(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-gray-800/50 h-[600px] flex flex-col">
      <CardHeader className="border-b border-gray-800/50 py-4">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="mr-3 text-gray-400 hover:text-white hover:bg-black/40 p-2 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-1">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold text-lg">{recipientEmail}</span>
              </div>
              <div className="text-sm font-medium">
                {recipientWallet?.slice(0, 6)}...{recipientWallet?.slice(-4)}
              </div>
              <div className="text-xs text-gray-400">
                {messages.length > 0 ? 'Active' : 'Start conversation'}
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-3 min-h-full flex flex-col justify-end">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-12 flex-1 flex items-center justify-center">
                <div>
                  <div className="w-20 h-20 bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800/50">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg mb-2 text-white">No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isOwnMessage = message.senderUid === currentUser?.uid;
                  const showTimestamp = index === 0 || 
                    (messages[index - 1] && 
                     Math.abs(message.timestamp.getTime() - messages[index - 1].timestamp.getTime()) > 5 * 60 * 1000);

                  return (
                    <div key={message.id} className="space-y-2">
                      {showTimestamp && (
                        <div className="text-center">
                          <span className="text-xs text-gray-400 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-2xl backdrop-blur-sm relative ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-black/40 text-gray-100 border border-gray-700/50'
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">{message.messageContent}</p>
                          <div className={`flex items-center justify-end mt-2 space-x-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            <span className="text-xs opacity-75">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {isOwnMessage && (
                              <span className="text-xs opacity-75">
                                {message.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-gray-800/50 bg-black/20 backdrop-blur-sm">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-black/40 border-gray-700/50 text-white placeholder-gray-400 rounded-full px-4 h-12 backdrop-blur-sm"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full w-12 h-12 p-0 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
