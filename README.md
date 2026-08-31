# MERN Stack Authentication System

A secure, modern, and production-ready full-stack authentication system built with the MERN stack (MongoDB, Express, React, Node.js), featuring a sleek responsive user interface, automated email flows, and robust testing.

---

## 🚀 Key Features

*   **User Registration & Verification**: Registers users securely with hashed passwords and generates a 6-digit verification code.
*   **Email Automation**: Integrates with [Brevo](https://www.brevo.com) to send transactional verification emails, welcome letters, password reset requests, and password reset success confirmations.
*   **Secure Authentication & Session Management**: Utilizes dual JSON Web Token (JWT) architecture with HttpOnly cookies (`accessToken` and `refreshToken`) to defend against XSS and CSRF attacks.
*   **Password Recovery**: Secure password reset flow using token expiration (1-hour expiry).
*   **Input Validation**: Strong request body checking using Zod schemas on the API boundary.
*   **State Management**: React app state is managed dynamically and globally using Zustand.
*   **Premium UI/UX**: Responsive styling with Tailwind CSS, Lucide icons, and interactive transitions powered by Framer Motion.
*   **Automated Testing Suite**: Full unit and endpoint integration testing coverage utilizing Jest and Supertest.

---

## 🛠️ Tech Stack

### Backend
*   **Runtime & Framework**: Node.js, Express
*   **Database**: MongoDB, Mongoose
*   **Security**: BcryptJS, JSON Web Tokens (JWT), Cookie-Parser
*   **Validation**: Zod
*   **Mailing**: Brevo API
*   **Testing**: Jest, Supertest, Babel (for ES Modules support)

### Frontend
*   **Framework & Build Tool**: React 19, Vite
*   **Styling & Icons**: Tailwind CSS, PostCSS, Lucide React
*   **Animation**: Framer Motion
*   **State Management**: Zustand
*   **HTTP Client**: Axios

---

## 📁 Project Structure

```text
MERN_Auth/
├── backend/
│   ├── __tests__/            # Jest unit and integration tests
│   ├── config/               # Database connection settings
│   ├── controller/           # Express endpoint controllers
│   ├── email/                # Brevo API setup & HTML email templates
│   ├── middleware/           # Auth middlewares & Zod body validation
│   ├── model/                # Mongoose database models (User)
│   ├── route/                # Express routing definitions
│   ├── util/                 # Password schema regulations & JWT helper cookies
│   ├── app.js                # Express app setup (exported for tests & index)
│   └── index.js              # Server entry point (starts server and db connection)
├── frontend/
│   ├── src/
│   │   ├── component/        # Shared components (Inputs, Password strength meter, etc.)
│   │   ├── pages/            # View pages (Login, Register, Dashboard, Reset pass, etc.)
│   │   ├── store/            # Zustand global authentication store (authStore)
│   │   └── util/             # CSS & helper utilities
│   ├── vite.config.js        # Vite bundler options
│   └── package.json          # Frontend dependencies
├── .babelrc                  # Babel configuration for Jest transpilation
└── package.json              # Backend dependencies & central build script runner
```

---

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have Node.js and MongoDB installed locally or access to a MongoDB Atlas cluster, and a free [Brevo](https://www.brevo.com) account.

### 2. Environment Variables Setup
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mern-auth-db
ACCESS_TOKEN_SECRET=your_access_token_secret_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
ACCESS_TOKEN_EXPIRY=12h
REFRESH_TOKEN_EXPIRY=7d
BREVO_API_KEY=xkeysib-your_brevo_api_key
SENDER_EMAIL=your-verified-email@gmail.com
SENDER_NAME=MERN Auth
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

The server validates required environment variables at startup (skipped in test mode).

#### Brevo setup (free tier: 300 emails/day)
1. Sign up at [brevo.com](https://www.brevo.com).
2. Go to **SMTP & API** → **API Keys** → create a key → paste it as `BREVO_API_KEY`.
3. Go to **Senders** → **Add a sender** → enter your email (e.g. Gmail) → verify it via the link Brevo sends you.
4. Set `SENDER_EMAIL` to that verified email address.
5. Once verified, you can send to **any recipient** — perfect for letting others test your live app.

#### Optional: Redis rate limiting
Set `REDIS_URL` to share rate limits across multiple server instances (e.g. [Upstash](https://upstash.com) free tier). Without it, in-memory rate limiting is used (fine for single-server dev).

### 3. Installation
Install root dependencies and setup the sub-directories:

```bash
# Installs root and prefix frontend dependencies
npm run build
```

---

## 💻 Running the Application

To run the application in a local development environment, use the following commands:

```bash
# Start backend server in development mode (with nodemon)
npm run dev

# Start frontend application (in a separate terminal inside frontend/)
cd frontend
npm run dev
```

---

## 📡 API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check (DB status) |
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Optional | Logout (clears cookies) |
| POST | `/api/auth/verifyEmail` | Yes | Verify 6-digit code |
| POST | `/api/auth/resendVerification` | Yes | Resend verification code |
| POST | `/api/auth/forgetPassword` | No | Request password reset |
| POST | `/api/auth/resetPassword/:token` | No | Reset password |
| POST | `/api/auth/changePassword` | Yes | Change password while logged in |
| GET | `/api/auth/refreshServer` | Yes | Get current user (access token) |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |

---

## 🧪 Running Tests

The application uses Jest + Babel to handle ES module imports during test runs.

```bash
# Run unit and integration tests
npm test
```

---

## ☁️ Vercel Deployment

This project contains a configured [vercel.json](file:///D:/MERN_Stack_Journey/MERN_Auth/vercel.json) file to deploy both the Express API and the React frontend seamlessly.

### Configuration Details:
- **Backend API**: The Express app in [backend/app.js](file:///D:/MERN_Stack_Journey/MERN_Auth/backend/app.js) is compiled as a serverless function (`@vercel/node`) and handles all `/api/*` traffic.
- **Frontend SPA**: The built assets from the `frontend/dist` directory are served statically, with client-side routing fallback setup to support React Router natively on page refreshes.

### How to Deploy:
1. Connect your GitHub repository to Vercel.
2. In the Vercel Dashboard, import the project.
3. Configure your Environment Variables in the Vercel project settings (see the [Environment Variables](#2-environment-variables-setup) section).
4. Vercel will automatically detect the configuration and build + deploy the application!

