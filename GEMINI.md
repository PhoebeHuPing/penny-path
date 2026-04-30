# Project Overview

This project is a React boilerplate, set up with Vite for a fast development experience. It includes basic configurations for TypeScript, ESLint, and Prettier to ensure code quality and consistency. The application structure is simple, with a main `App.tsx` component as the entry point.

## Key Technologies

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A modern frontend build tool that significantly improves the development experience.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **ESLint:** A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
*   **Prettier:** An opinionated code formatter.

## Building and Running

### Development

Prompt the user to run the development server themselves in a separate terminal window.

```bash
npm run dev
```

This will start the Vite development server, and you can view the application at `http://localhost:5173`.

### Building for Production

To create a production build, use the following command:

```bash
npm run build
```

This will create a `dist` folder with the optimized and minified assets for your application.

### Testing

This project uses Vitest for running unit tests. To execute the test suite, run:

```bash
npm test -- --run
```

## Development Conventions

### Linting and Formatting

This project uses ESLint for static code analysis and Prettier for code formatting. To check for linting errors, run:

```bash
npm run lint
```

To automatically format the code, use:

```bash
npm run format
```

### Project Structure

The main application code is located in the `client` directory. The entry point is `client/index.tsx`, which renders the main `App` component. Reusable components are placed in the `client/components` directory.

## PromptKit Quick Reference
- Review the available artefacts when the student requests them:
  - Protocol: `promptkit/protocols/setup.md` — instructions for updating these CLI briefings.
  - Workflow: `promptkit/workflows/tutor.md` — guide for tutoring/explanation sessions.
  - Workflow: `promptkit/workflows/reflect.md` — guide for documenting outcomes and next steps.
- Student notes live in `promptkit/notes/`; The table in `progress-journal.md` is main place to update with reflections. Instructor Activities are in `promptkit/activities/` (read-only).
- When new workflows arrive, expect additional files under `promptkit/workflows/`.