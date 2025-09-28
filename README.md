# BudgetBuddy ERP

A full-stack finance management system that combines a modern React frontend with an Express + MongoDB backend. The project now ships with a dedicated `frontend/` and `backend/` separation and connects to the provided MongoDB Atlas cluster out of the box—no Docker required.

![BudgetBuddy ERP Dashboard](https://github.com/user-attachments/assets/c8d497fe-451a-4993-b64b-8d40f1978fde)

## ✨ Highlights
- **Rich ERP features:** budgets, expenses, transactions, reports, categories, and user management with role-based access.
- **Production-ready backend:** Express.js (TypeScript), MongoDB Atlas, JWT auth, rate limiting, helmet, CORS, and comprehensive error handling.
- **Modern frontend:** React 18 + Vite, Tailwind CSS with shadcn/ui, TanStack Query/Table, React Hook Form + Zod, and advanced dashboard widgets.


## 🏗️ Architecture Overview
| Layer     | Stack & Notes |
|-----------|---------------|
| Frontend  | React 18 (TypeScript), Vite, Tailwind, shadcn/ui, TanStack Query/Table |
| Backend   | Express.js (TypeScript), MongoDB via Mongoose, JWT auth, rate limiting, helmet, CORS |
| Database  | MongoDB Atlas (default) with optional local MongoDB fallback |

```
/
├── frontend/               # React + Vite client
│   ├── src/                # Components, pages, hooks, contexts
│   ├── public/             # Static assets
│   └── package.json        # Client scripts & deps
└── backend/                # Express API server
    ├── server/             # TypeScript backend source
    ├── .env                # MongoDB + server config (example included)
    └── package.json        # Server scripts & deps
```

## 🚀 Getting Started
### 1. Prerequisites
- Node.js 18+
- npm (bundled with Node)

### 2. Clone the repository
```bash
git clone <repository-url>
cd budgetbuddy-erp
```

### 3. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Backend (from repo root)
cd ../backend
npm install
```

### 4. Configure environment variables
```bash
cp .env.example .env
```
The backend `.env` is pre-populated with:
```

FRONTEND_URL=http://localhost:5173
```
Adjust values only if you need a different database or frontend URL. Set `USE_LOCAL_MONGO=true` to fall back to a local MongoDB instance defined by `MONGODB_LOCAL_URI`.

### 5. Run the app (no Docker!)
Open two terminals:

```bash
# Terminal 1 – backend
cd backend
npm run dev  # http://localhost:3000

# Terminal 2 – frontend
cd frontend
npm run dev   # http://localhost:5173
```
The frontend expects the API at `http://localhost:3000/api`. You can override this with `VITE_API_URL` in a frontend `.env` if needed.

### 6. Seed sample data (optional)
```bash
cd backend
npm run seed
```
This populates MongoDB with demo users, budgets, expenses, and transactions (default admin: `john.doe@company.com` / `password123`).

### 7. Verify the MongoDB connection (optional)
```bash
cd backend
npm run test:mongo
```
The script connects to the configured URI, inserts a test document, and cleans it up.

## 🔧 Production Builds
```bash
# Backend
cd backend
npm run build      # tsc -p server/tsconfig.json
npm start          # runs dist/server.js

# Frontend
cd frontend
npm run build      # outputs to frontend/dist
npm run preview    # optional static preview
```
Deploy the built frontend however you prefer (static hosting, CDN, etc.) and run the backend on Node 18+ with the same `.env` configuration.

## 📡 Core API Endpoints
- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/profile`, `PATCH /api/auth/profile`, `PATCH /api/auth/change-password`
- **Budgets:** `GET /api/budgets`, `POST /api/budgets`, `PATCH /api/budgets/:id`, `DELETE /api/budgets/:id`
- **Expenses:** `GET /api/expenses`, `POST /api/expenses`, `PATCH /api/expenses/:id`, `PATCH /api/expenses/:id/approve`, `PATCH /api/expenses/:id/reject`, `DELETE /api/expenses/:id`
- **Dashboard:** `GET /api/dashboard/metrics`, `GET /api/dashboard/alerts`, `GET /api/dashboard/recent-transactions`, `GET /api/dashboard/pending-expenses`
- **Health Check:** `GET /api/health`

Routes for transactions, categories, and users are scaffolded and ready for further expansion.

## 🛡️ Security & Reliability
- JWT authentication with role-based permissions (Admin, Manager, User)
- bcrypt password hashing (configurable salt rounds)
- Helmet security headers, CORS with configurable origin, Express rate limiting
- Centralized error handling and 404 fallthrough
- Graceful shutdown hooks for SIGINT/SIGTERM

## 👥 Default Roles
| Role   | Capabilities |
|--------|--------------|
| Admin  | Full access, user management, approvals |
| Manager| Department-level oversight and approvals |
| User   | Submit expenses, view personal data |

## 🙌 Need Help?
Open an issue or reach out through the repository discussions. Happy budgeting!
