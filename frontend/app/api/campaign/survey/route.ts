import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Firebase Admin SDKの初期化
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      const serviceAccount = {
        projectId,
        clientEmail,
        privateKey,
      };

      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    } else {
      // 環境変数が設定されていない場合は、デフォルトの認証情報を使用
      return admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Firebase Admin SDKを初期化
    const app = initializeFirebaseAdmin();
    const firestore = admin.firestore(app);

    // リクエストボディを取得
    const body = await request.json();
    const { uid, email, emailVerified, ...surveyData } = body;

    // 認証トークンを検証
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '認証トークンが必要です' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { message: '無効な認証トークンです' },
        { status: 401 }
      );
    }

    // UIDが一致するか確認
    if (decodedToken.uid !== uid) {
      return NextResponse.json(
        { message: '認証情報が一致しません' },
        { status: 403 }
      );
    }

    // IPアドレスとUser-Agentを取得
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    // Next.jsのAPIルートではrequest.ipが利用できないため、ヘッダーから取得
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Firestoreに保存
    const responseData = {
      uid,
      email,
      emailVerified,
      ...surveyData,
      ipAddress,
      userAgent,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await firestore.collection('responses').add(responseData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      { message: error.message || 'アンケートの送信に失敗しました' },
      { status: 500 }
    );
  }
}

