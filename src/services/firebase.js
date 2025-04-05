// Firebase configuration and initialization
import { initializeApp as firebaseInitializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration
// For production, these values should be environment variables
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API Key or use environment variables
  authDomain: "finance-management-app.firebaseapp.com",
  projectId: "finance-management-app",
  storageBucket: "finance-management-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-ABCDEFGHIJ"
};

// Initialize Firebase
let app;
let auth;
let firestore;
let storage;
let functions;

/**
 * Initialize Firebase services
 */
export const initializeApp = () => {
  try {
    // Initialize Firebase app if not already initialized
    if (!app) {
      app = firebaseInitializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
      
      // Initialize Firebase services
      auth = getAuth(app);
      firestore = getFirestore(app);
      storage = getStorage(app);
      functions = getFunctions(app);
      
      // Connect to emulators in development environment
      if (process.env.NODE_ENV === 'development') {
        connectToEmulators();
      }
    }
    
    return { app, auth, firestore, storage, functions };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

/**
 * Connect to Firebase emulators in development environment
 */
const connectToEmulators = () => {
  try {
    // Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    // Firestore emulator
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    
    // Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    
    // Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
};

/**
 * Get Firebase Auth instance
 */
export const getFirebaseAuth = () => {
  if (!auth) {
    initializeApp();
  }
  return auth;
};

/**
 * Get Firestore instance
 */
export const getFirebaseFirestore = () => {
  if (!firestore) {
    initializeApp();
  }
  return firestore;
};

/**
 * Get Firebase Storage instance
 */
export const getFirebaseStorage = () => {
  if (!storage) {
    initializeApp();
  }
  return storage;
};

/**
 * Get Firebase Functions instance
 */
export const getFirebaseFunctions = () => {
  if (!functions) {
    initializeApp();
  }
  return functions;
};

export default {
  initializeApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseStorage,
  getFirebaseFunctions
};