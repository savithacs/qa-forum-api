# QA Forum API

A REST API for a question-and-answer forum, built with NestJS, TypeScript, PostgreSQL, and TypeORM.

## Features

- User registration and JWT-based authentication
- Questions and answers, with ownership checks for updates and deletion
- Votes for questions and answers, with vote counts in responses
- Tags on questions and answers
- Question search by title or description, with pagination
- Request validation and interactive API documentation with Swagger

## Requirements

- Node.js and npm
- PostgreSQL for local development
- Docker for the integration tests, which start PostgreSQL with Testcontainers

## Getting started

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root and provide the database connection and JWT secret:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=qa_forum
JWT_SECRET=replace_with_a_long_random_secret
```

Start the API in development mode:

```bash
npm run start:dev
```

The API listens on port `3000` by default. Set `PORT` to use a different port. Open the Swagger UI at `http://localhost:3000/api`.

## API routes

Protected routes require `Authorization: Bearer <token>`. Registration, login, and question reads are public.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/users/register` | Register a user |
| `POST` | `/auth/login` | Log in and receive a JWT |
| `GET` | `/auth/me` | Get the authenticated user |
| `GET` | `/questions` | List questions; supports `page`, `limit`, and `search` query parameters |
| `GET` | `/questions/:id` | Get a question, its answers, tags, and vote counts |
| `POST` | `/questions` | Create a question |
| `PATCH` | `/questions/:id` | Update a question |
| `DELETE` | `/questions/:id` | Delete a question |
| `POST` | `/questions/:id/answers` | Add an answer to a question |
| `PATCH` | `/questions/answers/:answerid` | Update an answer |
| `DELETE` | `/questions/answers/:answerid` | Delete an answer |
| `POST` | `/voting` | Vote for a question or answer |
| `DELETE` | `/voting/:id` | Remove your vote |

Question and answer creation and update requests can include a `tags` array of strings. The questions list returns pagination metadata; `search` matches question titles and descriptions.

## Useful commands

```bash
npm run start:dev  # Start in watch mode
npm run build      # Compile the application
npm run test       # Run unit and configured end-to-end tests
npm run test:cov   # Run tests with coverage
```

The integration tests use Testcontainers to launch PostgreSQL, so Docker must be running when those tests execute.

## Docker image

Build the production image locally with:

```bash
docker build -t qa-forum-api .
```

The `CI` GitHub Actions workflow runs tests and a build for pushes and pull requests.

## Database

The application reads its PostgreSQL connection settings from the environment variables above. 
