# Leet.IO Backend API

> RESTful API backend for Leet.IO - A company-wise DSA coding problem platform

## 📋 Overview

Leet.IO Backend is a Node.js/Express API server that powers the Leet.IO platform, providing access to 1800+ Data Structures and Algorithms problems organized by top tech companies. The platform helps students prepare for technical interviews with company-specific problem sets from Google, Amazon, Microsoft, Meta, and 50+ other companies.

### Key Features

- 🔐 **Authentication & Authorization**

  - JWT-based authentication
  - Google OAuth 2.0 integration
  - Secure session management with Passport.js
  - Protected routes with middleware

- 📊 **Problem Management**

  - RESTful API for 1800+ coding problems
  - Company-wise problem filtering
  - Difficulty-based categorization
  - Tag-based problem search
  - Pagination and sorting support

- 👤 **User Profiles**

  - User profile management
  - Problem progress tracking
  - Premium membership support

- 🛡️ **Security**

  - CORS configuration for cross-origin requests
  - Helmet.js for HTTP header security
  - Input sanitization
  - Rate limiting ready
  - Secure cookie handling

- 📦 **Database**
  - MongoDB with Mongoose ODM
  - Optimized queries and indexing
  - Data validation and schema enforcement

## 🏗️ Architecture

```
backend/
├── src/
│   ├── auth/              # Authentication strategies
│   │   └── google.js      # Google OAuth configuration
│   ├── config/            # Configuration files
│   │   ├── config.js      # App configuration
│   │   ├── db.js          # Database connection
│   │   └── redis.js       # Redis cache configuration
│   ├── controllers/       # Business logic
│   │   ├── adminController.js
│   │   ├── problemController.js
│   │   ├── profileController.js
│   │   └── userController.js
│   ├── middlewares/       # Custom middleware
│   │   ├── adminKey.js    # Admin authorization
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── errorHandler.js    # Global error handling
│   ├── models/            # Database schemas
│   │   ├── Problem.js     # Problem schema
│   │   └── User.js        # User schema
│   ├── routes/            # API routes
│   │   ├── adminRoutes.js
│   │   ├── auth.js
│   │   ├── problemRoutes.js
│   │   └── profileRoutes.js
│   ├── utils/             # Utility functions
│   │   ├── cache.js       # Caching utilities
│   │   ├── logger.js      # Logging utilities
│   │   └── sanitize.js    # Input sanitization
│   ├── index.js           # Entry point
│   └── server.js          # Express app setup
├── scripts/               # Utility scripts
│   └── import_problems_safe.js  # Problem import script
├── package.json
└── .env.example           # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn
- Google OAuth credentials (for social login)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/leetio
   CORS_ORIGIN=http://localhost:5173
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
   JWT_SECRET=your-secret-key-here
   CLIENT_URL=http://localhost:5173
   PORT=8080
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:8080`

5. **For production**
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Authentication

| Method | Endpoint                | Description           | Auth Required |
| ------ | ----------------------- | --------------------- | ------------- |
| POST   | `/auth/signup`          | Register new user     | No            |
| POST   | `/auth/login`           | Login user            | No            |
| GET    | `/auth/google`          | Google OAuth login    | No            |
| GET    | `/auth/google/callback` | Google OAuth callback | No            |

### Problems

| Method | Endpoint                  | Description                     | Auth Required |
| ------ | ------------------------- | ------------------------------- | ------------- |
| GET    | `/api/problems`           | Get all problems (with filters) | No            |
| GET    | `/api/problems/:id`       | Get problem by ID               | No            |
| GET    | `/api/problems/companies` | Get list of companies           | No            |

**Query Parameters for `/api/problems`:**

- `limit` - Number of problems per page (default: 50)
- `page` - Page number (default: 1)
- `company` - Filter by company name
- `difficulty` - Filter by difficulty (Easy/Medium/Hard)
- `tags` - Filter by tags (comma-separated)
- `sort` - Sort field (e.g., `problemId`, `-difficulty`)

### Profile

| Method | Endpoint       | Description         | Auth Required |
| ------ | -------------- | ------------------- | ------------- |
| GET    | `/api/profile` | Get user profile    | Yes (JWT)     |
| PUT    | `/api/profile` | Update user profile | Yes (JWT)     |

### Admin (Protected)

| Method | Endpoint              | Description     | Auth Required |
| ------ | --------------------- | --------------- | ------------- |
| POST   | `/admin/problems`     | Add new problem | Yes (Admin)   |
| PUT    | `/admin/problems/:id` | Update problem  | Yes (Admin)   |
| DELETE | `/admin/problems/:id` | Delete problem  | Yes (Admin)   |

## 🔑 Authentication

### JWT Authentication

Protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Google OAuth Flow

1. Frontend redirects to `/auth/google`
2. User authenticates with Google
3. Backend receives user data
4. Creates/updates user in database
5. Generates JWT token
6. Redirects to frontend with token

## 📦 Database Schema

### User Model

```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  googleId: String,
  avatarUrl: String,
  isPremium: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Problem Model

```javascript
{
  problemId: Number (unique),
  title: String,
  difficulty: String (Easy/Medium/Hard),
  url: String,
  companies: [String],
  tags: [String],
  acceptanceRate: Number,
  createdAt: Date
}
```

## 🛠️ Technologies Used

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:**
  - Passport.js (Google OAuth)
  - JSON Web Tokens (JWT)
  - Bcrypt (password hashing)
- **Security:**
  - Helmet.js
  - CORS
  - Express Session
- **Caching:** Redis (optional)
- **Payment:** Razorpay integration
- **Dev Tools:** Nodemon

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTTP security headers with Helmet
- CORS configuration for trusted origins
- Input sanitization
- Secure cookie handling (httpOnly, sameSite, secure)
- Environment variable configuration
- Error handling without sensitive data exposure

## 🌐 CORS Configuration

The API accepts requests from:

- Production frontend: `https://leet-io-frontend.onrender.com`
- Local development: `http://localhost:5173`, `http://localhost:3000`
- Configurable via `CLIENT_URL` environment variable

## 📝 Environment Variables

| Variable               | Description                | Required           |
| ---------------------- | -------------------------- | ------------------ |
| `MONGODB_URI`          | MongoDB connection string  | Yes                |
| `JWT_SECRET`           | Secret key for JWT signing | Yes                |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID     | Yes (for OAuth)    |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret        | Yes (for OAuth)    |
| `GOOGLE_CALLBACK_URL`  | OAuth callback URL         | Yes (for OAuth)    |
| `CLIENT_URL`           | Frontend URL for CORS      | Yes                |
| `PORT`                 | Server port                | No (default: 8080) |
| `REDIS_URL`            | Redis connection string    | No (optional)      |
