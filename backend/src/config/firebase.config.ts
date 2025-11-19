import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const initializeFirebase = (configService: ConfigService) => {
  const projectId = configService.get('FIREBASE_PROJECT_ID');
  const privateKey = configService.get('FIREBASE_PRIVATE_KEY');
  const clientEmail = configService.get('FIREBASE_CLIENT_EMAIL');

  // If Firebase credentials are not provided, return a mock object for development
  if (!projectId || !privateKey || !clientEmail || 
      projectId === 'your_firebase_project_id' ||
      privateKey === 'your_firebase_private_key') {
    console.warn('Firebase credentials not configured. Using mock Firebase admin for development.');
    return {
      auth: () => ({
        verifyIdToken: async (token: string) => {
          // Mock token verification for development
          return {
            uid: 'mock-user-id',
            email: 'demo@example.com',
            name: 'Demo User',
            picture: null,
          };
        },
      }),
    };
  }

  const serviceAccount = {
    type: 'service_account',
    project_id: projectId,
    private_key_id: configService.get('FIREBASE_PRIVATE_KEY_ID'),
    private_key: privateKey.replace(/\\n/g, '\n'),
    client_email: clientEmail,
    client_id: configService.get('FIREBASE_CLIENT_ID'),
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${clientEmail}`,
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: projectId,
    });
  }

  return admin;
};
