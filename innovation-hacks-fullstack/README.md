# DevFlow AI

> AI-powered project and task management workspace for developers.

DevFlow AI is a full-stack productivity application for organizing projects, managing tasks, tracking completion, and using AI to turn project ideas into actionable work. The application is built with Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, JWT authentication, and optional OpenAI integration.

## ✨ Features

### 🔐 Authentication
- User registration and login
- Password hashing with bcrypt
- JWT-based authentication stored in an HTTP-only cookie
- Protected dashboard and project routes
- Logout support

### 📁 Project Management
- Create projects with a name and description
- View projects belonging to the authenticated user
- Open an individual project workspace
- Track task completion percentage for each project
- Persist project and task data in PostgreSQL

### ✅ Task Management
- Create tasks inside projects
- Set status: To do, In progress, or Done
- Set priority: Low, Medium, High, or Urgent
- Search tasks by title
- Filter tasks by status
- Update task status and priority
- Delete tasks
- Project-level progress tracking

### 🤖 AI Productivity
- AI Task Generator: turn a project idea into actionable tasks
- AI Project Summary: summarize the current task state of a project
- Optional OpenAI integration
- Deterministic fallback support when a live API key is not configured

### 📊 Dashboard
- Project count
- Total task count
- Completed task count
- Overall completion percentage
- Project cards with progress indicators
- Task search and status filtering

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Authentication | JWT (jose) + bcrypt |
| Validation | Zod |
| AI | OpenAI API |
| Deployment | Vercel recommended |

## 🏗️ Architecture

~~~text
Browser / React UI
       │
       ▼
Next.js App Router
       │
       ├── Server Components
       ├── Client Components
       │
       ▼
REST API Route Handlers
       │
       ├── Authentication
       ├── Projects
       ├── Tasks
       └── AI
       │
       ▼
Prisma ORM
       │
       ▼
PostgreSQL
~~~

## 📂 Project Structure

~~~text
innovation-hacks-fullstack/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── generate/
│   │   │   └── summarize/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── me/
│   │   │   └── register/
│   │   ├── projects/
│   │   └── tasks/
│   ├── dashboard/
│   ├── login/
│   ├── projects/
│   ├── register/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx
│   └── ProjectPage.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── prisma.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
~~~

## 🚀 Getting Started

### 1. Clone the repository

~~~bash
git clone https://github.com/Mohitrath/Full-stack-internship.git
cd Full-stack-internship/innovation-hacks-fullstack
~~~

### 2. Install dependencies

Node.js 20+ is recommended.

~~~bash
npm install
~~~

### 3. Configure environment variables

Create a .env file from .env.example:

~~~env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/project_manager?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
OPENAI_API_KEY="optional-for-live-ai"
OPENAI_MODEL="gpt-4.1-mini"
NEXT_PUBLIC_APP_NAME="DevFlow AI"
~~~

Keep credentials and API keys out of Git.

### 4. Generate Prisma Client

~~~bash
npx prisma generate
~~~

### 5. Create the database schema

For a new development database:

~~~bash
npx prisma migrate dev --name init
~~~

### 6. Optional: seed the demo account

~~~bash
npx prisma db seed
~~~

### 7. Start the development server

~~~bash
npm run dev
~~~

Open http://localhost:3000

## 🔑 Demo Account

The login page is configured with:

~~~text
Email:    demo@flowpilot.dev
Password: password123
~~~

The account must exist in the database. Run the Prisma seed command if the seed data is available in your environment.

For production, use your own account and never expose real credentials in the repository.

## 🔌 API Reference

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Authenticate a user |
| POST | /api/auth/logout | Clear the authentication cookie |
| GET | /api/auth/me | Get the current authenticated user |

### Projects

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/projects | List the user's projects |
| POST | /api/projects | Create a project |
| GET | /api/projects/:id | Get a project and its tasks |
| PATCH | /api/projects/:id | Update a project |
| DELETE | /api/projects/:id | Delete a project |

### Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create a task |
| PATCH | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |

### AI

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/ai/generate | Generate actionable tasks from a project idea |
| POST | /api/ai/summarize | Summarize project task status |

## 🗄️ Database Model

The Prisma schema contains three main models:

- User — account information and ownership relationships
- Project — project name, description, owner, and tasks
- Task — title, status, priority, due date, project, and optional assignee

Task status values:

~~~text
TODO
IN_PROGRESS
DONE
~~~

Priority values:

~~~text
LOW
MEDIUM
HIGH
URGENT
~~~

## ☁️ Deployment

The application can be deployed as a Next.js application on Vercel with a hosted PostgreSQL database.

Configure these environment variables in the deployment platform:

~~~text
DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
OPENAI_MODEL
NEXT_PUBLIC_APP_NAME
~~~

After deployment, verify:

1. Registration works.
2. Login creates an authenticated session.
3. Projects can be created and loaded.
4. Tasks can be created, updated, filtered, and deleted.
5. PostgreSQL persistence works.
6. AI features work when OPENAI_API_KEY is configured.
7. The production build completes successfully.

## 🔒 Security Notes

- Passwords are hashed with bcrypt.
- Authentication uses an HTTP-only cookie.
- Do not commit .env files or API keys.
- Use a strong random JWT_SECRET in production.
- Use a managed PostgreSQL database with SSL enabled in production.
- Rotate exposed credentials immediately if they are accidentally committed.

## 🧪 Useful Commands

~~~bash
# Development
npm run dev

# Production build
npm run build

# Production server
npm run start

# Generate Prisma client
npm run prisma:generate

# Create/apply a development migration
npm run prisma:migrate

# Seed database
npx prisma db seed
~~~

## 🎯 Project Goal

DevFlow AI is designed as a developer productivity workspace that combines traditional project management with AI-assisted planning.

~~~text
Project Idea
    ↓
Create Project
    ↓
Generate / Add Tasks
    ↓
Set Priority & Status
    ↓
Track Progress
    ↓
Generate AI Summary
~~~

## 📌 Repository

GitHub repository:

https://github.com/Mohitrath/Full-stack-internship

Application source:

~~~text
innovation-hacks-fullstack/
~~~

## 📄 License

No separate license has been specified in the repository yet.
