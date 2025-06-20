import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, MessageCircle, Search } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface UserData {
  uid: string;
  email: string;
  walletAddress: string;
}

interface UsersListProps {
  onSelectUser: (userUid: string, userWallet: string, userEmail: string) => void;
}

export const UsersList: React.FC<UsersListProps> = ({ onSelectUser }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    if (!currentUser) {
      console.log('No current user, skipping fetch');
      return;
    }

    console.log('Fetching users from Firestore...');
    console.log('Current user UID:', currentUser.uid);
    
    try {
      const usersQuery = query(collection(db, 'users'));
      const snapshot = await getDocs(usersQuery);
      
      console.log('Firestore query successful, documents found:', snapshot.size);
      
      const usersList: UserData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('User document:', doc.id, data);
        
        // Don't include current user in the list
        if (doc.id !== currentUser.uid) {
          usersList.push({
            uid: doc.id,
            email: data.email || 'No email',
            walletAddress: data.walletAddress || 'No wallet'
          });
        }
      });
      
      console.log('Processed users list:', usersList);
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', {
        code: (error as any).code,
        message: (error as any).message
      });
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Current search term:', searchTerm);
  console.log('Filtered users:', filteredUsers);

  return (
    <Card className="bg-gray-900/90 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <User className="w-5 h-5 mr-2" />
          Start New Conversation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by email or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white pl-10"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-gray-400 text-center py-4">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No other users found in the system</p>
              <p className="text-xs mt-2">Make sure other users have registered accounts</p>
              <Button 
                onClick={fetchUsers} 
                variant="outline" 
                size="sm" 
                className="mt-3 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                Refresh Users
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No users match your search</p>
              <p className="text-xs mt-2">Try searching by email or wallet address</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Button
                key={user.uid}
                onClick={() => onSelectUser(user.uid, user.walletAddress, user.email)}
                variant="ghost"
                className="w-full p-4 h-auto text-left bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/30"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-white font-medium truncate">
                        {user.email}
                      </span>
                    </div>
                    {user.walletAddress && user.walletAddress !== 'No wallet' && (
                      <p className="text-gray-400 text-sm truncate">
                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                      </p>
                    )}
                  </div>
                  <MessageCircle className="w-5 h-5 text-blue-400 ml-2" />
                </div>
              </Button>
            ))
          )}
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Total users: {users.length} | Filtered: {filteredUsers.length}
        </div>
      </CardContent>
    </Card>
  );
};
