# Firebase Setup Guide

## The Error: `auth/configuration-not-found`

This error means **Firebase Authentication is not enabled** in your Firebase Console.

## Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **seijika-com**
3. Click **Authentication** in the left sidebar
4. Click **Get Started** (if you haven't set up Authentication yet)
5. Go to the **Sign-in method** tab
6. Click on **Email/Password**
7. **Enable** the first toggle (Email/Password)
8. Click **Save**

## Step 2: Verify Your Environment Variables

Make sure your `frontend/.env.local` file contains:

```env
NEXT_PUBLIC_ENABLE_FIREBASE_AUTH=true
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDohRRkWVo2hUK4xzsLKUhAz_SJHbmA37M
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seijika-com.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seijika-com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seijika-com.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=349199737379
NEXT_PUBLIC_FIREBASE_APP_ID=1:349199737379:web:0146142a03bc1741fec796
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Step 3: Restart Your Development Server

After updating `.env.local`:

1. **Stop** the frontend server (Ctrl+C)
2. **Delete** the `.next` folder: `rm -rf frontend/.next` (Linux/Mac) or `rmdir /s frontend\.next` (Windows)
3. **Restart**: `cd frontend && npm run dev`

## Step 4: Verify in Browser Console

Open your browser's developer console (F12) and check:
- You should see: `✅ Firebase initialized successfully`
- If you see warnings, check what variables are missing

## Still Having Issues?

1. **Check API Key Restrictions**: In Google Cloud Console, make sure your API key is not restricted or is allowed for your domain
2. **Verify Project ID**: Make sure `seijika-com` is the correct project ID
3. **Check Auth Domain**: The authDomain must match exactly: `seijika-com.firebaseapp.com`

## Common Issues

- **"API key not valid"**: Your API key might be restricted. Check Google Cloud Console → APIs & Services → Credentials
- **"Network request failed"**: Check your internet connection and firewall settings
- **"Project not found"**: Verify the project ID matches your Firebase project

