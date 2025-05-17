# Logbook API

Backend REST API for the Logbook application, built with Express.js, TypeScript, and PostgreSQL.

## Features

- User authentication (register, login, profile management)
- JWT-based authentication
- PostgreSQL database
- TypeScript for type safety

## Prerequisites

- Node.js and npm
- Docker and Docker Compose (for running PostgreSQL)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the PostgreSQL database using Docker:
   ```
   docker-compose up -d
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   NODE_ENV=development
   PORT=3001

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=logbook
   DB_USER=postgres
   DB_PASSWORD=postgres

   # JWT Secret
   JWT_SECRET=your_secret_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   ```

4. Initialize the database:
   ```
   npm run dev src/db/init.ts
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Log in an existing user

### User Profile

- `GET /api/users/profile` - Get the current user's profile (requires auth)
- `PUT /api/users/profile` - Update the current user's profile (requires auth)

## Database Structure

- **users** - User accounts and profile information
- **logbook_entries** - Logbook entries created by users
- **tags** - Tags that can be applied to entries
- **entry_tags** - Junction table connecting entries and tags

## Development

- Run development server: `npm run dev`
- Build for production: `npm run build`
- Run production server: `npm start`

## Accessing PostgreSQL Admin

You can access pgAdmin at `http://localhost:5050` with:
- Email: admin@example.com
- Password: admin 