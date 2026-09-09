import { PostgreSqlContainer } from '@testcontainers/postgresql';

export async function createTestDatabase() {
  const username = 'test';
  const password = 'test';
  const database = 'qa_forum_test';

  const container = await new PostgreSqlContainer('postgres:latest')
    .withDatabase(database)
    .withUsername(username)
    .withPassword(password)
    .start();

  return {
    container,
    host: container.getHost(),
    port: container.getMappedPort(5432),
    username,
    password,
    database,
  };
}
