import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Politician } from 'src/entities/politician.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from './firebase.provider';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Politician) private readonly politicians: Repository<Politician>,
    @Inject(FIREBASE_ADMIN) private readonly firebaseAdmin: admin.app.App,
  ) {}

  async adminSignup(email: string, password: string) {
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new UnauthorizedException('このメールアドレスは既に登録されています');
    const passwordHash = await bcrypt.hash(password, 10);
    const u = this.users.create({ email, passwordHash, role: 'admin', status: 'active' } as any);
    await this.users.save(u);
    return { ok: true };
  }

  async politicianSignup(input: { email: string; password: string; name: string; regionId?: string | null; partyId?: string | null }) {
    const existing = await this.users.findOne({ where: { email: input.email } });
    if (existing) throw new UnauthorizedException('このメールアドレスは既に登録されています');
    const passwordHash = await bcrypt.hash(input.password, 10);
    const u = this.users.create({ email: input.email, passwordHash, role: 'politician', status: 'pending' } as any);
    await this.users.save(u);
    const p = this.politicians.create({
      name: input.name,
      regionId: input.regionId ?? null,
      partyId: input.partyId ?? null,
    } as any);
    await this.politicians.save(p);
    return { ok: true, message: '議員登録が完了しました。管理者の承認をお待ちください。' };
  }

  async login(email: string, password: string, expectedRole: 'admin' | 'politician') {
    const u = await this.users.findOne({ where: { email } });
    if (!u || !u.passwordHash) throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    const passwordHash = u.passwordHash; // 型ナローイングのため変数に代入
    const ok = await bcrypt.compare(password, passwordHash);
    if (!ok) throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    if (u.role !== expectedRole) throw new UnauthorizedException('アカウントの権限が正しくありません');
    const token = jwt.sign({ sub: u.id, role: u.role }, process.env.JWT_SECRET ?? 'dev-secret', { expiresIn: '7d' });
    return { token };
  }

  // ユーザーIDの重複チェック
  async checkUsernameAvailability(username: string): Promise<{ available: boolean; message?: string }> {
    if (!username || username.length < 3) {
      return { available: false, message: 'ユーザーIDは3文字以上必要です' };
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return { available: false, message: 'ユーザーIDは英数字とアンダースコアのみ使用可能です' };
    }
    const existing = await this.users.findOne({ where: { username } });
    if (existing) {
      return { available: false, message: 'このユーザーIDは既に使用されています' };
    }
    return { available: true };
  }

  // Firebase Authentication用メソッド（一般ユーザー登録）
  async registerFirebaseUser(authHeader: string, body: { name: string; username?: string; email: string; phone: string; prefecture: string; prefectureCode: string; city: string; birthDate?: string }) {
    console.log('[Auth Service] registerFirebaseUser - 認証ヘッダー受信:', authHeader ? 'あり' : 'なし');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Auth Service] registerFirebaseUser - 認証ヘッダーが無効です');
      throw new UnauthorizedException('認証ヘッダーが無効です');
    }
    const idToken = authHeader.substring(7);
    console.log('[Auth Service] registerFirebaseUser - トークン抽出成功 (長さ:', idToken.length, ')');
    
    try {
      console.log('[Auth Service] registerFirebaseUser - Firebaseトークン検証開始...');
      // Firebase IDトークンを検証
      const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(idToken);
      console.log('[Auth Service] registerFirebaseUser - トークン検証成功. UID:', decodedToken.uid);
      const firebaseUid = decodedToken.uid;
      const email = decodedToken.email;

      // メールアドレス認証チェック
      if (!decodedToken.email_verified) {
        throw new UnauthorizedException('メールアドレスが未認証です。メールに届いたリンクをクリックしてください');
      }

      // 既存ユーザーをチェック
      const existing = await this.users.findOne({ where: { email } });
      if (existing) {
        throw new UnauthorizedException('このメールアドレスは既に登録されています');
      }

      // ユーザーIDの処理
      let username: string;
      if (body.username) {
        // ユーザーが指定したユーザーIDを使用
        const normalized = body.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (normalized.length < 3) {
          throw new UnauthorizedException('ユーザーIDは3文字以上必要です');
        }
        if (!/^[a-z0-9_]+$/.test(normalized)) {
          throw new UnauthorizedException('ユーザーIDは英数字とアンダースコアのみ使用可能です');
        }
        const existingUsername = await this.users.findOne({ where: { username: normalized } });
        if (existingUsername) {
          throw new UnauthorizedException('このユーザーIDは既に使用されています');
        }
        username = normalized;
      } else {
        // ユーザーIDが指定されていない場合は自動生成
        username = body.name.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 15) || 'user';
        let counter = 1;
        while (await this.users.findOne({ where: { username } })) {
          username = `${username}${counter}`;
          counter++;
        }
      }

      // 生年月日から年代を計算
      let ageGroup: string | null = null;
      if (body.birthDate) {
        const birth = new Date(body.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          ageGroup = `${age - 1}歳`;
        } else {
          ageGroup = `${age}歳`;
        }
        // 年代グループに変換
        if (age < 20) ageGroup = '10s';
        else if (age < 30) ageGroup = '20s';
        else if (age < 40) ageGroup = '30s';
        else if (age < 50) ageGroup = '40s';
        else ageGroup = '50s+';
      }

      // ユーザーをデータベースに作成
      const u = this.users.create({
        email: body.email,
        name: body.name,
        username: username,
        phoneNumber: body.phone,
        addressPref: body.prefecture,
        addressCity: body.city,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        ageGroup: ageGroup,
        firebaseUid: firebaseUid,
        role: 'citizen',
        status: 'pending',
      } as any);
      await this.users.save(u);

      return { ok: true, message: 'ユーザー登録が完了しました' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Firebase認証トークンが無効です');
    }
  }

  // Firebase Authentication用メソッド（一般ユーザーログイン）
  async loginFirebaseUser(authHeader: string) {
    console.log('[Auth Service] loginFirebaseUser - 認証ヘッダー受信:', authHeader ? 'あり' : 'なし');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Auth Service] loginFirebaseUser - 認証ヘッダーが無効です');
      throw new UnauthorizedException('認証ヘッダーが無効です');
    }
    const idToken = authHeader.substring(7);
    console.log('[Auth Service] loginFirebaseUser - トークン抽出成功 (長さ:', idToken.length, ')');

    try {
      console.log('[Auth Service] loginFirebaseUser - Firebaseトークン検証開始...');
      // Firebase IDトークンを検証
      const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(idToken);
      console.log('[Auth Service] loginFirebaseUser - トークン検証成功. UID:', decodedToken.uid, 'Email:', decodedToken.email);
      const email = decodedToken.email;

      // メールアドレス認証チェック
      if (!decodedToken.email_verified) {
        console.warn('[Auth Service] loginFirebaseUser - メールアドレス未認証');
        throw new UnauthorizedException('メールアドレスが未認証です。メールに届いたリンクをクリックしてください');
      }

      // データベースからユーザーを取得
      let user = await this.users.findOne({ where: { email } });
      
      // ユーザーが存在しない場合は自動的に作成（Firebase-MySQL同期）
      if (!user) {
        console.warn('[Auth Service] loginFirebaseUser - ユーザーがデータベースに存在しません:', email);
        console.log('[Auth Service] loginFirebaseUser - 自動的にユーザーを作成します...');
        
        // Firebaseから取得できる情報で新規ユーザーを作成
        const newUser = this.users.create({
          email: email || '',
          name: decodedToken.name || (email ? email.split('@')[0] : 'ユーザー'), // 名前がなければメールアドレスの@前を使用
          firebaseUid: decodedToken.uid,
          role: 'citizen',
          status: 'pending', // KYC未完了
        } as any);
        
        const savedUser = await this.users.save(newUser);
        user = Array.isArray(savedUser) ? savedUser[0] : savedUser;
        console.log('[Auth Service] loginFirebaseUser - ユーザー作成成功. ID:', user.id);
      } else {
        console.log('[Auth Service] loginFirebaseUser - ユーザー情報取得成功. ID:', user.id, 'Role:', user.role);
      }

      // JWTトークンを生成
      const token = jwt.sign(
        { sub: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET ?? 'dev-secret',
        { expiresIn: '7d' }
      );

      console.log('[Auth Service] loginFirebaseUser - ログイン成功');
      return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Auth Service] loginFirebaseUser - Firebase認証エラー:', errorMessage);
      console.error('[Auth Service] loginFirebaseUser - エラー詳細:', error);
      throw new UnauthorizedException('Firebase認証トークンが無効です: ' + errorMessage);
    }
  }

  // 現在のユーザー情報を取得
  async getCurrentUser(authHeader: string) {
    console.log('[Auth Service] getCurrentUser - 認証ヘッダー:', authHeader ? 'あり' : 'なし');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('認証ヘッダーが無効です');
    }
    const token = authHeader.substring(7);

    // まずJWTトークンとして検証を試みる
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret') as { sub: string; role: string; email?: string };
      console.log('[Auth Service] getCurrentUser - JWT検証成功. ユーザーID:', decoded.sub, 'Role:', decoded.role);
      
      const user = await this.users.findOne({ where: { id: decoded.sub } });
      if (!user) {
        console.error('[Auth Service] getCurrentUser - ユーザーが見つかりません. ID:', decoded.sub);
        throw new UnauthorizedException('ユーザーが見つかりません');
      }

      console.log('[Auth Service] getCurrentUser - ユーザー情報取得成功:', user.email);
      // フロントエンドは直接ユーザーオブジェクトを期待しているため、userプロパティなしで返す
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        kycStatus: user.status,
        createdAt: user.createdAt,
      };
    } catch (jwtError) {
      console.warn('[Auth Service] getCurrentUser - JWT検証失敗:', jwtError instanceof Error ? jwtError.message : jwtError);
      // JWTトークン検証失敗、Firebase IDトークンとして試みる
      try {
        const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(token);
        const email = decodedToken.email;
        console.log('[Auth Service] getCurrentUser - Firebase検証成功. Email:', email);

        const user = await this.users.findOne({ where: { email } });
        if (!user) {
          console.error('[Auth Service] getCurrentUser - ユーザーが見つかりません. Email:', email);
          throw new UnauthorizedException('ユーザーが見つかりません');
        }

        console.log('[Auth Service] getCurrentUser - ユーザー情報取得成功:', user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          kycStatus: user.status,
          createdAt: user.createdAt,
        };
      } catch (firebaseError) {
        console.error('[Auth Service] getCurrentUser - Firebase検証失敗:', firebaseError);
        throw new UnauthorizedException('認証トークンが無効です');
      }
    }
  }
}
