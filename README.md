# DevFlow — AI-Powered Project & Task Management Platform

Submission for the **Innovation Hacks Full Stack Development Internship**.

A connected Next.js application with a responsive dashboard, REST API, MongoDB persistence, JWT authentication, and AI-assisted task generation.

## Features
- Register/login/logout with bcrypt + JWT httpOnly cookies
- Protected dashboard and project routes
- Project and task CRUD
- Search and task filtering
- Status, priority, due dates and project progress
- AI-assisted starter task generation with local fallback
- MongoDB + Mongoose persistence
- Responsive Tailwind UI

## Tech Stack
Next.js 14 · React 18 · Tailwind CSS · Node.js · MongoDB · Mongoose · JWT · bcrypt · Recharts

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `MONGODB_URI` and `JWT_SECRET` in `.env.local`. Optional `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` enables real LLM suggestions.

## API
Authentication: `/api/auth/*`  
Projects: `/api/projects/*`  
Tasks: `/api/tasks/*`  
AI suggestions: `/api/ai/suggest-tasks`

## Security
Secrets are excluded through `.gitignore`; passwords are hashed and project/task access is scoped to the authenticated owner.
