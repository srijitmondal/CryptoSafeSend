
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

interface AuthContextType {
  currentUser: User | null;
  userWallet: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.uid);
      setCurrentUser(user);
      if (user) {
        // Get user's wallet from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          console.log('User document exists:', userDoc.exists());
          console.log('User document data:', userDoc.data());
          
          if (userDoc.exists()) {
            setUserWallet(userDoc.data().walletAddress || null);
          } else {
            // If user document doesn't exist, create it
            console.log('Creating missing user document for:', user.uid);
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              createdAt: new Date(),
              walletAddress: null
            });
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      } else {
        setUserWallet(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    console.log('Registering new user...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created, creating Firestore document...');
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      createdAt: new Date(),
      walletAddress: null
    });
    console.log('User document created successfully');
  };

  const logout = async () => {
    await signOut(auth);
  };

  const connectWallet = async () => {
    if (!currentUser) return;
    
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];
    
    // Update user document with wallet address
    await setDoc(doc(db, 'users', currentUser.uid), {
      walletAddress
    }, { merge: true });
    
    setUserWallet(walletAddress);
  };

  const value = {
    currentUser,
    userWallet,
    loading,
    login,
    register,
    logout,
    connectWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
