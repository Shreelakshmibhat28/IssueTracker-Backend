# Business Requirements Document (BRD)
## Issue Tracker System

---

### 1. Executive Summary
The **Issue Tracker System** is a web-based, full-stack application designed to streamline software issue management, task tracking, and cross-team resolution workflows. It provides a secure, role-restricted environment for development teams and administrative leads to report, track, update, assign, and discuss issues in real time.

---

### 2. Business Objectives
- **Centralized Issue Management:** Provide a unified repository for tracking bugs, features, and tasks across software projects.
- **Role-Based Access Control (RBAC):** Restrict system administration capabilities strictly to authorized Admins while allowing standard users full workflow control over their assigned and reported issues.
- **Account Security & Integrity:** Enforce deactivated account locks, hashed password storage, JWT token expiration, and secure payload validation.
- **Enhanced Collaboration:** Support threaded issue comments, real-time status/priority tracking, and seamless assignment changes.

---

### 3. User Roles & Access Matrix

| Feature / Action | Guest (Unauthenticated) | Standard User | Admin |
| :--- | :---: | :---: | :---: |
| Account Registration (`role` locked to `user`) | ✅ | ❌ | ❌ |
| Login / Auth Check | ✅ | ✅ | ✅ |
| View Assigned / Created Issues | ❌ | ✅ | ✅ |
| View All System Issues | ❌ | ❌ | ✅ |
| Create New Issue | ❌ | ✅ | ✅ |
| Edit Created Issue | ❌ | ✅ | ✅ |
| Change Issue Status (Assigned / Created) | ❌ | ✅ | ✅ |
| Reassign Issue / Edit Any Issue | ❌ | ❌ | ✅ |
| Delete Any Issue | ❌ | ❌ | ✅ |
| Post Comments (Assigned / Created Issues) | ❌ | ✅ | ✅ |
| Delete Own Comments | ❌ | ✅ | ✅ |
| Delete Any Comment | ❌ | ❌ | ✅ |
| View User Directory | ❌ | ❌ | ✅ |
| Activate / Deactivate Users | ❌ | ❌ | ✅ |
| System Dashboard Statistics | ❌ | ❌ (Personal Stats) | ✅ (Global Stats) |

---

### 4. Functional Requirements

#### 4.1 Authentication & Authorization
- **Self-Registration:** Registration endpoint creates standard users only. Client-submitted `role` field must be ignored or prohibited.
- **First Admin Seed:** Admin accounts are created strictly via CLI seed script (`npm run seed`).
- **Deactivated User Lock:** If a user account is deactivated by an admin, all subsequent API requests with that user's token are rejected with HTTP 403 (Forbidden), and login attempts are blocked.

#### 4.2 Issue Management Workflow
- **Issue Lifecycle:** Status transitions across `OPEN` ➡️ `IN_PROGRESS` ➡️ `RESOLVED` ➡️ `CLOSED`.
- **Priority Levels:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- **Validation:**
  - `title`: Required, 3–100 characters.
  - `description`: Required, min 10 characters.
  - `priority`: Enum [`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`].
  - `status`: Enum [`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`].
- **Filters & Search:** Filtering by status, priority, and text search query.

#### 4.3 Commenting & Activity Log
- Users can post markdown/plain text comments on issues assigned to them or created by them.
- Admins can post comments on any issue and delete any comment.

#### 4.4 User & Admin Management
- Admins can toggle user activation (`isActive: true/false`).
- Admins cannot deactivate their own account.

---

### 5. Non-Functional Requirements
- **Security:** Passwords salted & hashed with `bcryptjs`. Express security headers with `helmet`. CORS protection. Rate limiting on auth routes (max 15 requests per 15 minutes).
- **Performance:** Fast client side SPA rendering powered by React 19 + Vite 8. Express REST server with indexed Mongoose queries.
- **Maintainability:** Modular separation of concerns (`routes`, `controllers`, `models`, `middleware`, `services`, `context`, `components`, `pages`).

---

### 6. Deployment Architecture
- **Backend:** Node.js Express API on Port `5000` (or `PORT` env variable). Hosted on Node-compatible cloud environments (Render, Railway, Fly.io).
- **Frontend:** Single Page Application (SPA) built with Vite and React 19. Deployed on Vercel with URL rewrite to `index.html`.
- **Database:** MongoDB Atlas / MongoDB Server via Mongoose connection URI.
