/**
 * Encryption utilities for secure chat messages using AES-GCM
 * with password-derived keys (PBKDF2) from Firebase Auth UID
 */

// Constants for the encryption
const SALT = new Uint8Array([0x63, 0x72, 0x79, 0x70, 0x74, 0x6f, 0x73, 0x61, 0x66, 0x65]); // 'cryptosafe' in bytes
const ITERATIONS = 100000;
const KEY_LENGTH = 256;

/**
 * Derives an encryption key from a password (Firebase UID) using PBKDF2
 */
async function deriveKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a message using AES-GCM with a key derived from the password
 */
export async function encryptMessage(message: string, password: string): Promise<{ iv: string; data: string }> {
  const key = await deriveKey(password);
  const enc = new TextEncoder();
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt
  const encodedMessage = enc.encode(message);
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encodedMessage
  );

  // Convert to base64
  const ivString = btoa(String.fromCharCode(...iv));
  const dataString = btoa(String.fromCharCode(...new Uint8Array(encryptedData)));

  return {
    iv: ivString,
    data: dataString
  };
}

/**
 * Decrypts a message using AES-GCM with a key derived from the password
 */
export async function decryptMessage(encryptedObj: { iv: string; data: string }, password: string): Promise<string> {
  const key = await deriveKey(password);
  
  // Convert from base64
  const iv = Uint8Array.from(atob(encryptedObj.iv), c => c.charCodeAt(0));
  const encryptedData = Uint8Array.from(atob(encryptedObj.data), c => c.charCodeAt(0));

  // Decrypt
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encryptedData
  );

  // Decode
  const dec = new TextDecoder();
  return dec.decode(decryptedData);
}

// Helper type for encrypted messages
export interface EncryptedMessage {
  iv: string;
  data: string;
}
