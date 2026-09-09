import { Test, TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest';
import { createTestDatabase } from './setup';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { createAuthenticatedUser } from '../../test/auth.helper';
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

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  }, 30_000);

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app?.close();
    await db?.container.stop();
  });

  it('GET /questions rejects unauthenticated requests', async () => {
    await request(app.getHttpServer()).get('/questions').expect(401);
  });

  it('GET /questions returns questions for authenticated user', async () => {
    const token = await createAuthenticatedUser(app);

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('POST /questions creates a question for an authenticated user', async () => {
    const token = await createAuthenticatedUser(app);

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'How does JWT authentication work?',
        description:
          'I want to understand how JWT authentication works in NestJS.',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'How does JWT authentication work?',
      description:
        'I want to understand how JWT authentication works in NestJS.',
    });

    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
  });

  it('GET /questions returns created questions', async () => {
    const token = await createAuthenticatedUser(app);

    await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'How does JWT authentication work?',
        description:
          'I want to understand how JWT authentication works in NestJS.',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);

    expect(response.body[0]).toMatchObject({
      title: 'How does JWT authentication work?',
      description:
        'I want to understand how JWT authentication works in NestJS.',
    });

    expect(response.body[0].questionBy).toMatchObject({
      username: 'alice',
      email: 'alice@example.com',
    });
  });

  it('POST /questions rejects invalid question data', async () => {
    const token = await createAuthenticatedUser(app);

    await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '',
        description: '',
      })
      .expect(400);
  });

  it('GET /questions/:id returns a question by id', async () => {
    const token = await createAuthenticatedUser(app);

    const createResponse = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'How does JWT authentication work?',
        description:
          'I want to understand how JWT authentication works in NestJS.',
      })
      .expect(201);

    const questionId = createResponse.body.id;

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: questionId,
      title: 'How does JWT authentication work?',
      description:
        'I want to understand how JWT authentication works in NestJS.',
    });

    expect(response.body.questionBy).toMatchObject({
      username: 'alice',
      email: 'alice@example.com',
    });

    expect(response.body.answers).toEqual([]);
  });

  it('GET /questions/:id returns 404 when question does not exist', async () => {
    const token = await createAuthenticatedUser(app);

    const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

    await request(app.getHttpServer())
      .get(`/questions/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('GET /questions/:id returns 400 for an invalid UUID', async () => {
    const token = await createAuthenticatedUser(app);

    await request(app.getHttpServer())
      .get('/questions/not-a-valid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('PATCH /questions/:id updates a question for its owner', async () => {
    const token = await createAuthenticatedUser(app);

    const createResponse = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Original title',
        description: 'Original description',
      })
      .expect(201);

    const questionId = createResponse.body.id;

    const response = await request(app.getHttpServer())
      .patch(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated title',
        description: 'Updated description',
      })
      .expect(200);

    expect(response.body.affected).toBe(1);

    const getResponse = await request(app.getHttpServer())
      .get(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getResponse.body).toMatchObject({
      title: 'Updated title',
      description: 'Updated description',
    });
  });

  it('PATCH /questions/:id rejects updates from another user', async () => {
    const aliceToken = await createAuthenticatedUser(app);

    const createResponse = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Alice question',
        description: 'Alice description',
      })
      .expect(201);

    const questionId = createResponse.body.id;

    const bobToken = await createAuthenticatedUser(app, {
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
    });

    await request(app.getHttpServer())
      .patch(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({
        title: 'Bob tries to edit',
      })
      .expect(403);
  });

  it('DELETE /questions/:id deletes a question for its owner', async () => {
    const token = await createAuthenticatedUser(app);

    const createResponse = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Question to delete',
        description: 'This question will be deleted.',
      })
      .expect(201);

    const questionId = createResponse.body.id;

    await request(app.getHttpServer())
      .delete(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('DELETE /questions/:id rejects deletion by another user', async () => {
    const aliceToken = await createAuthenticatedUser(app);

    const createResponse = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Alice question',
        description: 'Alice description',
      })
      .expect(201);

    const questionId = createResponse.body.id;

    const bobToken = await createAuthenticatedUser(app, {
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
    });

    await request(app.getHttpServer())
      .delete(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .expect(403);

    // Confirm Alice's question still exists.
    await request(app.getHttpServer())
      .get(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);
  });

  it('POST /questions/:id/answers creates an answer', async () => {
    const token = await createAuthenticatedUser(app);

    const questionResponse = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'How does NestJS work?',
        description: 'I want to understand NestJS.',
      })
      .expect(201);

    const questionId = questionResponse.body.id;

    await request(app.getHttpServer())
      .post(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'NestJS is a framework built on top of Node.js.',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.answers).toHaveLength(1);
    expect(response.body.answers[0]).toMatchObject({
      content: 'NestJS is a framework built on top of Node.js.',
    });
  });

  it('PATCH /questions/answers/:answerid updates an answer for its owner', async () => {
    const token = await createAuthenticatedUser(app);

    const questionResponse = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Question',
        description: 'Description',
      })
      .expect(201);

    const questionId = questionResponse.body.id;

    const answerResponse = await request(app.getHttpServer())
      .post(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Original answer',
      })
      .expect(201);

    const answerId = answerResponse.body.id;

    const response = await request(app.getHttpServer())
      .patch(`/questions/answers/${answerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Updated answer',
      })
      .expect(200);

    expect(response.body.affected).toBe(1);

    const question = await request(app.getHttpServer())
      .get(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(question.body.answers[0].content).toBe('Updated answer');
  });

  it('DELETE /questions/answers/:answerid deletes an answer for its owner', async () => {
    const token = await createAuthenticatedUser(app);

    const questionResponse = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Question',
        description: 'Description',
      })
      .expect(201);

    const questionId = questionResponse.body.id;

    const answerResponse = await request(app.getHttpServer())
      .post(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Answer to delete',
      })
      .expect(201);

    const answerId = answerResponse.body.id;

    await request(app.getHttpServer())
      .delete(`/questions/answers/${answerId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const question = await request(app.getHttpServer())
      .get(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(question.body.answers).toHaveLength(0);
  });

});
