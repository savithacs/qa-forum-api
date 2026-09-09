import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function createAuthenticatedUser(
  app: INestApplication,
  user = {
    username: 'alice',
    email: 'alice@example.com',
    password: 'password123',
  },
) {
  await request(app.getHttpServer())
    .post('/users/register')
    .send(user)
    .expect(201);

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      username: user.username,
      password: user.password,
    })
    .expect(201);

  return response.body.access_token;
}
