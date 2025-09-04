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
  or,
  and
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { encryptMessage, decryptMessage } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  senderUid: string;
  senderWallet: string;
  messageContent: string;
  timestamp: Date;
  isRead: boolean;
  iv?: string; // For encrypted messages
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
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map());
  const { currentUser, userWallet } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Decrypt a single message
  const decryptSingleMessage = async (message: Message): Promise<void> => {
    if (!currentUser || !message.iv) return;
    
    try {
      // Skip if we've already decrypted this message or if it's a pending message
      if (decryptedMessages.has(message.id) || message.id.startsWith('pending-')) {
        return;
      }

      // For messages we sent: use recipient's UID as key (we encrypted with their UID)
      // For messages we received: use our UID as key (sender encrypted with our UID)
      const decryptionKey = message.senderUid === currentUser.uid ? recipientUid : currentUser.uid;

      const decrypted = await decryptMessage(
        { 
          iv: message.iv, 
          data: message.messageContent 
        }, 
        decryptionKey
      );

      // Update state immediately when decryption succeeds
      setDecryptedMessages(prev => {
        const updated = new Map(prev);
        updated.set(message.id, decrypted);
        return updated;
      });
    } catch (error) {
      console.error('Failed to decrypt message:', {
        error,
        messageId: message.id,
        sender: message.senderUid,
      });
      
      // Show error state in UI
      setDecryptedMessages(prev => {
        const updated = new Map(prev);
        updated.set(message.id, '[Failed to decrypt message]');
        return updated;
      });
    }
  };

  // Effect to handle message decryption
  useEffect(() => {
    const decryptMessages = async () => {
      const promises = messages
        .filter(message => !decryptedMessages.has(message.id) && message.messageContent && message.iv)
        .map(message => decryptSingleMessage(message));
      
      // Decrypt all messages in parallel for better performance
      await Promise.all(promises);
    };
    
    decryptMessages();
  }, [messages]); // Re-run when messages change

  useEffect(() => {
    if (!currentUser) return;

    console.log('Setting up messages listener:', {
      currentUserUid: currentUser.uid,
      recipientUid: recipientUid
    });

    // Create a query for messages in both directions
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
      // Process all changes at once for better performance
      const changes = snapshot.docChanges();
      const pendingDecryption: Message[] = [];
      const readUpdates: string[] = [];

      // Batch update messages
      setMessages(prev => {
        let updated = [...prev];
        
        changes.forEach(change => {
          const data = change.doc.data();
          const messageId = change.doc.id;

          // Queue read status update if needed
          if (change.type === 'added' && 
              data.senderUid === recipientUid && 
              !data.isRead) {
            readUpdates.push(messageId);
          }

          const message: Message = {
            id: messageId,
            senderUid: data.senderUid,
            senderWallet: data.senderWallet || 'No wallet',
            messageContent: data.messageContent,
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead,
            iv: data.iv
          };

          if (change.type === 'added') {
            // Skip if it's our own pending message
            if (!message.id.startsWith('pending-') && 
                !updated.some(m => m.id === messageId)) {
              // Find correct position by timestamp
              const index = updated.findIndex(m => m.timestamp > message.timestamp);
              if (index === -1) {
                updated.push(message);
              } else {
                updated.splice(index, 0, message);
              }
              
              // Queue for decryption if needed
              if (message.messageContent && message.iv) {
                pendingDecryption.push(message);
              }
            }
          } else if (change.type === 'modified') {
            // Update existing message
            updated = updated.map(m => m.id === messageId ? { ...m, ...message } : m);
          } else if (change.type === 'removed') {
            // Remove message
            updated = updated.filter(m => m.id !== messageId);
            setDecryptedMessages(prev => {
              const newMap = new Map(prev);
              newMap.delete(messageId);
              return newMap;
            });
          }
        });

        return updated;
      });

      // Start decryption in parallel for all new messages
      if (pendingDecryption.length > 0) {
        Promise.all(pendingDecryption.map(decryptSingleMessage))
          .catch(error => console.error('Failed to decrypt messages:', error));
      }

      // Update read status in batch
      readUpdates.forEach(messageId => {
        updateDoc(doc(db, 'messages', messageId), { isRead: true })
          .catch(error => console.error('Failed to mark message as read:', messageId, error));
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
    if (!newMessage.trim() || !currentUser) return;

    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    // Create optimistic message with local timestamp
    const now = new Date();
    const optimisticId = `pending-${now.getTime()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      senderUid: currentUser.uid,
      senderWallet: userWallet || 'No wallet',
      messageContent: messageToSend,
      timestamp: now,
      isRead: false
    };

    // Show message instantly
    setMessages(prev => [...prev, optimisticMessage]);
    setDecryptedMessages(prev => new Map(prev).set(optimisticId, messageToSend));

    // Start encryption and sending process
    let encryptedData: { data: string; iv: string };
    try {
      // Start encryption immediately
      const encryptPromise = encryptMessage(messageToSend, recipientUid);
      setSending(true);

      // While encrypting, scroll to bottom and give instant feedback
      scrollToBottom();
      encryptedData = await encryptPromise;

      const messageData = {
        senderUid: currentUser.uid,
        senderWallet: userWallet || 'No wallet',
        recipientUid,
        recipientWallet: recipientWallet || 'No wallet',
        messageContent: encryptedData.data,
        iv: encryptedData.iv,
        timestamp: serverTimestamp(),
        isRead: false,
        localTimestamp: now.getTime(), // Store local timestamp for ordering
      };
      
      // Send to Firebase
      const docRef = await addDoc(collection(db, 'messages'), messageData);

      // Transfer the decrypted content to the real message ID
      setDecryptedMessages(prev => {
        const updated = new Map(prev);
        if (prev.has(optimisticId)) { // Only if the optimistic message still exists
          updated.set(docRef.id, messageToSend);
          updated.delete(optimisticId);
        }
        return updated;
      });

      // Remove the optimistic message (will be replaced by real one from Firebase)
      setMessages(prev => prev.filter(m => m.id !== optimisticId));

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      
      // Keep the message in the input for retry
      setNewMessage(messageToSend);
      
      // Remove failed optimistic message
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      setDecryptedMessages(prev => {
        const updated = new Map(prev);
        updated.delete(optimisticId);
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  const getMessageContent = (message: Message) => {
    return decryptedMessages.get(message.id) || 'Decrypting...';
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
                          <p className="text-sm leading-relaxed break-words">
                            {getMessageContent(message)}
                          </p>
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
