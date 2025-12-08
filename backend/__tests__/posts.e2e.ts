import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Posts E2E', () => {
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

  it('Create -> Update -> SoftDelete -> Restore', async () => {
    const create = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'hello world', postCategory: 'activity', visibility: 'public' });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const update = await request(app.getHttpServer())
      .patch(`/posts/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'updated title' });
    expect(update.status).toBe(200);

    const del = await request(app.getHttpServer())
      .patch(`/posts/${id}/delete`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(del.status).toBe(200);
    expect(del.body.deletedAt).toBeDefined();

    const restore = await request(app.getHttpServer())
      .patch(`/posts/${id}/restore`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(restore.status).toBe(200);
    expect(restore.body.deletedAt).toBeNull();
  });
});