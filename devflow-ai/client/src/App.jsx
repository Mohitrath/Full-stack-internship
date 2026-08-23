import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowUpRight, Bell, BrainCircuit, CalendarDays, Check, ChevronDown,
  CircleHelp, Clock3, FolderKanban, LayoutDashboard, LogOut, Menu, Plus, Search,
  Settings2, Sparkles, Target, Trash2, X, Zap, Pencil, Filter, Save
} from 'lucide-react'

const STORAGE_KEY = 'devflow_workspace_v2'
const USER_KEY = 'devflow_user'

const seedProjects = [
  { id: 'p1', name: 'Nebula Mobile', description: 'Launch the next-generation client experience.', color: '#6c5ce7', status: 'active', dueDate: '2026-09-05' },
  { id: 'p2', name: 'Pulse Analytics', description: 'Make team performance visible at a glance.', color: '#16b6c9', status: 'active', dueDate: '2026-09-12' }
]

const seedTasks = [
  { id: 't1', title: 'Finalize onboarding flow', projectId: 'p1', priority: 'high', status: 'done', dueDate: '2026-08-26' },
  { id: 't2', title: 'Wire API error states', projectId: 'p1', priority: 'urgent', status: 'in-progress', dueDate: '2026-08-28' },
  { id: 't3', title: 'Polish empty states', projectId: 'p1', priority: 'medium', status: 'todo', dueDate: '2026-08-30' },
  { id: 't4', title: 'Define KPI cards', projectId: 'p2', priority: 'medium', status: 'done', dueDate: '2026-08-27' },
  { id: 't5', title: 'Build filters', projectId: 'p2', priority: 'high', status: 'in-progress', dueDate: '2026-08-31' },
  { id: 't6', title: 'Connect analytics model', projectId: 'p2', priority: 'medium', status: 'todo', dueDate: '2026-09-02' }
]

const demoUser = { _id: 'demo-user', name: 'Alex Morgan', email: 'demo@devflow.app', avatar: 'AM' }

const readStore = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (value?.projects && value?.tasks) return value
  } catch {}
  return { projects: seedProjects, tasks: seedTasks }
}

const saveStore = (store) => localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
const initials = (name = 'Alex Morgan') => name.split(' ').map(v => v[0]).slice(0, 2).join('').toUpperCase()
const fmtDate = (v) => v ? new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
  })
  const [store, setStore] = useState(readStore)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => saveStore(store), [store])
  useEffect(() => {
    if (!user && !location.pathname.startsWith('/auth')) navigate('/auth')
    if (user && location.pathname === '/auth') navigate('/')
  }, [user, location.pathname, navigate])

  const projects = store.projects
  const tasks = store.tasks

  const projectMap = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects])
  const withProject = (task) => ({ ...task, project: projectMap[task.projectId] })

  const notify = (message) => {
    setNotice(message)
    window.clearTimeout(window.__devflowNotice)
    window.__devflowNotice = window.setTimeout(() => setNotice(''), 2600)
  }

  const upsertProject = (form, editingId = null) => {
    if (!form.name.trim()) return
    if (editingId) {
      setStore(s => ({ ...s, projects: s.projects.map(p => p.id === editingId ? { ...p, ...form, name: form.name.trim() } : p) }))
      notify('Project updated')
    } else {
      const id = `p-${Date.now()}`
      setStore(s => ({ ...s, projects: [...s.projects, { id, ...form, name: form.name.trim(), status: 'active' }] }))
      notify('Project created')
    }
    setModal(null)
  }

  const deleteProject = (id) => {
    setStore(s => ({ projects: s.projects.filter(p => p.id !== id), tasks: s.tasks.filter(t => t.projectId !== id) }))
    notify('Project deleted')
  }

  const upsertTask = (form, editingId = null) => {
    if (!form.title.trim() || !form.projectId) return
    if (editingId) {
      setStore(s => ({ ...s, tasks: s.tasks.map(t => t.id === editingId ? { ...t, ...form, title: form.title.trim() } : t) }))
      notify('Task updated')
    } else {
      setStore(s => ({ ...s, tasks: [{ id: `t-${Date.now()}`, ...form, title: form.title.trim() }, ...s.tasks] }))
      notify('Task created')
    }
    setModal(null)
  }

  const deleteTask = (id) => {
    setStore(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }))
    notify('Task deleted')
  }

  const updateTaskStatus = (id, status) => {
    setStore(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, status } : t) }))
    notify('Task status updated')
  }

  const logout = () => {
    localStorage.removeItem(USER_KEY)
    setUser(null)
    navigate('/auth')
  }

  if (!user) return <AuthScreen onLogin={(u) => { localStorage.setItem(USER_KEY, JSON.stringify(u)); setUser(u); navigate('/') }} />

  const page = location.pathname.replace(/^\//, '') || 'overview'
  const pageKey = ['overview', 'projects', 'tasks', 'calendar', 'ai', 'analytics', 'settings'].includes(page) ? page : 'overview'

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} close={() => setMobileOpen(false)} user={user} logout={logout} />
      <main className="main-canvas">
        <Topbar user={user} onMenu={() => setMobileOpen(true)} onSearch={(q) => navigate(q ? `/tasks?q=${encodeURIComponent(q)}` : '/tasks')} />
        <div className="content">
          {pageKey === 'overview' && <Overview user={user} projects={projects} tasks={tasks} onNewTask={() => setModal({ type: 'task' })} onNewProject={() => setModal({ type: 'project' })} onAI={() => navigate('/ai')} />}
          {pageKey === 'projects' && <Projects projects={projects} tasks={tasks} onNew={() => setModal({ type: 'project' })} onEdit={p => setModal({ type: 'project', data: p })} onDelete={deleteProject} />}
          {pageKey === 'tasks' && <Tasks tasks={tasks} projects={projects} location={location} onNew={() => setModal({ type: 'task' })} onEdit={t => setModal({ type: 'task', data: t })} onDelete={deleteTask} onStatus={updateTaskStatus} />}
          {pageKey === 'calendar' && <Calendar tasks={tasks} projects={projects} />}
          {pageKey === 'ai' && <AICopilot projects={projects} onCreateTask={(form) => upsertTask(form)} onNotice={notify} />}
          {pageKey === 'analytics' && <Analytics tasks={tasks} projects={projects} />}
          {pageKey === 'settings' && <Settings user={user} onNotice={notify} />}
        </div>
      </main>
      {modal?.type === 'project' && <ProjectModal data={modal.data} onClose={() => setModal(null)} onSave={(form) => upsertProject(form, modal.data?.id)} />}
      {modal?.type === 'task' && <TaskModal data={modal.data} projects={projects} onClose={() => setModal(null)} onSave={(form) => upsertTask(form, modal.data?.id)} />}
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
    </div>
  )
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: 'Alex Morgan', email: 'demo@devflow.app', password: 'Demo123!' })
  const submit = (e) => { e.preventDefault(); onLogin({ ...demoUser, name: form.name || demoUser.name, email: form.email || demoUser.email }) }
  return (
    <div className="auth-wrap">
      <div className="auth-art"><div className="art-orb orb-a" /><div className="art-orb orb-b" /><div className="eyebrow"><span className="dot" /> DEVFLOW AI</div><h1>Turn busy work into <em>clear momentum.</em></h1><p>Projects, tasks, focus and AI suggestions — brought together in a premium workspace built for shipping.</p></div>
      <div className="auth-card-wrap"><form className="auth-card" onSubmit={submit}><div className="brand-lockup"><div className="logo-mark"><Zap size={18}/></div><div>DevFlow <b>AI</b></div></div><h2>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h2><p className="muted">{mode === 'login' ? 'Sign in to keep your projects moving.' : 'Start a focused workspace in under a minute.'}</p>{mode === 'register' && <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label>}<label>Email<input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label><label>Password<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/></label><button className="primary-btn wide">{mode === 'login' ? 'Enter workspace' : 'Create account'} <ArrowUpRight size={17}/></button><button type="button" className="ghost-btn wide" onClick={() => onLogin(demoUser)}>Use demo workspace</button><div className="auth-switch">{mode === 'login' ? 'New here?' : 'Already have an account?'} <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></div></form></div>
    </div>
  )
}

function Sidebar({ mobileOpen, close, user, logout }) {
  const groups = [
    [['/', 'Overview', LayoutDashboard], ['/projects', 'Projects', FolderKanban], ['/tasks', 'Tasks', Check], ['/calendar', 'Calendar', CalendarDays]],
    [['/ai', 'AI Copilot', BrainCircuit], ['/analytics', 'Analytics', Activity]],
    [['/settings', 'Settings', Settings2]]
  ]
  return <>{mobileOpen && <div className="scrim" onClick={close}/>}<aside className={`sidebar ${mobileOpen ? 'open' : ''}`}><div className="brand-lockup sidebar-brand"><div className="logo-mark"><Zap size={18}/></div><div>DevFlow <b>AI</b></div><button className="icon-btn mobile-close" onClick={close}><X size={18}/></button></div><div className="workspace-pill"><div className="workspace-avatar">D</div><div><b>Dev Studio</b><span>Personal workspace</span></div><ChevronDown size={15}/></div><div className="side-section">WORKSPACE</div><nav>{groups[0].map(([to,label,Icon]) => <NavItem key={to} to={to} label={label} Icon={Icon} close={close}/>)}</nav><div className="side-section spaced">TOOLS</div><nav>{groups[1].map(([to,label,Icon], i) => <NavItem key={to} to={to} label={label} Icon={Icon} close={close} badge={i === 0 ? 'NEW' : ''}/>)}</nav><div className="sidebar-bottom"><nav>{groups[2].map(([to,label,Icon]) => <NavItem key={to} to={to} label={label} Icon={Icon} close={close}/>)}</nav><div className="support-card"><div className="support-icon"><CircleHelp size={16}/></div><div><b>Need a hand?</b><span>Talk to DevFlow support.</span></div></div><button className="profile-row" onClick={logout}><div className="user-avatar">{initials(user.name)}</div><div><b>{user.name}</b><span>{user.email}</span></div><LogOut size={16}/></button></div></aside></>
}
function NavItem({ to, label, Icon, close, badge }) { return <NavLink to={to} onClick={close} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={18}/><span>{label}</span>{badge && <span className="new-chip">{badge}</span>}</NavLink> }
function Topbar({ user, onMenu, onSearch }) {
  const [q, setQ] = useState('')
  const submit = e => { e.preventDefault(); onSearch(q.trim()) }
  return <header className="topbar"><div className="mobile-brand"><button className="icon-btn" onClick={onMenu}><Menu size={19}/></button><div className="brand-lockup"><div className="logo-mark"><Zap size={16}/></div><div>DevFlow <b>AI</b></div></div></div><form className="search-box" onSubmit={submit}><Search size={17}/><input placeholder="Search projects, tasks…" value={q} onChange={e => setQ(e.target.value)}/><kbd>⌘ K</kbd></form><div className="top-actions"><button className="icon-btn" onClick={() => alert('You are all caught up!')}><Bell size={18}/><span className="notif-dot"/></button><div className="top-avatar">{initials(user.name)}</div></div></header>
}

function Overview({ user, projects, tasks, onNewTask, onNewProject, onAI }) {
  const done = tasks.filter(t => t.status === 'done').length
  const active = tasks.filter(t => t.status === 'in-progress').length
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0
  return <><section className="hero-panel"><div className="hero-copy"><div className="eyebrow light"><span className="dot"/> FOCUS MODE</div><h1>Good morning, {user.name.split(' ')[0]}.<br/><span>Let's ship something great.</span></h1><p>Your workspace is moving with <b>{active} active tasks</b> across <b>{projects.length} projects</b>.</p><div className="hero-actions"><button className="primary-btn" onClick={onNewTask}><Plus size={17}/> New task</button><button className="hero-link" onClick={onAI}><Sparkles size={16}/> Ask AI to plan your next sprint <ArrowUpRight size={15}/></button></div></div><div className="hero-visual"><div className="ring"><div><strong>{pct}%</strong><span>done</span></div></div><div className="hero-note"><Target size={15}/><span>Weekly goal</span><b>{Math.min(done, 12)} / 12 tasks</b></div></div></section><section className="metric-grid"><Metric title="Active projects" value={projects.length} delta="This workspace" icon={FolderKanban}/><Metric title="Tasks completed" value={done} delta={`${pct}% of total`} icon={Check}/><Metric title="In progress" value={active} delta="Keep momentum" icon={Clock3}/><Metric title="Needs attention" value={tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length} delta="Review urgent items" icon={Bell}/></section><div className="section-head"><div><div className="eyebrow"><span className="dot"/> WORKSPACE</div><h2>Projects in motion</h2></div><button className="soft-btn" onClick={onNewProject}>New project <Plus size={15}/></button></div><div className="project-grid">{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div><div className="section-head lower"><div><div className="eyebrow"><span className="dot"/> RECENT ACTIVITY</div><h2>Keep the flow going</h2></div></div><div className="table-card"><div className="task-head"><span>Task</span><span>Project</span><span>Priority</span><span>Status</span><span>Due</span></div>{tasks.slice(0, 8).map(t => <TaskRow key={t.id} task={t} projects={projects}/>)}</div></>
}

function Projects({ projects, tasks, onNew, onEdit, onDelete }) { return <div><PageHeader eyebrow="WORKSPACE" title="Projects" action="New project" onAction={onNew}/><div className="project-grid">{projects.map(p => <ProjectCard key={p.id} project={p} actions onEdit={() => onEdit(p)} onDelete={() => onDelete(p.id)}/>)}</div></div> }
function Tasks({ tasks, projects, location, onNew, onEdit, onDelete, onStatus }) {
  const query = new URLSearchParams(location.search).get('q') || ''
  const [search, setSearch] = useState(query)
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const filtered = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) && (status === 'all' || t.status === status) && (priority === 'all' || t.priority === priority))
  return <div><PageHeader eyebrow="WORKSPACE" title="Tasks" action="New task" onAction={onNew}/><div className="task-toolbar"><div className="search-box inline"><Search size={17}/><input placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)}/></div><div className="toolbar-select"><Filter size={15}/><select value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select></div><div className="toolbar-select"><select value={priority} onChange={e => setPriority(e.target.value)}><option value="all">All priorities</option><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div></div><div className="table-card"><div className="task-head"><span>Task</span><span>Project</span><span>Priority</span><span>Status</span><span>Due</span><span>Actions</span></div>{filtered.map(t => <TaskTableRow key={t.id} task={t} projects={projects} onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} onStatus={onStatus}/>)}</div></div>
}

function Calendar({ tasks, projects }) {
  const [month, setMonth] = useState(new Date(2026, 7, 1))
  const year = month.getFullYear(), m = month.getMonth(), first = new Date(year, m, 1).getDay(), days = new Date(year, m + 1, 0).getDate()
  const cells = Array.from({ length: (first + days + 6) - ((first + days + 6) % 7) }, (_, i) => i - first + 1)
  return <div><PageHeader eyebrow="PLANNING" title={month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}/><div className="calendar-controls"><button className="soft-btn" onClick={() => setMonth(new Date(year, m - 1, 1))}>← Prev</button><button className="soft-btn" onClick={() => setMonth(new Date(2026, 7, 1))}>Today</button><button className="soft-btn" onClick={() => setMonth(new Date(year, m + 1, 1))}>Next →</button></div><div className="calendar-grid"><div className="calendar-week">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <b key={d}>{d}</b>)}</div>{cells.map(day => <div className={`calendar-cell ${day < 1 || day > days ? 'muted-cell' : ''}`} key={day}><strong>{day > 0 && day <= days ? day : ''}</strong>{tasks.filter(t => { const d = new Date(t.dueDate); return day > 0 && day <= days && d.getFullYear() === year && d.getMonth() === m && d.getDate() === day }).map(t => <div className="calendar-task" key={t.id}><span style={{ background: projects.find(p => p.id === t.projectId)?.color || '#6c5ce7' }}/>{t.title}</div>)}</div>)}</div></div>
}

function AICopilot({ projects, onCreateTask, onNotice }) {
  const [brief, setBrief] = useState('Launch a SaaS analytics dashboard')
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '')
  const [suggestions, setSuggestions] = useState([])
  const generate = () => {
    const project = projects.find(p => p.id === selectedProject) || projects[0]
    const name = project?.name || 'New project'
    setSuggestions([
      { title: `Define success criteria for ${name}`, priority: 'high' },
      { title: 'Break the scope into milestones', priority: 'high' },
      { title: 'Design the first usable flow', priority: 'medium' },
      { title: 'Implement and validate the critical path', priority: 'urgent' },
      { title: 'Prepare launch checklist', priority: 'medium' }
    ])
    onNotice('AI plan generated')
  }
  return <div><PageHeader eyebrow="INTELLIGENCE" title="AI Copilot"/><div className="ai-workspace"><div className="ai-card"><div className="ai-title"><Sparkles size={20}/><div><h3>Plan your next sprint</h3><p>Describe the outcome and DevFlow turns it into actionable tasks.</p></div></div><label>Project<select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Brief<textarea rows="5" value={brief} onChange={e => setBrief(e.target.value)} /></label><button className="primary-btn" onClick={generate}><Sparkles size={17}/> Generate plan</button></div>{suggestions.length > 0 && <div className="suggestions-card"><h3>Suggested tasks</h3>{suggestions.map((s, i) => <div className="suggestion" key={i}><div><span className={`priority ${s.priority}`}>{s.priority}</span><b>{s.title}</b></div><button className="icon-btn" onClick={() => { onCreateTask({ title: s.title, projectId: selectedProject, priority: s.priority, status: 'todo', dueDate: '' }); onNotice('Task added') }}><Plus size={16}/></button></div>)}</div>}</div></div>
}

function Analytics({ tasks, projects }) {
  const done = tasks.filter(t => t.status === 'done').length, active = tasks.filter(t => t.status === 'in-progress').length, todo = tasks.filter(t => t.status === 'todo').length
  return <div><PageHeader eyebrow="INSIGHTS" title="Analytics"/><div className="metric-grid"><Metric title="Total tasks" value={tasks.length} delta="Across workspace" icon={Check}/><Metric title="Completed" value={done} delta="Shipped" icon={Target}/><Metric title="In progress" value={active} delta="Active now" icon={Clock3}/><Metric title="Projects" value={projects.length} delta="In motion" icon={FolderKanban}/></div><div className="analytics-grid"><div className="table-card analytics-card"><h3>Task distribution</h3><Bar label="Done" value={done} total={tasks.length}/><Bar label="In progress" value={active} total={tasks.length}/><Bar label="To do" value={todo} total={tasks.length}/></div><div className="table-card analytics-card"><h3>Priority mix</h3>{['urgent','high','medium','low'].map(p => <Bar key={p} label={p} value={tasks.filter(t => t.priority === p).length} total={tasks.length}/>)}</div></div></div>
}
function Bar({ label, value, total }) { return <div className="bar-row"><div><span>{label}</span><b>{value}</b></div><div className="bar-track"><i style={{ width: `${total ? Math.max(6, value / total * 100) : 6}%` }}/></div></div> }

function Settings({ user, onNotice }) {
  const [dark, setDark] = useState(localStorage.getItem('devflow_dark') !== 'false')
  const [savedName, setSavedName] = useState(user.name)
  const save = () => { localStorage.setItem('devflow_dark', String(dark)); onNotice('Settings saved') }
  return <div><PageHeader eyebrow="WORKSPACE" title="Settings"/><div className="settings-grid"><div className="table-card settings-card"><h3>Profile</h3><label>Display name<input value={savedName} onChange={e => setSavedName(e.target.value)}/></label><label>Email<input value={user.email} disabled/></label><button className="primary-btn" onClick={save}><Save size={16}/> Save changes</button></div><div className="table-card settings-card"><h3>Preferences</h3><label className="toggle-row"><span>Dark theme</span><input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)}/></label><label className="toggle-row"><span>Email notifications</span><input type="checkbox" defaultChecked/></label><label className="toggle-row"><span>Weekly focus digest</span><input type="checkbox" defaultChecked/></label><button className="soft-btn" onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload() }}>Reset demo workspace</button></div></div></div>
}

function PageHeader({ eyebrow, title, action, onAction }) { return <div className="section-head page-head"><div><div className="eyebrow"><span className="dot"/> {eyebrow}</div><h2>{title}</h2></div>{action && <button className="primary-btn" onClick={onAction}><Plus size={16}/>{action}</button>}</div> }
function Metric({ title, value, delta, icon: Icon }) { return <div className="metric-card"><div className="metric-icon"><Icon size={17}/></div><div><span>{title}</span><strong>{value}</strong><small>{delta}</small></div><ArrowUpRight className="metric-arrow" size={15}/></div> }
function ProjectCard({ project, actions, onEdit, onDelete }) { const completed = project.completed || 0; const taskCount = project.taskCount || 0; const progress = project.progress ?? (taskCount ? Math.round(completed / taskCount * 100) : 0); return <div className="project-card"><div className="project-top"><div><span className="project-tag">{project.status}</span><h3>{project.name}</h3></div>{actions ? <div className="row-actions"><button className="icon-btn" onClick={onEdit}><Pencil size={15}/></button><button className="icon-btn danger" onClick={onDelete}><Trash2 size={15}/></button></div> : <button className="more-btn" onClick={() => alert(project.description)}>•••</button>}</div><p>{project.description}</p><div className="progress-meta"><span>Progress</span><b>{progress}%</b></div><div className="progress-track"><span style={{ width: `${progress}%` }}/></div><div className="project-bottom"><span>{completed}/{taskCount} tasks</span><span className="push">{fmtDate(project.dueDate)}</span></div></div> }
function TaskRow({ task, projects }) { const project = projects.find(p => p.id === task.projectId); return <div className="task-row"><div className="task-name"><span className={`status-dot ${task.status}`}/><div><b>{task.title}</b><small>{task.description || 'Keep the next step small and clear.'}</small></div></div><div className="project-cell"><span className="mini-project" style={{ background: project?.color || '#6c5ce7' }}/>{project?.name || 'Project'}</div><div><span className={`priority ${task.priority}`}>{task.priority}</span></div><div><span className={`status-pill ${task.status}`}>{task.status.replace('-', ' ')}</span></div><div className="due-cell">{fmtDate(task.dueDate)}</div></div> }
function TaskTableRow({ task, projects, onEdit, onDelete, onStatus }) { return <div className="task-row"><div className="task-name"><span className={`status-dot ${task.status}`}/><div><b>{task.title}</b><small>{fmtDate(task.dueDate)}</small></div></div><div className="project-cell"><span className="mini-project" style={{ background: projects.find(p => p.id === task.projectId)?.color || '#6c5ce7' }}/>{projects.find(p => p.id === task.projectId)?.name || 'Project'}</div><div><span className={`priority ${task.priority}`}>{task.priority}</span></div><div><select className="status-select" value={task.status} onChange={e => onStatus(task.id, e.target.value)}><option value="todo">todo</option><option value="in-progress">in-progress</option><option value="done">done</option></select></div><div className="due-cell">{fmtDate(task.dueDate)}</div><div className="row-actions"><button className="icon-btn" onClick={onEdit}><Pencil size={15}/></button><button className="icon-btn danger" onClick={onDelete}><Trash2 size={15}/></button></div></div> }

function ProjectModal({ data, onClose, onSave }) { const [form, setForm] = useState({ name: data?.name || '', description: data?.description || '', color: data?.color || '#6c5ce7', dueDate: data?.dueDate || '' }); return <Overlay onClose={onClose}><form className="modal" onSubmit={e => { e.preventDefault(); onSave(form) }}><ModalHead title={data ? 'Edit project' : 'New project'} onClose={onClose}/><label>Project name<input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label>Description<textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label><label>Due date<input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}/></label><div className="modal-actions"><button type="button" className="soft-btn" onClick={onClose}>Cancel</button><button className="primary-btn"><Save size={16}/> Save</button></div></form></Overlay> }
function TaskModal({ data, projects, onClose, onSave }) { const [form, setForm] = useState({ title: data?.title || '', projectId: data?.projectId || projects[0]?.id || '', priority: data?.priority || 'medium', status: data?.status || 'todo', dueDate: data?.dueDate || '' }); return <Overlay onClose={onClose}><form className="modal" onSubmit={e => { e.preventDefault(); onSave(form) }}><ModalHead title={data ? 'Edit task' : 'New task'} onClose={onClose}/><label>Task title<input autoFocus value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/></label><label>Project<select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><div className="form-grid"><label>Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></label><label>Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>todo</option><option>in-progress</option><option>done</option></select></label></div><label>Due date<input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}/></label><div className="modal-actions"><button type="button" className="soft-btn" onClick={onClose}>Cancel</button><button className="primary-btn"><Save size={16}/> Save</button></div></form></Overlay> }
function Overlay({ children, onClose }) { return <div className="modal-backdrop" onMouseDown={onClose}><div onMouseDown={e => e.stopPropagation()}>{children}</div></div> }
function ModalHead({ title, onClose }) { return <div className="modal-head"><div><div className="eyebrow"><span className="dot"/> DEVFLOW</div><h3>{title}</h3></div><button type="button" className="icon-btn" onClick={onClose}><X size={18}/></button></div> }
