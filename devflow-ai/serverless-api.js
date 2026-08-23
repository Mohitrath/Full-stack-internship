import crypto from 'node:crypto'

const DEMO_ID = 'demo-user-devflow-2026'
const SECRET = process.env.JWT_SECRET || 'devflow-demo-secret'
const users = new Map()
const projects = new Map()
const tasks = new Map()

const hash = (text) => crypto.createHash('sha256').update(text).digest('hex')
const now = () => new Date().toISOString()
const id = () => crypto.randomUUID()

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verify(token) {
  try {
    const [body, sig] = String(token || '').split('.')
    if (!body || !sig) return null
    const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
    if (sig !== expected) return null
    return JSON.parse(Buffer.from(body, 'base64url').toString())
  } catch {
    return null
  }
}

function seed() {
  if (users.has(DEMO_ID)) return
  const demo = {
    _id: DEMO_ID,
    name: 'Alex Morgan',
    email: 'demo@devflow.app',
    passwordHash: hash('Demo123!'),
    avatar: 'AM'
  }
  users.set(DEMO_ID, demo)

  const p1 = { _id: 'demo-project-nebula', owner: DEMO_ID, name: 'Nebula Mobile', description: 'Launch the next-generation client experience.', color: '#6c5ce7', status: 'active', dueDate: '2026-09-05' }
  const p2 = { _id: 'demo-project-pulse', owner: DEMO_ID, name: 'Pulse Analytics', description: 'Make team performance visible at a glance.', color: '#16b6c9', status: 'active', dueDate: '2026-09-12' }
  projects.set(p1._id, p1)
  projects.set(p2._id, p2)

  const demoTasks = [
    ['Finalize onboarding flow', p1._id, 'done', 'high'],
    ['Wire API error states', p1._id, 'in-progress', 'urgent'],
    ['Polish empty states', p1._id, 'todo', 'medium'],
    ['Define KPI cards', p2._id, 'done', 'medium'],
    ['Build filters', p2._id, 'in-progress', 'high'],
    ['Connect analytics model', p2._id, 'todo', 'medium']
  ]
  demoTasks.forEach(([title, project, status, priority], i) => {
    const t = { _id: `demo-task-${i}`, owner: DEMO_ID, title, description: '', project, assignee: DEMO_ID, status, priority, dueDate: null, createdAt: now(), updatedAt: now() }
    tasks.set(t._id, t)
  })
}

seed()

async function readBody(req) {
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  return await new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

function json(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(data))
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
}

function auth(req) {
  const payload = verify(req.headers.authorization?.replace(/^Bearer\s+/i, ''))
  if (!payload) return null
  if (payload.sub === DEMO_ID) return users.get(DEMO_ID)
  if (payload.email) return [...users.values()].find(u => u.email === payload.email) || null
  return users.get(payload.sub) || null
}

function projectView(p) {
  const ts = [...tasks.values()].filter(t => t.project === p._id)
  const done = ts.filter(t => t.status === 'done').length
  return { ...p, taskCount: ts.length, completed: done, progress: ts.length ? Math.round(done / ts.length * 100) : 0 }
}

function taskView(t) {
  const p = projects.get(t.project)
  const a = users.get(t.assignee)
  return {
    ...t,
    project: p ? { _id: p._id, name: p.name, color: p.color } : null,
    assignee: a ? { _id: a._id, name: a.name, avatar: a.avatar } : null
  }
}

function requireAuth(req, res) {
  const user = auth(req)
  if (!user) {
    json(res, 401, { message: 'Authentication required.' })
    return null
  }
  return user
}

export default async function handler(req, res) {
  seed()
  cors(res)
  if (req.method === 'OPTIONS') return json(res, 204, {})

  const path = (req.url || '/').split('?')[0].replace(/^\/api/, '') || '/'

  try {
    if (req.method === 'GET' && path === '/health') {
      return json(res, 200, { ok: true, service: 'devflow-ai', mode: 'vercel' })
    }

    if (req.method === 'POST' && path === '/auth/login') {
      const body = await readBody(req)
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      const user = [...users.values()].find(u => u.email === email)
      if (!user || user.passwordHash !== hash(password)) {
        return json(res, 401, { message: 'Invalid email or password.' })
      }
      const safeUser = { _id: user._id, name: user.name, email: user.email, avatar: user.avatar }
      return json(res, 200, { user: safeUser, token: sign({ sub: user._id, email: user.email }) })
    }

    if (req.method === 'POST' && path === '/auth/register') {
      const body = await readBody(req)
      const email = String(body.email || '').trim().toLowerCase()
      const name = String(body.name || '').trim() || 'New User'
      const password = String(body.password || '')
      if (!email || password.length < 6) return json(res, 400, { message: 'Email and a password of at least 6 characters are required.' })
      if ([...users.values()].some(u => u.email === email)) return json(res, 409, { message: 'An account with this email already exists.' })
      const u = { _id: id(), name, email, passwordHash: hash(password), avatar: name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase() }
      users.set(u._id, u)
      return json(res, 201, { user: { _id: u._id, name: u.name, email: u.email, avatar: u.avatar }, token: sign({ sub: u._id, email: u.email }) })
    }

    const user = requireAuth(req, res)
    if (!user) return

    if (req.method === 'GET' && path === '/dashboard') {
      const ps = [...projects.values()].filter(p => p.owner === user._id).map(projectView)
      const ts = [...tasks.values()].filter(t => t.owner === user._id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const completed = ts.filter(t => t.status === 'done').length
      const active = ts.filter(t => t.status === 'in-progress').length
      const overdue = ts.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
      return json(res, 200, { stats: { projects: ps.length, tasks: ts.length, completed, active, overdue }, projects: ps, tasks: ts.slice(0, 8).map(taskView) })
    }

    if (path === '/projects' && req.method === 'GET') {
      return json(res, 200, [...projects.values()].filter(p => p.owner === user._id).map(projectView))
    }

    if (path === '/projects' && req.method === 'POST') {
      const body = await readBody(req)
      const name = String(body.name || '').trim()
      if (!name) return json(res, 400, { message: 'Project name is required.' })
      const p = { _id: id(), owner: user._id, name, description: String(body.description || ''), color: body.color || '#6c5ce7', status: 'active', dueDate: body.dueDate || null }
      projects.set(p._id, p)
      return json(res, 201, projectView(p))
    }

    const projectMatch = path.match(/^\/projects\/([^/]+)$/)
    if (projectMatch) {
      const p = projects.get(projectMatch[1])
      if (!p || p.owner !== user._id) return json(res, 404, { message: 'Project not found.' })
      if (req.method === 'GET') return json(res, 200, projectView(p))
      if (req.method === 'PATCH') {
        const body = await readBody(req)
        Object.assign(p, { name: body.name ?? p.name, description: body.description ?? p.description, status: body.status ?? p.status, dueDate: body.dueDate ?? p.dueDate })
        return json(res, 200, projectView(p))
      }
      if (req.method === 'DELETE') {
        projects.delete(p._id)
        for (const t of [...tasks.values()]) if (t.project === p._id) tasks.delete(t._id)
        return json(res, 200, { ok: true })
      }
    }

    if (path === '/tasks' && req.method === 'GET') {
      return json(res, 200, [...tasks.values()].filter(t => t.owner === user._id).map(taskView))
    }

    if (path === '/tasks' && req.method === 'POST') {
      const body = await readBody(req)
      const p = projects.get(body.project)
      if (!p || p.owner !== user._id) return json(res, 400, { message: 'A valid project is required.' })
      const t = {
        _id: id(), owner: user._id, title: String(body.title || '').trim(), description: String(body.description || ''),
        project: p._id, assignee: body.assignee || user._id, status: body.status || 'todo', priority: body.priority || 'medium',
        dueDate: body.dueDate || null, createdAt: now(), updatedAt: now()
      }
      if (!t.title) return json(res, 400, { message: 'Task title is required.' })
      tasks.set(t._id, t)
      return json(res, 201, taskView(t))
    }

    const taskMatch = path.match(/^\/tasks\/([^/]+)$/)
    if (taskMatch) {
      const t = tasks.get(taskMatch[1])
      if (!t || t.owner !== user._id) return json(res, 404, { message: 'Task not found.' })
      if (req.method === 'PATCH') {
        const body = await readBody(req)
        Object.assign(t, { title: body.title ?? t.title, description: body.description ?? t.description, status: body.status ?? t.status, priority: body.priority ?? t.priority, dueDate: body.dueDate ?? t.dueDate })
        t.updatedAt = now()
        return json(res, 200, taskView(t))
      }
      if (req.method === 'DELETE') {
        tasks.delete(t._id)
        return json(res, 200, { ok: true })
      }
    }

    if (req.method === 'POST' && path === '/ai/generate-tasks') {
      const body = await readBody(req)
      const brief = String(body.brief || '').trim() || 'launch a new product'
      const name = String(body.projectName || 'New project')
      return json(res, 200, {
        tasks: [
          { title: `Define success criteria for ${name}`, priority: 'high', description: `Clarify outcomes, users, and measurable goals for ${brief}.` },
          { title: 'Break the scope into milestones', priority: 'high', description: 'Turn the project goal into small, testable delivery milestones.' },
          { title: 'Design the first usable flow', priority: 'medium', description: 'Map the key screens, states, and edge cases for the first release.' },
          { title: 'Implement and validate the critical path', priority: 'urgent', description: 'Build the smallest end-to-end slice and verify it with real usage.' },
          { title: 'Prepare launch checklist', priority: 'medium', description: 'Review quality, analytics, documentation, and deployment readiness.' }
        ]
      })
    }

    return json(res, 404, { message: 'Route not found.' })
  } catch (error) {
    console.error(error)
    return json(res, 500, { message: 'Unexpected server error.' })
  }
}
