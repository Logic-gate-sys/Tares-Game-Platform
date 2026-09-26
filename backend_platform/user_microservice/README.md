# Tares User Microservice

An Express and TypeScript microservice for user registration, authentication, password recovery, and authenticated profile access in the Tares platform.

The service uses PostgreSQL with Drizzle ORM, Zod request validation, signed bearer tokens, and Node.js password hashing.

## Prerequisites

Make sure you have the following software installed:

- Node.js 24.0.0 or later
- npm
- Git
- Docker 

The service uses PostgreSQL for user data. A running PostgreSQL instance and a database for the service are required for the authentication routes and integration tests.

## Installation

Clone the repository and enter the user microservice directory:

```bash
git clone <repository-url>
cd micro-services/user_microservice
```

Install the dependencies:

```bash
npm install
```

## Configuration

Environment files are stored in `src/config` and are selected using `NODE_ENV`.

Create or update the environment file for the environment you want to run:

```text
src/config/.env.development
src/config/.env.production
src/config/.env.staging
src/config/.env.test
```

Define the following variables:

```dotenv
# Express server port
SERVER_PORT=3000

# PostgreSQL connection URL
DATABASE_URL=postgresql://username:password@localhost:5432/tares

# Secret used to sign authentication and password-reset tokens.
# Use a long, random value outside local development.
AUTH_SECRET=replace-with-a-long-random-secret
```

The test suite loads `src/config/.env.test`. Its `DATABASE_URL` should point to a dedicated test database so test data cannot affect development or production or staging data.

## Database

Run the docker-compose.yaml in the root directory micro-services/ to start the PostgresSQL database and set its connection URL in the selected environment file usin:

```bash
docker compose up --build --remove-orphans
```

The service connects through `DATABASE_URL`. The `users` table must exist before using the authentication routes. The integration test global setup creates the table when running the test suite and clears test records between tests.

The user table stores:

- Email and username
- A hashed password
- Permission level
- Rank and profile fields
- Score and creation timestamp

## Usage

### Development mode

Start the service with the development environment:

```bash
npm run dev
```

The server listens on `SERVER_PORT` and watches the `src` directory for changes.

The application is served at:

```text
http://localhost:3000
```

### Production mode

The project currently provides a development start script rather than a separate production build script. For a production deployment, set `NODE_ENV=production`, provide `src/config/.env.production`, and run the TypeScript entrypoint with a process manager appropriate for your deployment environment.

The production environment file must contain a valid PostgreSQL `DATABASE_URL` and a strong, private `AUTH_SECRET`.

## Tests

Unit tests are located in `tests/unit`. They test repository behavior with isolated database and crypto boundaries.

Integration tests are located in `tests/integration`. They send real HTTP requests to the Express application using Supertest and execute against the PostgreSQL database configured by `src/config/.env.test`.

Run all tests:

```bash
npm test
```

Run only unit tests:

```bash
npm run test:unit
```

Run only integration tests:

```bash
npm run test:integration
```

Run the TypeScript check:

```bash
npm run typecheck
```

## API Reference

Interactive Swagger UI is available at:

```text
http://localhost:3000/docs
```

The OpenAPI document is defined in `openapi.yaml` and is served through the documentation route. using `yamljs` & `swagger-ui-express`.
`yamljs` converts the yaml file into a `json` document which is then served with the `swagger-ui-express` package at the /docs route. 

Current authentication endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Sign in and receive a bearer token |
| `POST` | `/api/v1/auth/forgot-password` | Request a password-reset token |
| `POST` | `/api/v1/auth/reset-password` | Set a new password with a valid reset token |
| `GET` | `/api/v1/users/me` | Return the authenticated user's profile |

Send the token returned by register or login in the authorization header:

```http
Authorization: Bearer <token>
```

## Authors

- Logic Gate

## Licence

ISC
