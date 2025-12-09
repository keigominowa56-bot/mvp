import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Read config from env
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function hasValidConfig(): boolean {
  // Check if critical fields are present
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let isFirebaseEnabled = false;

try {
  const enableFirebase = process.env.NEXT_PUBLIC_ENABLE_FIREBASE_AUTH === 'true';
  
  if (enableFirebase && hasValidConfig()) {
    // Ensure all config values are strings (not undefined)
    const config = {
      apiKey: firebaseConfig.apiKey as string,
      authDomain: firebaseConfig.authDomain as string,
      projectId: firebaseConfig.projectId as string,
      storageBucket: firebaseConfig.storageBucket || `${firebaseConfig.projectId}.appspot.com`,
      messagingSenderId: firebaseConfig.messagingSenderId as string,
      appId: firebaseConfig.appId as string,
    };
    
    console.log('Initializing Firebase with config:', {
      apiKey: config.apiKey?.substring(0, 10) + '...',
      authDomain: config.authDomain,
      projectId: config.projectId,
      appId: config.appId,
    });
    
    app = initializeApp(config);
    auth = getAuth(app);
    isFirebaseEnabled = true;
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase not initialized:', {
      enableFirebase,
      hasValidConfig: hasValidConfig(),
      envVars: {
        apiKey: !!firebaseConfig.apiKey,
        authDomain: !!firebaseConfig.authDomain,
        projectId: !!firebaseConfig.projectId,
        appId: !!firebaseConfig.appId,
      },
    });
  }
} catch (error: any) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
  });
  app = null;
  auth = null;
  isFirebaseEnabled = false;
}

export { auth, isFirebaseEnabled };
export default app;
