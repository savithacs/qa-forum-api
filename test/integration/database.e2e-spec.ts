import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDatabase } from './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { Question } from 'src/questions/entities/questions.entity';
import { Answer } from 'src/questions/entities/answers.entity';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('Test Database', () => {
  let db: Awaited<ReturnType<typeof createTestDatabase>>;
  let module: TestingModule;
  let app: INestApplication;

  beforeAll(async () => {
    db = await createTestDatabase();

    process.env.DB_HOST = db.host;
    process.env.DB_PORT = String(db.port);
    process.env.DB_USERNAME = db.username;
    process.env.DB_PASSWORD = db.password;
    process.env.DB_NAME = db.database;

    /*  module = await Test.createTestingModule({
       imports: [
         TypeOrmModule.forRoot({
           type: 'postgres',
           host: db.host,
           port: db.port,
           username: db.username,
           password: db.password,
           database: db.database,
           entities: [User, Question, Answer],
           synchronize: true,
         }),
       ],
     }).compile(); */

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  }, 30_000);

  it('should start a PostgresSQL container', () => {
    expect(db).toBeDefined();
    expect(db.host).toBeDefined();
    expect(db.username).toBe('test');
    expect(db.password).toBe('test');
    expect(db.database).toBe('qa_forum_test');
  }, 30_000);

  it('connects NestJS to the test database', () => {
    expect(module).toBeDefined();
  });

  it('GET / should return successfully', async () => {
    await request(app.getHttpServer()).get('/').expect(200);
  });
  afterAll(async () => {
    await app?.close();
    await module?.close();
    await db?.container.stop();
  });
});
