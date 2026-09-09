# QA Forum API

A backend API for a QA-focused discussion forum, built with NestJS and PostgreSQL.

The goal of this project is to build a production-style backend while practicing clean architecture, REST API design, authentication, database relationships, validation, testing, and other backend engineering practices.

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM



## Project Setup

### Prerequisites

- Node.js
- PostgreSQL

### Installation

```bash
npm install
```

### Environment Variables

Create a .env file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=qa_forum
```

### Run the application
```bash
# development
npm run start

# watch mode
```bash
npm run start:dev
```