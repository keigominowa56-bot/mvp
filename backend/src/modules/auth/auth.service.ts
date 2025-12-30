import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
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

  // Firebase Authenticationを使用したログイン（管理画面・議員用）
  async loginWithFirebase(authHeader: string, expectedRole: 'admin' | 'politician') {
    console.log(`[AuthService] LoginWithFirebase attempt, expectedRole: ${expectedRole}`);
    console.log('[AuthService] loginWithFirebase - authHeader received:', authHeader ? `Bearer ${authHeader.substring(0, 20)}...` : 'undefined or empty');
    console.log('[AuthService] loginWithFirebase - authHeader type:', typeof authHeader);
    console.log('[AuthService] loginWithFirebase - authHeader length:', authHeader?.length || 0);
    
    if (!authHeader) {
      console.error('[AuthService] loginWithFirebase - 認証ヘッダーが空です');
      throw new UnauthorizedException('認証ヘッダーが無効です');
    }
    
    // Bearer プレフィックスを確認・追加
    let token = authHeader;
    if (!authHeader.startsWith('Bearer ')) {
      console.log('[AuthService] loginWithFirebase - Bearer prefix missing, adding it');
      token = `Bearer ${authHeader}`;
    }
    
    const idToken = token.substring(7); // "Bearer " の7文字を削除
    console.log('[AuthService] loginWithFirebase - トークン抽出成功 (長さ:', idToken.length, ')');
    console.log('[AuthService] loginWithFirebase - トークン先頭20文字:', idToken.substring(0, 20));
    
    try {
      console.log('[AuthService] loginWithFirebase - Firebaseトークン検証開始...');
      // Firebase IDトークンを検証
      const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(idToken);
      console.log('[AuthService] loginWithFirebase - トークン検証成功. UID:', decodedToken.uid, 'Email:', decodedToken.email);
      const email = decodedToken.email;
      
      if (!email) {
        console.error('[AuthService] loginWithFirebase - メールアドレスが取得できませんでした');
        throw new UnauthorizedException('メールアドレスが取得できませんでした');
      }
      
      // メールアドレス認証チェック
      if (!decodedToken.email_verified) {
        console.warn('[AuthService] loginWithFirebase - メールアドレス未認証');
        throw new UnauthorizedException('メールアドレスが未認証です。メールに届いたリンクをクリックしてください');
      }
      
      // データベースからユーザーを取得（退会済みユーザーは除外）
      const u = await this.users.findOne({ 
        where: { email, deletedAt: IsNull() } as any,
      });
      
      if (!u) {
        console.log(`[AuthService] loginWithFirebase - User not found for email: ${email}`);
        throw new UnauthorizedException('ユーザーが見つかりません。管理者に連絡してください。');
      }
      
      // 退会済みユーザーのチェック（念のため）
      if (u.deletedAt) {
        console.log(`[AuthService] loginWithFirebase - User is deleted. email: ${email}, userId: ${u.id}, deletedAt: ${u.deletedAt}`);
        throw new UnauthorizedException('このアカウントは退会済みです。再登録が必要です。');
      }
      
      console.log(`[AuthService] loginWithFirebase - User found: email=${email}, userId=${u.id}, role=${u.role}, expectedRole=${expectedRole}`);
      console.log(`[AuthService] loginWithFirebase - User role type: ${typeof u.role}, value: "${u.role}"`);
      console.log(`[AuthService] loginWithFirebase - Expected role type: ${typeof expectedRole}, value: "${expectedRole}"`);
      
      // ロールチェック（大文字小文字を許容）
      const userRoleUpper = String(u.role).toUpperCase();
      const expectedRoleUpper = String(expectedRole).toUpperCase();
      console.log(`[AuthService] loginWithFirebase - Comparing roles: "${userRoleUpper}" === "${expectedRoleUpper}"`);
      
      if (userRoleUpper !== expectedRoleUpper) {
        console.log(`[AuthService] loginWithFirebase - Role mismatch. email: ${email}, userRole: "${u.role}" (${userRoleUpper}), expectedRole: "${expectedRole}" (${expectedRoleUpper})`);
        throw new UnauthorizedException('アカウントの権限が正しくありません');
      }
      
      console.log(`[AuthService] loginWithFirebase - Role check passed: ${userRoleUpper} === ${expectedRoleUpper}`);
      
      // Firebase認証に成功したので、passwordHashの検証はスキップ
      // Firebase UIDを更新（同期）
      if (u.firebaseUid !== decodedToken.uid) {
        console.log(`[AuthService] loginWithFirebase - Updating firebaseUid for user: ${u.id}`);
        u.firebaseUid = decodedToken.uid;
        await this.users.save(u);
      }
      
      // JWTトークンを生成
      const token = jwt.sign({ sub: u.id, role: u.role }, this.configService.get<string>('JWT_SECRET')!, { expiresIn: '7d' });
      console.log(`[AuthService] loginWithFirebase - Login successful: email=${email}, userId=${u.id}, role=${u.role}`);
      return { token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[AuthService] loginWithFirebase - Firebase認証エラー:', errorMessage);
      console.error('[AuthService] loginWithFirebase - エラー詳細:', error);
      throw new UnauthorizedException('Firebase認証トークンが無効です: ' + errorMessage);
    }
  }

  // 従来のemail/passwordログイン（後方互換性のため残す）
  async login(email: string, password: string, expectedRole: 'admin' | 'politician') {
    console.log(`[AuthService] Login attempt for email: ${email}, expectedRole: ${expectedRole}`);
    
    try {
      const u = await this.users.findOne({ 
        where: { email, deletedAt: IsNull() } as any, // 退会済みユーザーは除外
      });
      
      if (!u) {
        console.log(`[AuthService] Login failed: User not found for email: ${email}`);
        throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
      }
      
      if (!u.passwordHash) {
        console.log(`[AuthService] Login failed: No password hash for user: ${email}, userId: ${u.id}`);
        throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
      }
      
      // 退会済みユーザーのチェック（念のため）
      if (u.deletedAt) {
        console.log(`[AuthService] Login failed: User is deleted. email: ${email}, userId: ${u.id}, deletedAt: ${u.deletedAt}`);
        throw new UnauthorizedException('このアカウントは退会済みです。再登録が必要です。');
      }
      
      console.log(`[AuthService] User found: email=${email}, userId=${u.id}, role=${u.role}, expectedRole=${expectedRole}`);
      
      const passwordHash = u.passwordHash; // 型ナローイングのため変数に代入
      const ok = await bcrypt.compare(password, passwordHash);
      
      if (!ok) {
        console.log(`[AuthService] Login failed: Password mismatch for email: ${email}`);
        throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
      }
      
      if (u.role !== expectedRole) {
        console.log(`[AuthService] Login failed: Role mismatch. email: ${email}, userRole: ${u.role}, expectedRole: ${expectedRole}`);
        throw new UnauthorizedException('アカウントの権限が正しくありません');
      }
      
      const token = jwt.sign({ sub: u.id, role: u.role }, this.configService.get<string>('JWT_SECRET')!, { expiresIn: '7d' });
      console.log(`[AuthService] Login successful: email=${email}, userId=${u.id}, role=${u.role}`);
      return { token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error(`[AuthService] Login error for email: ${email}, Error:`, error);
      throw new UnauthorizedException('ログイン処理中にエラーが発生しました');
    }
  }

  // ユーザーIDの重複チェック
  async checkUsernameAvailability(username: string): Promise<{ available: boolean; message?: string }> {
    if (!username || username.length < 3) {
      return { available: false, message: 'ユーザーIDは3文字以上必要です' };
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return { available: false, message: 'ユーザーIDは英数字とアンダースコアのみ使用可能です' };
    }
    const existing = await this.users.findOne({ 
      where: { username, deletedAt: IsNull() } as any,
    });
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

      if (!email) {
        throw new UnauthorizedException('メールアドレスが取得できませんでした');
      }

      // メールアドレス認証チェック
      if (!decodedToken.email_verified) {
        throw new UnauthorizedException('メールアドレスが未認証です。メールに届いたリンクをクリックしてください');
      }

      // 既存ユーザーをチェック（退会していないユーザー）
      const existing = await this.users.findOne({ 
        where: { email, deletedAt: IsNull() } as any,
      });
      if (existing) {
        throw new UnauthorizedException('このメールアドレスは既に登録されています');
      }

      // 退会済みユーザーを検索（メールアドレスまたは電話番号で）
      // まずメールアドレスで検索
      let deletedUser = await this.users.findOne({
        where: { email, deletedAt: Not(IsNull()) } as any,
        order: { deletedAt: 'DESC' },
      });
      
      // メールアドレスで見つからない場合、電話番号で検索
      if (!deletedUser && body.phone) {
        deletedUser = await this.users.findOne({
          where: { phoneNumber: body.phone, deletedAt: Not(IsNull()) } as any,
          order: { deletedAt: 'DESC' },
        });
      }

      if (deletedUser) {
        // 退会済みユーザーを復活させる
        console.log('[Auth Service] 退会済みユーザーを復活:', deletedUser.id);
        (deletedUser as any).deletedAt = null;
        deletedUser.firebaseUid = firebaseUid;
        deletedUser.status = 'pending';
        if (email) {
          deletedUser.email = email; // メールアドレスを更新
        }
        if (body.phone) {
          deletedUser.phoneNumber = body.phone; // 電話番号を更新
        }
        if (body.name) {
          deletedUser.name = body.name; // 名前を更新
        }
        if (body.prefecture) {
          deletedUser.addressPref = body.prefecture;
        }
        if (body.city) {
          deletedUser.addressCity = body.city;
        }
        if (body.birthDate) {
          deletedUser.birthDate = new Date(body.birthDate);
        }
        
        // ユーザーIDの処理（既存のusernameを保持、または新規生成）
        let username: string;
        if (body.username) {
          const normalized = body.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
          if (normalized.length >= 3 && /^[a-z0-9_]+$/.test(normalized)) {
            const existingUsername = await this.users.findOne({ where: { username: normalized, deletedAt: IsNull() } as any });
            if (!existingUsername || existingUsername.id === deletedUser.id) {
              username = normalized;
            } else {
              username = deletedUser.username || normalized; // 既存のusernameを保持
            }
          } else {
            username = deletedUser.username || body.name.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 15) || 'user';
          }
        } else {
          username = deletedUser.username || body.name.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 15) || 'user';
        }
        deletedUser.username = username;
        
        await this.users.save(deletedUser);
        return { ok: true, message: 'ユーザー登録が完了しました（過去のアカウントを復活させました）' };
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

      // データベースからユーザーを取得（退会済みユーザーは除外）
      let user = await this.users.findOne({ 
        where: { email, deletedAt: IsNull() } as any,
      });
      
      // 退会済みユーザーが存在する場合はエラー
      const deletedUser = await this.users.findOne({ 
        where: { email, deletedAt: Not(IsNull()) } as any,
      });
      if (deletedUser) {
        throw new UnauthorizedException('このアカウントは退会済みです。再登録が必要です。');
      }
      
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
        this.configService.get<string>('JWT_SECRET')!,
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
      const decoded = jwt.verify(token, this.configService.get<string>('JWT_SECRET')!) as { sub: string; role: string; email?: string };
      console.log('[Auth Service] getCurrentUser - JWT検証成功. ユーザーID:', decoded.sub, 'Role:', decoded.role);
      
      const user = await this.users.findOne({ where: { id: decoded.sub } });
      if (!user) {
        console.error('[Auth Service] getCurrentUser - ユーザーが見つかりません. ID:', decoded.sub);
        throw new UnauthorizedException('ユーザーが見つかりません');
      }
      
      // 退会済みユーザーのチェック
      if (user.deletedAt) {
        throw new UnauthorizedException('このアカウントは退会済みです。再登録が必要です。');
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
