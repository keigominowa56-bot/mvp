import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Notifications E2E', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const login = await request(app.getHttpServer()).post('/dev/login/admin').send({});
    token = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Send notification to admin and read it', async () => {
    // dev-admin の userId は /auth/me から取得
    const me = await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    const userId = me.body.id || me.body.sub || me.body.userId;

    const send = await request(app.getHttpServer())
      .post('/notifications/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId, type: 'info', title: 'Test Notification' });
    expect(send.status).toBe(201);
    const nid = send.body.id;

    const list = await request(app.getHttpServer()).get('/notifications').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);

    const read = await request(app.getHttpServer())
      .patch(`/notifications/${nid}/read`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(read.status).toBe(200);
    expect(read.body.readAt).toBeDefined();
  });
});