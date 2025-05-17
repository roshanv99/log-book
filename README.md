# Logbook App

A full-stack logbook application with web and mobile clients using React, React Native, and PostgreSQL.

## Project Structure

- **logbook-web**: React web application
- **logbook-mobile**: React Native mobile application
- **logbook-api**: Express.js + TypeScript backend API
- **PostgreSQL**: Database running in Docker

## Setting Up the Project

### Prerequisites

- Node.js and npm
- Docker and Docker Compose
- Expo Go app for mobile testing

### Backend Setup

1. Start the PostgreSQL database:

```bash
docker-compose up -d
```

2. Install the API dependencies:

```bash
cd logbook-api
npm install
```

3. Create a `.env` file with the correct database connection details:

```
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=logbook
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret
JWT_SECRET=your_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

4. Start the API server:

```bash
npm run dev
```

### Web App Setup

1. Install dependencies:

```bash
cd logbook-web
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the web app in your browser at http://localhost:5173

### Mobile App Setup

1. Install dependencies:

```bash
cd logbook-mobile
npm install
```

2. Configure the API URL:
   - Open `logbook-mobile/config.ts`
   - Update the `apiUrl` in the `dev` environment object with your local IP address
   - Alternatively, update the `ENV` value in `app.json` to use a different environment

```typescript
// In config.ts
const ENV = {
  dev: {
    apiUrl: 'http://YOUR_LOCAL_IP:3001/api', // Replace with your actual IP
  },
  // Other environments...
};
```

3. Start the Expo development server:

```bash
npm start
```

4. Scan the QR code with the Expo Go app on your mobile device.

## Features

- User authentication (login/signup)
- Profile management
- Dark mode support
- Responsive design
- PostgreSQL database for data persistence

## API Endpoints

### Authentication

- `POST /api/users/register` - Create a new user account
- `POST /api/users/login` - User login

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Technology Stack

- **Frontend**: React, React Native, Expo
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Styling**: TailwindCSS (web), React Native Styles (mobile)

## PostgreSQL Admin

You can access pgAdmin at http://localhost:5050 with:
- Email: admin@example.com
- Password: admin

Once logged in, add a new server:
- Name: logbook
- Connection: 
  - Host: postgres
  - Port: 5432
  - Database: logbook
  - Username: postgres
  - Password: postgres

## Development

The application consists of both frontend and backend components that work together. 