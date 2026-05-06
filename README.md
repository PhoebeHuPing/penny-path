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

### Backend (Placeholder)
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **PostgreSQL**: Robust relational database for persistent storage.

### Tooling
- **Vitest**: Next-generation testing framework.
- **ESLint**: Pluggable linting utility for JavaScript and TypeScript.
- **Prettier**: Opinionated code formatter.

## 📁 Project Structure

```text
/
├── client/          # Frontend application (React + TypeScript)
│   ├── components/  # Reusable UI components
│   ├── modules/     # Redux modules (counter, channel)
│   ├── slices/      # Redux slices (expense)
│   └── store.ts     # Redux store configuration
├── server/          # Backend application (Express)
│   └── db/          # Database configuration and migrations
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

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

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
