# DevFlow AI

Premium AI-powered project & task management platform built for the Innovation Hacks Full Stack Development Internship capstone.

## Why this design

The visual language is inspired by the premium, minimal feel of the provided Vista storefront reference while being redesigned for a developer productivity product: dark editorial hero, rounded cards, high-contrast typography, soft gradients, and responsive layouts.

The internship guide asks the capstone to combine authentication, dashboard statistics, project management, task management, an AI capability, REST APIs, a persistent database, responsive UI, and a production-ready repository structure. DevFlow AI implements that flow in one app.

## Stack

- React + Vite
- Express + Node.js
- MongoDB + Mongoose
- JWT authentication
- OpenAI-compatible AI task generation with a local fallback
- Lucide icons

## Core features

- Registration, login, logout, protected workspace
- Dashboard with project stats, progress and recent activity
- Project creation and project overview
- Task creation and task status / priority management
- Search-friendly API surface and clean HTTP status handling
- AI Copilot for task generation
- Responsive desktop/tablet/mobile UI
- Loading, empty and error states
- Demo workspace seeding

## Run locally

### 1. Start MongoDB

Use a local MongoDB service or a MongoDB Atlas connection string.

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Set `MONGODB_URI` and `JWT_SECRET`. Add `OPENAI_API_KEY` if you want live AI generation. Without it, the AI Copilot uses a deterministic local fallback so the UI remains functional.

### 3. Install dependencies

From the repository root:

```bash
npm install
npm run install:all
```

### 4. Start the app

```bash
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:5000

## Demo login

Email: `demo@devflow.app`  
Password: `Demo123!`

The server seeds a demo user and sample projects/tasks on first connection.

## Important

Never commit `.env` files, API keys, passwords, or database credentials. Submit `.env.example` instead.

## API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET|POST /api/projects`
- `GET|PATCH|DELETE /api/projects/:id`
- `GET|POST /api/tasks`
- `PATCH|DELETE /api/tasks/:id`
- `POST /api/ai/generate-tasks`
- `GET /api/health`
