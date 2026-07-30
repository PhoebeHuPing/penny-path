# PennyPath

PennyPath is a full-stack expense tracking application designed to help users manage their finances effectively. Built with a modern tech stack, it provides a responsive and intuitive interface for tracking expenses, incomes, budgets, and more.

## ✨ Features

- **Authentication** — Register, login, logout, forgot/reset password
- **Expense Tracking** — Add, view, delete expenses with categories and filters
- **Income Tracking** — Record income sources with date filtering
- **Budget Management** — Set monthly budgets per category with spending status
- **Dashboard** — Monthly summary, daily average, month-over-month & year-over-year comparison
- **Charts** — Visual spending breakdowns with Recharts
- **Categories** — Custom user-defined expense categories
- **Export** — Download data as CSV or PDF reports
- **User Settings** — Change password, update profile, currency preference

## 🚀 Technologies

### Frontend
- **React 18** — UI library for building the interactive interface
- **Vite** — Ultra-fast build tool and development server
- **TypeScript** — Static typing for enhanced developer experience
- **Redux Toolkit** — Efficient and predictable state management
- **Tailwind CSS 4** — Utility-first CSS framework
- **Axios** — Promise-based HTTP client for API requests
- **Recharts** — Composable charting library for data visualization

### Backend
- **Python 3.10+** — Core programming language for the backend
- **FastAPI** — Modern, high-performance web framework for building APIs
- **Uvicorn** — Lightning-fast ASGI server implementation
- **PostgreSQL** — Database for persistent storage
- **SQLAlchemy** — Python SQL toolkit and ORM
- **python-jose** — JWT token handling
- **Passlib + bcrypt** — Secure password hashing

### Tooling
- **Vitest** — Next-generation testing framework for the frontend
- **ESLint / Prettier** — Code quality and formatting tools

## 📁 Project Structure

```text
/
├── client/                 # Frontend application (React + TypeScript)
│   ├── components/         # UI components
│   │   ├── App.tsx         # Root component with auth routing
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── DashboardPanel.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── IncomeForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── SpendingCharts.tsx
│   │   ├── BudgetPanel.tsx
│   │   ├── CategoryPanel.tsx
│   │   ├── ExportPanel.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── SearchFilter.tsx
│   │   └── Toast.tsx
│   ├── modules/            # Redux slices
│   │   ├── authSlice.ts
│   │   ├── expenseSlice.ts
│   │   ├── incomeSlice.ts
│   │   ├── budgetSlice.ts
│   │   ├── categorySlice.ts
│   │   ├── dashboardSlice.ts
│   │   └── appSlice.ts
│   ├── api.ts              # Axios instance with interceptors
│   ├── store.ts            # Redux store configuration
│   └── hooks.ts            # Typed Redux hooks
├── server/                 # Backend application (Python + FastAPI)
│   ├── main.py             # FastAPI entry point & all routes
│   ├── auth.py             # JWT & password utilities
│   └── db/
│       └── database.py     # SQLAlchemy models & DB setup
├── index.html              # Application entry point
├── vite.config.js          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── requirements.txt        # Python dependencies
└── package.json            # Node.js dependencies & scripts
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PhoebeHuPing/penny-path.git
   cd penny-path
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and a secure JWT_SECRET
   ```

5. Create the PostgreSQL database:
   ```bash
   createdb pennypath
   ```

### Development

Start both frontend and backend together:
```bash
npm start
```

Or start them separately:

```bash
# Frontend (http://localhost:5173)
npm run dev

# Backend (http://localhost:8000)
npm run dev:py
```

### Testing

```bash
npm test
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/pennypath` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:5173,http://127.0.0.1:5173` |
| `JWT_SECRET` | Secret key for JWT signing | `dev-secret-change-in-production` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Token expiry time in minutes | `1440` (24 hours) |
| `RESET_TOKEN_EXPIRE_MINUTES` | Password reset token expiry | `30` |

## 📡 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### User Settings
| Method | Path | Description |
|--------|------|-------------|
| PUT | `/api/user/password` | Change password |
| PUT | `/api/user/profile` | Update profile |

### Expenses
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/expenses` | List expenses (with filters) |
| POST | `/api/expenses` | Create expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Incomes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/incomes` | List incomes |
| POST | `/api/incomes` | Create income |
| DELETE | `/api/incomes/:id` | Delete income |

### Categories
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | List user's categories |
| POST | `/api/categories` | Create category |

### Budgets
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/budgets` | List budgets for a month |
| POST | `/api/budgets` | Create/update budget |
| DELETE | `/api/budgets/:id` | Delete budget |
| GET | `/api/budgets/status` | Budget vs actual spending |

### Dashboard & Export
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/summary` | Monthly financial summary |
| GET | `/api/export/csv` | Export data as CSV |
| GET | `/api/export/pdf` | Export data as PDF |

## 📜 License

This project is licensed under the ISC License.
