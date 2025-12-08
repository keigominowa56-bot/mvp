import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/dev/login/admin returns token', async () => {
    const res = await request(app.getHttpServer()).post('/dev/login/admin').send({});
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
  });

  it('/auth/me with token returns 200', async () => {
    const login = await request(app.getHttpServer()).post('/dev/login/admin').send({});
    const token = login.body.accessToken;
    const res = await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});