import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import crypto from 'node:crypto'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import dashboardRoutes from './routes/dashboard.js'
import aiRoutes from './routes/ai.js'
import User from './models/User.js'
import Project from './models/Project.js'
import Task from './models/Task.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'devflow-ai' }))
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/ai', aiRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err?.name === 'ValidationError') return res.status(400).json({ message: 'Validation failed.', details: err.message })
  res.status(500).json({ message: 'Unexpected server error.' })
})

async function seedDemo() {
  const email = 'demo@devflow.app'
  let user = await User.findOne({ email })
  if (!user) {
    const hash = crypto.createHash('sha256').update('Demo123!').digest('hex')
    user = await User.create({ name: 'Alex Morgan', email, passwordHash: hash, avatar: 'AM' })
  }
  if (await Project.countDocuments({ owner: user._id }) === 0) {
    const p1 = await Project.create({ owner: user._id, name: 'Nebula Mobile', description: 'Launch the next-generation client experience.', color: '#6c5ce7', tags: ['Mobile', 'React Native'] })
    const p2 = await Project.create({ owner: user._id, name: 'Pulse Analytics', description: 'Make team performance visible at a glance.', color: '#16b6c9', tags: ['Data', 'Dashboard'] })
    await Task.insertMany([
      { title: 'Finalize onboarding flow', project: p1._id, assignee: user._id, status: 'done', priority: 'high' },
      { title: 'Wire API error states', project: p1._id, assignee: user._id, status: 'in-progress', priority: 'urgent' },
      { title: 'Polish empty states', project: p1._id, assignee: user._id, status: 'todo', priority: 'medium' },
      { title: 'Define KPI cards', project: p2._id, assignee: user._id, status: 'done', priority: 'medium' },
      { title: 'Build filters', project: p2._id, assignee: user._id, status: 'in-progress', priority: 'high' },
      { title: 'Connect analytics model', project: p2._id, assignee: user._id, status: 'todo', priority: 'medium' }
    ])
  }
}

const port = Number(process.env.PORT || 5000)
const mongo = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devflow_ai'

mongoose.connect(mongo).then(async () => {
  await seedDemo()
  app.listen(port, () => console.log(`DevFlow API running on http://localhost:${port}`))
}).catch(err => {
  console.error('MongoDB connection failed:', err.message)
  process.exit(1)
})
