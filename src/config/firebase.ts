
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFATJ2EtwqN2qra8glAqX1MMMWGKoX_sU",
  authDomain: "cryptosafesend.firebaseapp.com",
  projectId: "cryptosafesend",
  storageBucket: "cryptosafesend.firebasestorage.app",
  messagingSenderId: "637909655388",
  appId: "1:637909655388:web:c0ba9bfb66d4e9f19feb99",
  measurementId: "G-DXPY82VDNJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
