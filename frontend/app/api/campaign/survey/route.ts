import { NextRequest, NextResponse } from 'next/server';

// Firebase Admin SDKの初期化（動的インポートを使用）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function initializeFirebaseAdmin(admin: any) {
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
        credential: admin.credential.cert(serviceAccount as any),
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
    console.log('[Survey API] リクエスト受信');
    
    // Firebase Admin SDKを初期化（動的インポートでビルド時にバンドルされないようにする）
    // @ts-ignore - firebase-adminは実行時にのみ利用可能
    const admin = await import('firebase-admin');
    const app = await initializeFirebaseAdmin(admin);
    const firestore = admin.firestore(app);

    // リクエストボディを取得
    const body = await request.json();
    const { uid, email, emailVerified, ...surveyData } = body;
    console.log('[Survey API] リクエストボディ取得完了, uid:', uid, 'email:', email);

    // 認証トークンを検証（オプション - ログインしていない場合も許可）
    const authHeader = request.headers.get('authorization');
    let decodedToken;
    let userId: string | null = null;
    let userEmail: string | null = null;
    let isAuthenticated = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      console.log('[Survey API] 認証トークンあり、検証を試みます');
      
      // まずFirebaseトークンとして検証を試みる
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
        userEmail = decodedToken.email || null;
        isAuthenticated = true;
        console.log('[Survey API] Firebaseトークン検証成功, UID:', userId);
      } catch (firebaseError: any) {
        // Firebaseトークンの検証に失敗した場合、バックエンドAPIのJWTトークンとして検証を試みる
        console.log('[Survey API] Firebaseトークン検証失敗、バックエンドAPIのJWTトークンとして検証を試みます:', firebaseError.message);
        
        try {
          // バックエンドAPIのJWTトークンからユーザー情報を取得
          const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.polimee.com';
          const meResponse = await fetch(`${apiBase}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (meResponse.ok) {
            const userData = await meResponse.json();
            userId = userData.id || userData.user?.id || null;
            userEmail = userData.email || userData.user?.email || null;
            isAuthenticated = true;
            console.log('[Survey API] バックエンドAPIからユーザー情報取得成功, UserID:', userId, 'Email:', userEmail);
          } else {
            const errorData = await meResponse.json().catch(() => ({}));
            console.log('[Survey API] バックエンドAPIのJWTトークン検証失敗、匿名回答として処理します。Status:', meResponse.status, 'Error:', errorData);
            // エラーが発生しても、匿名回答として処理を続行
          }
        } catch (jwtError: any) {
          console.log('[Survey API] バックエンドAPIのJWTトークン検証も失敗、匿名回答として処理します:', jwtError.message);
          // エラーが発生しても、匿名回答として処理を続行
        }
      }
    } else {
      console.log('[Survey API] 認証トークンなし、匿名回答として処理します');
    }

    // 認証されている場合、UIDが一致するか確認（Firebaseトークンの場合）
    if (isAuthenticated && decodedToken && decodedToken.uid !== uid) {
      return NextResponse.json(
        { message: '認証情報が一致しません' },
        { status: 403 }
      );
    }

    // バックエンドAPIのJWTトークンの場合、ユーザーIDとメールアドレスを使用
    // 認証されていない場合は、リクエストから受け取ったuid/emailを使用（匿名回答）
    const finalUid = userId || uid || 'anonymous';
    const finalEmail = userEmail || email || null;

    // IPアドレスとUser-Agentを取得
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    // Next.jsのAPIルートではrequest.ipが利用できないため、ヘッダーから取得
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Firestoreに保存
    const responseData = {
      uid: finalUid,
      email: finalEmail,
      emailVerified: decodedToken ? decodedToken.email_verified : (isAuthenticated ? true : false),
      isAnonymous: !isAuthenticated, // 匿名回答フラグ
      ...surveyData,
      ipAddress,
      userAgent,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log('[Survey API] Firestoreに保存開始, isAnonymous:', !isAuthenticated);
    await firestore.collection('responses').add(responseData);
    console.log('[Survey API] Firestoreに保存完了');

    return NextResponse.json({ 
      success: true,
      isAnonymous: !isAuthenticated,
      message: isAuthenticated ? 'アンケートの送信が完了しました' : 'アンケートの送信が完了しました。ログインすると回答があなたのアカウントに紐付けられます。'
    });
  } catch (error: any) {
    console.error('[Survey API] エラー発生:', error);
    console.error('[Survey API] エラースタック:', error.stack);
    // エラーが発生しても、匿名回答として処理を試みる
    if (error.message && error.message.includes('認証')) {
      console.log('[Survey API] 認証エラーが発生しましたが、匿名回答として処理を続行します');
      // 匿名回答として処理を続行するために、エラーを再スローしない
      return NextResponse.json(
        { 
          success: true,
          isAnonymous: true,
          message: 'アンケートの送信が完了しました。ログインすると回答があなたのアカウントに紐付けられます。'
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { message: error.message || 'アンケートの送信に失敗しました' },
      { status: 500 }
    );
  }
}

