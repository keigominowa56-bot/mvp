// admin-frontend/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDOBQwhVPtlDrC27U1DvD_X-58cTdOTmy4",
  authDomain: "seiji-a35f4.firebaseapp.com",
  projectId: "seiji-a35f4",
  storageBucket: "seiji-a35f4.firebasestorage.app",
  messagingSenderId: "1095298016246",
  appId: "1:1095298016246:web:5ef8a8cea5e5e9bcae5dd7",
  measurementId: "G-T414QH66R4"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
