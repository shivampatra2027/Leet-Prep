# Leet.IO

A comprehensive LeetCode problem tracker and management platform. Browse, filter, and organize coding problems by difficulty and company with an intuitive interface.

https://docs.google.com/document/d/1YSged3VvphpvZ7O0gXoBQHKgLebvTlB7aKUhkXPG9nc/edit?usp=sharing
## Architecture:
 <img width="446" height="428" alt="image" align="" src="https://github.com/user-attachments/assets/e90b4a36-d930-4b50-9da3-eec15f6c8082" />

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

## Features

- Browse 1800+ LeetCode problems in a responsive data table
- Filter problems by difficulty (Easy, Medium, Hard)
- Filter problems by company tags
- Search problems by title
- Sort and organize columns
- Client-side pagination (30 problems per page)
- Google OAuth authentication
- Clean, modern UI built with shadcn/ui components
- Responsive design with collapsible sidebar

## Tech Stack

### Backend

- Node.js with Express.js
- MongoDB with Mongoose ODM
- Passport.js for Google OAuth authentication
- JWT for session management
- Helmet for security headers
- CORS enabled

### Frontend

- React 19.2.0
- Vite 7.2.4 for build tooling
- Tailwind CSS 4.1.18 for styling
- shadcn/ui component library
- TanStack Table for data grid
- Axios for API calls
- React Router for navigation
- Lucide React for icons

## Project Structure

```
Leet.IO/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Custom middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   ├── index.js        # Entry point
│   │   └── server.js       # Express server setup
│   ├── scripts/            # Database seeding scripts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   │   ├── ui/        # shadcn/ui components
    │   │   ├── DataTable.jsx
    │   │   ├── columns.jsx
    │   │   ├── Navbar.jsx
    │   │   └── layout.jsx
    │   ├── pages/         # Page components
    │   │   ├── Dashboard.jsx
    │   │   └── Login.jsx
    │   ├── lib/           # Utilities
    │   │   ├── api.js     # API client
    │   │   └── utils.js   # Helper functions
    │   └── hooks/         # Custom React hooks
    ├── public/
    └── package.json
```

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Leet.IO
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

## Configuration

### Backend Configuration

1. Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

2. Fill in the environment variables in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/leetio
CORS_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
JWT_SECRET=your-secure-jwt-secret
```

#### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:8080/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

### Frontend Configuration

1. Create a `.env` file in the `frontend` directory:

```bash
cd frontend
touch .env
```

2. Add the backend API URL:

```env
VITE_API_URL=http://localhost:8080
```

### Database Setup

If you have problem data to import:

```bash
cd backend
node scripts/import_problems_safe.js
```

This will seed your MongoDB database with LeetCode problems.

## Running the Application

### Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

The backend server will start on `http://localhost:8080`

### Start the Frontend Development Server

Open another terminal and run:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## Usage

### Authentication

1. Click on "Login with Google" on the login page
2. Authenticate with your Google account
3. You will be redirected to the dashboard

### Dashboard Features

#### Filtering Problems

- **By Title**: Use the search input to filter problems by name
- **By Difficulty**: Select Easy, Medium, Hard, or All from the difficulty dropdown
- **By Company**: Select a company from the company dropdown to see problems asked by that company

#### Table Operations

- **Sorting**: Click on column headers to sort
- **Column Visibility**: Use the "Columns" dropdown to show/hide columns
- **Row Selection**: Check boxes to select multiple problems
- **Pagination**: Navigate through pages using the pagination controls at the bottom

#### Problem Count

The header displays the current number of visible problems based on active filters.

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler

### Problems

- `GET /api/problems` - Get all problems
  - Query params: `difficulty`, `company`, `q` (search), `page`, `limit`
- `GET /api/problems/:id` - Get problem by ID
- `GET /api/problems/companies` - Get list of all companies

### Admin (requires admin key)

- `POST /api/admin/problems` - Create new problem
- `PUT /api/admin/problems/:id` - Update problem
- `DELETE /api/admin/problems/:id` - Delete problem

## Troubleshooting

### Common Issues

#### Backend won't start

**Problem**: `MongooseError: Cannot connect to MongoDB`

**Solution**:

- Ensure MongoDB is running locally: `mongod`
- Or check your MongoDB Atlas connection string in `.env`

#### Frontend can't connect to backend

**Problem**: API calls return 404 or connection refused

**Solution**:

- Verify backend is running on port 8080
- Check `VITE_API_URL` in frontend `.env` file
- Ensure CORS is properly configured in backend

#### Google OAuth not working

**Problem**: OAuth redirect fails or returns error

**Solution**:

- Verify Google Client ID and Secret in backend `.env`
- Check redirect URI matches in Google Console
- Ensure `GOOGLE_CALLBACK_URL` is correct

#### Problems not loading

**Problem**: Dashboard shows "0 problems available"

**Solution**:

- Run the database seeding script: `node scripts/import_problems_safe.js`
- Check MongoDB connection and database name
- Verify the Problems collection exists and has data

#### Port already in use

**Problem**: `Error: listen EADDRINUSE: address already in use :::8080`

**Solution**:

- Kill the process using the port: `npx kill-port 8080`
- Or change the port in backend `server.js`

### Development Tips

1. **Hot Reload**: Both frontend (Vite) and backend (nodemon) support hot reload during development

2. **Database Inspection**: Use MongoDB Compass or mongo shell to inspect your database:

   ```bash
   mongosh
   use leetio
   db.problems.countDocuments()
   ```

3. **API Testing**: Use tools like Postman or Thunder Client to test API endpoints independently

4. **Console Logs**: Check browser console and terminal output for detailed error messages

5. **Clear Browser Cache**: If UI issues persist, clear browser cache and local storage

## Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Table Docs](https://tanstack.com/table/latest)

## License

This project is licensed under the ISC License.

