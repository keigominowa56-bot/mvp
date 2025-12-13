import * as admin from 'firebase-admin';

export function initializeFirebase(_token?: string) {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
  return admin;
}