# Issue Tracker System 🛠️

A modern, full-stack Issue Tracker web application built with **Node.js, Express, MongoDB (Mongoose), React (Vite), and Tailwind CSS**. Designed to be clean, practical, secure, and realistic.

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js, MongoDB & Mongoose, JWT (JSON Web Tokens), bcryptjs, express-validator, helmet, cors, express-rate-limit.
- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, Axios.
- **Architecture:** RESTful API with strict Role-Based Access Control (RBAC).

---

## 📁 Repository Structure

```
issue-tracker/
├── BRD.md                   # Business Requirements Document
├── README.md                # Main documentation
├── .gitignore               # Root gitignore rules
├── backend/
│   ├── config/
│   │   └── db.js            # Mongoose connection
│   ├── controllers/         # Auth, Issue, Comment, User, Dashboard controllers
│   ├── middleware/          # Auth JWT verification, Admin authorization, Rate limiters
│   ├── models/              # User, Issue, Comment Mongoose schemas
│   ├── routes/              # Express endpoint routers
│   ├── scripts/
│   │   └── seed-admin.js    # CLI Admin Seeding Script
│   ├── utils/               # JWT helper utils
│   ├── app.js               # Express application initialization
│   ├── server.js            # Server entrypoint
│   └── .env
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/      # Reusable UI components & Protected/Admin routes
    │   ├── context/         # AuthContext & state provider
    │   ├── hooks/           # Custom useAuth hook
    │   ├── layouts/         # MainLayout with Navbar & Mobile drawer
    │   ├── pages/           # Login, Register, Dashboard, IssueList, IssueDetail, IssueForm, UserManagement, NotFound
    │   ├── services/        # Axios API client & interceptors
    │   ├── App.jsx          # Router & Route declarations
    │   └── main.jsx
    ├── vercel.json          # Vercel deployment rewrite rules
    └── .env
```

---

## ⚙️ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/issue-tracker`) or a MongoDB Atlas URI connection string.

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (or copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/issue-tracker
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

#### Seed the Initial Admin Account
Admin accounts **cannot** be created through registration API. Run the seed script to create your first admin:

```bash
npm run seed
```
*Default Seeded Credentials:*
- **Email:** `admin@example.com`
- **Password:** `Admin123!`

#### Run Backend Server
```bash
# Development server with auto-reload
npm run dev

# Production server
npm start
```
The API server will run at `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (or copy from `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

#### Run Frontend Client
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔐 Role-Based Access Control (RBAC) Overview

### Admin Capabilities
- **Users:** View all users, activate/deactivate standard users (cannot deactivate self).
- **Issues:** View all system issues, create, edit, delete any issue, assign or reassign issues to any active user.
- **Comments:** Post comments on any issue, delete any comment.
- **Dashboard:** View global system-wide issue metrics, priority distributions, and user stats.

### Standard User Capabilities
- **Authentication:** Register (always creates `role: "user"`), Login, View profile.
- **Issues:** View issues assigned to them or created by them. Create new issues, update status/details of their own issues.
- **Comments:** View & add comments on assigned/created issues, delete own comments.
- **Dashboard:** View personal workload stats and issue breakdowns.

---

## 📡 Key REST API Endpoints

### Auth Routes (`/api/auth`)
- `POST /api/auth/register` — Register a standard user
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Get current logged-in user profile

### User Routes (`/api/users`) *(Admin Only)*
- `GET /api/users` — List all registered users
- `PATCH /api/users/:id/status` — Activate/Deactivate user account

### Issue Routes (`/api/issues`)
- `GET /api/issues` — List issues (Admin: all, User: assigned or created)
- `GET /api/issues/:id` — Get single issue details
- `POST /api/issues` — Create a new issue
- `PUT /api/issues/:id` — Update issue details / status / assignment
- `DELETE /api/issues/:id` — Delete issue (Admin only)

### Comment Routes (`/api/issues/:issueId/comments`)
- `GET /api/issues/:issueId/comments` — Get comments for an issue
- `POST /api/issues/:issueId/comments` — Add a comment to an issue
- `DELETE /api/issues/:issueId/comments/:commentId` — Delete a comment (Owner or Admin)

### Dashboard Routes (`/api/dashboard`)
- `GET /api/dashboard/stats` — Get dashboard metrics (Admin: global, User: personal)

---

## 🧪 Verification & Build

```bash
# Build frontend for production
cd frontend
npm run build
```

The output will be generated in `frontend/dist/`.
