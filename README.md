<div align="center">

# 🚀 DevFlow

### AI-Powered Project & Task Management Platform

**A modern full-stack productivity workspace built for the Innovation Hacks Full Stack Development Internship.**

<p>
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

<p>
  <img src="https://img.shields.io/badge/Authentication-JWT-orange?style=flat-square" alt="JWT" />
  <img src="https://img.shields.io/badge/API-REST-blue?style=flat-square" alt="REST API" />
  <img src="https://img.shields.io/badge/AI-Task%20Generation-purple?style=flat-square" alt="AI" />
</p>

</div>

---

## ✨ Overview

**DevFlow** is a full-stack project and task management application designed to help teams and individual developers organize projects, track work, monitor progress, and accelerate planning with AI-assisted task generation.

The application combines a clean responsive interface with secure authentication, MongoDB persistence, protected REST APIs, project/task CRUD operations, filtering, progress tracking, and an AI suggestion layer with a local fallback.

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | Registration, login and logout using bcrypt + JWT httpOnly cookies |
| 📁 **Project Management** | Create, view, update and delete projects |
| ✅ **Task Management** | Full task CRUD with status, priority and due dates |
| 📊 **Progress Tracking** | Project progress and task status visualization |
| 🔎 **Search & Filters** | Quickly find tasks and filter by relevant attributes |
| 🤖 **AI Task Generation** | Generate starter tasks from project context |
| 🧠 **Local AI Fallback** | Task generation remains available without an external LLM key |
| 🗄️ **MongoDB Persistence** | Mongoose-backed data storage |
| 📱 **Responsive UI** | Designed for desktop and smaller screens |
| 🛡️ **Protected Resources** | Project/task access is scoped to the authenticated owner |

---

## 🧩 Application Flow

```text
                 ┌──────────────────────┐
                 │       DevFlow        │
                 │   Project Workspace  │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        Authentication   Projects        Tasks
             │              │              │
             ▼              ▼              ▼
          JWT Auth      CRUD + Stats    CRUD + Filters
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                     ┌─────────────┐
                     │   MongoDB   │
                     │  Mongoose   │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ AI Suggest  │
                     │   Engine    │
                     └─────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**
- **React 18**
- **Tailwind CSS**
- **Recharts**

### Backend
- **Next.js API Routes**
- **Node.js**
- **MongoDB**
- **Mongoose**

### Authentication & Security
- **JWT**
- **httpOnly cookies**
- **bcrypt password hashing**
- Owner-scoped project and task access

### AI
- OpenAI integration
- Anthropic integration
- Local fallback task generator

---

## 📂 Project Structure

```text
DevFlow/
├── components/          # Reusable React UI components
├── lib/                 # Database, auth and application utilities
├── models/              # Mongoose data models
├── pages/
│   ├── api/             # REST API endpoints
│   └── ...              # Application pages
├── scripts/             # Utility / seed scripts
├── styles/              # Global and Tailwind styles
├── .env.example         # Environment variable template
├── jsconfig.json        # JavaScript path configuration
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
└── README.md            # Project documentation
```

---

## ⚡ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mohitrath/Full-stack-internship.git
cd Full-stack-internship
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Update `.env.local`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
NODE_ENV=development
```

> **Never commit `.env.local` or real API keys to GitHub.**

### 4. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🌱 Demo Data

If the project seed script is configured for your environment, run:

```bash
npm run seed
```

This creates demo data for local development.

---

## 🔌 API Overview

### Authentication

```text
/api/auth/*
```

Handles registration, login, logout and authentication state.

### Projects

```text
/api/projects/*
```

Project creation, retrieval, updates and deletion.

### Tasks

```text
/api/tasks/*
```

Task creation, retrieval, updates, deletion and filtering.

### AI Suggestions

```text
/api/ai/suggest-tasks
```

Generates starter tasks from project information using the configured AI provider or local fallback.

---

## 🔒 Security

DevFlow is designed with application-level security in mind:

- Passwords are hashed with **bcrypt**.
- Authentication uses **JWT** stored in httpOnly cookies.
- Protected routes require authentication.
- Project and task access is scoped to the authenticated owner.
- Environment secrets are excluded through `.gitignore`.

---

## 📈 Why DevFlow?

Traditional task managers often separate project planning from execution. DevFlow brings them together in one workspace and adds AI-assisted planning to reduce the time between **"I have an idea"** and **"I know what to build next."**

### The goal

> **Plan faster. Execute clearly. Track progress. Ship better.**

---

## 💡 Future Enhancements

- 👥 Team collaboration and role-based permissions
- 💬 Real-time comments and activity feeds
- 🔔 Notifications and reminders
- 📅 Calendar and timeline views
- 🧩 Kanban drag-and-drop workflow
- 📊 Advanced analytics and productivity insights
- 🔗 GitHub / GitLab integration
- ☁️ Production deployment with CI/CD

---

## 🏆 Internship Submission

**Program:** Innovation Hacks — Full Stack Development Internship  
**Project:** DevFlow — AI-Powered Project & Task Management Platform

Built as a full-stack implementation demonstrating frontend development, REST API design, authentication, database integration, responsive UI, and AI-assisted functionality.

---

<div align="center">

### ⭐ If you find DevFlow useful, consider starring the repository!

**Built with ❤️ using Next.js, React, MongoDB and AI**

</div>
