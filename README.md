# PennyPath

PennyPath is a full-stack expense tracking application designed to help users manage their finances effectively. Built with a modern tech stack, it provides a responsive and intuitive interface for tracking daily expenses.

## 🚀 Technologies

### Frontend
- **React 18**: UI library for building the interactive interface.
- **Vite**: Ultra-fast build tool and development server.
- **TypeScript**: Static typing for enhanced developer experience and code quality.
- **Redux Toolkit**: Efficient and predictable state management.
- **React Redux**: Official Redux bindings for React.
- **Axios**: Promise-based HTTP client for API requests.
- **React Router**: Declarative routing for the single-page application.

### Backend
- **Python 3.10+**: Core programming language for the backend.
- **FastAPI**: Modern, high-performance web framework for building APIs.
- **Uvicorn**: Lightning-fast ASGI server implementation.
- **SQLite/PostgreSQL**: Database for persistent storage.

### Tooling
- **Vitest**: Next-generation testing framework for the frontend.
- **ESLint/Prettier**: Code quality and formatting tools.
- **Pip**: Python package installer.

## 📁 Project Structure

```text
/
├── client/          # Frontend application (React + TypeScript)
│   ├── components/  # Reusable UI components
L33- │   ├── modules/     # Redux modules (counter, channel, expense)
L34- │   └── store.ts     # Redux store configuration
├── server/          # Backend application (Python + FastAPI)
│   ├── main.py      # FastAPI entry point
│   └── db/          # Database configuration
├── public/          # Static assets
└── index.html       # Application entry point
```

## 🛠️ Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd PennyPath
   ```

2. Install Frontend dependencies:
   ```bash
   npm install
   ```

3. Install Backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Development

1. Start the Frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

2. Start the Backend server:
   ```bash
   python server/main.py
   ```
   The backend will be available at `http://localhost:8000`.

### Testing

Run the test suite using Vitest:
```bash
npm test
```

### Linting & Formatting

Check for linting issues:
```bash
npm run lint
```

Automatically format code:
```bash
npm run format
```

## 📜 License

This project is licensed under the ISC License.
