import { Test, TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase } from './setup';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { DataSource } from 'typeorm';

describe('Questions E2E Testing', () => {
  let db: Awaited<ReturnType<typeof createTestDatabase>>;
  let module: TestingModule;
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    db = await createTestDatabase();

    process.env.DB_HOST = db.host;
    process.env.DB_PORT = String(db.port);
    process.env.DB_USERNAME = db.username;
    process.env.DB_PASSWORD = db.password;
    process.env.DB_NAME = db.database;

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = module.get(DataSource);
    app = module.createNestApplication();

    await app.init();
  }, 30_000);

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app?.close();
    await db?.container.stop();
  });

  it('POST /users/register creates a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body.username).toBe('alice');
    expect(response.body.email).toBe('alice@example.com');
    expect(response.body.password).toBeUndefined();
  });

  it('POST /auth/login returns a JWT', async () => {
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'alice',
        password: 'password123',
      })
      .expect(201);

    expect(response.body.access_token).toBeDefined();
  });
});
