import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Activity, ArrowUpRight, Bell, BrainCircuit, CalendarDays, Check, ChevronDown,
  CircleHelp, Clock3, FolderKanban, LayoutDashboard, LogOut, Menu, Plus,
  Search, Settings2, Sparkles, Target, X, Zap
} from 'lucide-react'
import './styles/workspace.css'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('devflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const initials = name => (name || 'DM').split(' ').map(v => v[0]).slice(0, 2).join('').toUpperCase()
const dateText = value => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'

export default function WorkspaceApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('devflow_user') || 'null'))
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!user && location.pathname !== '/auth') navigate('/auth', { replace: true })
    if (user && location.pathname === '/auth') navigate('/', { replace: true })
  }, [user, location.pathname, navigate])

  if (!user) return <Auth onAuth={(nextUser, token) => {
    localStorage.setItem('devflow_user', JSON.stringify(nextUser))
    localStorage.setItem('devflow_token', token)
    setUser(nextUser)
    navigate('/')
  }} />

  const logout = () => {
    localStorage.removeItem('devflow_user')
    localStorage.removeItem('devflow_token')
    setUser(null)
    navigate('/auth')
  }

  const Page = pageForPath(location.pathname)

  return (
    <div className="wf-shell">
      <Sidebar open={mobileOpen} close={() => setMobileOpen(false)} user={user} logout={logout} />
      <main className="wf-main">
        <header className="wf-topbar">
          <div className="wf-mobile-brand">
            <button className="wf-icon-btn" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
            <Brand />
          </div>
          <div className="wf-search"><Search size={17} /><input placeholder="Search projects, tasks…" /><kbd>⌘ K</kbd></div>
          <div className="wf-top-actions"><button className="wf-icon-btn"><Bell size={18} /><span className="wf-notif" /></button><div className="wf-top-avatar">{initials(user.name)}</div></div>
        </header>
        <section className="wf-content"><Page user={user} /></section>
      </main>
    </div>
  )
}

function pageForPath(path) {
  if (path.startsWith('/projects')) return ProjectsPage
  if (path.startsWith('/tasks')) return TasksPage
  if (path.startsWith('/calendar')) return CalendarPage
  if (path.startsWith('/ai')) return AiPage
  if (path.startsWith('/analytics')) return AnalyticsPage
  if (path.startsWith('/settings')) return SettingsPage
  return OverviewPage
}

function Brand() { return <div className="wf-brand"><div className="wf-logo"><Zap size={18} /></div><div>DevFlow <b>AI</b></div></div> }

function Sidebar({ open, close, user, logout }) {
  const items = [
    ['/', 'Overview', LayoutDashboard],
    ['/projects', 'Projects', FolderKanban],
    ['/tasks', 'Tasks', Check],
    ['/calendar', 'Calendar', CalendarDays],
  ]
  const tools = [
    ['/ai', 'AI Copilot', BrainCircuit],
    ['/analytics', 'Analytics', Activity],
  ]
  return <>
    {open && <div className="wf-scrim" onClick={close} />}
    <aside className={`wf-sidebar ${open ? 'open' : ''}`}>
      <div className="wf-sidebar-head"><Brand /><button className="wf-icon-btn wf-close" onClick={close}><X size={18} /></button></div>
      <div className="wf-workspace"><div className="wf-workspace-avatar">D</div><div><b>Dev Studio</b><span>Personal workspace</span></div><ChevronDown size={15} /></div>
      <div className="wf-section-label">WORKSPACE</div>
      <nav>{items.map(([to, label, Icon]) => <NavLink key={to} to={to} onClick={close} className={({ isActive }) => `wf-nav ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="wf-section-label">TOOLS</div>
      <nav>{tools.map(([to, label, Icon], index) => <NavLink key={to} to={to} onClick={close} className={({ isActive }) => `wf-nav ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span>{index === 0 && <em>NEW</em>}</NavLink>)}</nav>
      <div className="wf-sidebar-spacer" />
      <nav><NavLink to="/settings" onClick={close} className={({ isActive }) => `wf-nav ${isActive ? 'active' : ''}`}><Settings2 size={18} /><span>Settings</span></NavLink></nav>
      <div className="wf-support"><CircleHelp size={17} /><div><b>Need a hand?</b><span>Talk to DevFlow support.</span></div></div>
      <button className="wf-profile" onClick={logout}><div className="wf-profile-avatar">{initials(user.name)}</div><div><b>{user.name}</b><span>{user.email}</span></div><LogOut size={16} /></button>
    </aside>
  </>
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: 'Alex Morgan', email: 'demo@devflow.app', password: 'Demo123!' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const body = mode === 'login' ? { email: form.email, password: form.password } : form
      const { data } = await api.post(endpoint, body)
      onAuth(data.user, data.token)
    } catch (err) { setError(err.response?.data?.message || 'Unable to continue. Check the API server.') }
    finally { setLoading(false) }
  }
  return <div className="wf-auth"><div className="wf-auth-art"><div className="wf-orb a" /><div className="wf-orb b" /><div className="wf-eyebrow">● DEVFLOW AI</div><h1>Turn busy work into <span>clear momentum.</span></h1><p>Projects, tasks, focus and AI suggestions — brought together in a premium workspace built for shipping.</p><div className="wf-proof"><span>AM</span><span>JS</span><span>RK</span><span>+8</span><b>Built for modern product teams</b></div></div><form className="wf-auth-card" onSubmit={submit}><Brand /><h2>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h2><p>{mode === 'login' ? 'Sign in to keep your projects moving.' : 'Start a focused workspace in under a minute.'}</p>{mode === 'register' && <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>}<label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Password<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>{error && <div className="wf-error">{error}</div>}<button className="wf-primary" disabled={loading}>{loading ? 'Loading…' : mode === 'login' ? 'Enter workspace' : 'Create account'} <ArrowUpRight size={17} /></button><button type="button" className="wf-secondary" onClick={() => { setMode('login'); setForm({ name: 'Alex Morgan', email: 'demo@devflow.app', password: 'Demo123!' }); setError('') }}>Use demo workspace</button><div className="wf-switch">{mode === 'login' ? 'New here?' : 'Already have an account?'} <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></div></form></div>
}

function OverviewPage({ user }) {
  const [data, setData] = useState(null); const [error, setError] = useState('')
  const load = () => api.get('/dashboard').then(r => setData(r.data)).catch(e => setError(e.response?.data?.message || 'Could not load dashboard.'))
  useEffect(load, [])
  if (error) return <ErrorState message={error} retry={load} />
  if (!data) return <LoadingState />
  const pct = data.stats.tasks ? Math.round(data.stats.completed / data.stats.tasks * 100) : 0
  return <div><Hero user={user} pct={pct} /><Metrics stats={data.stats} /><section className="wf-section-head"><div><small>WORKSPACE</small><h2>Projects in motion</h2></div><NavLink to="/projects" className="wf-soft">View all <ArrowUpRight size={15} /></NavLink></section><div className="wf-grid">{data.projects.slice(0, 3).map(p => <ProjectCard key={p._id} p={p} />)}<NavLink to="/projects" className="wf-new-card"><Plus size={22} /><b>Start a new project</b><span>Define the goal and build the plan.</span></NavLink></div><section className="wf-section-head"><div><small>RECENT ACTIVITY</small><h2>Keep the flow going</h2></div><NavLink to="/tasks" className="wf-soft">Open task board <ArrowUpRight size={15} /></NavLink></section><TaskTable tasks={data.tasks} /></div>
}

function Hero({ user, pct }) { return <section className="wf-hero"><div><small>TUESDAY, AUG 23 · FOCUS MODE</small><h1>Good morning, {user.name.split(' ')[0]}.<br /><span>Let's ship something great.</span></h1><p>Your workspace is moving. Stay focused on the next best action.</p><div className="wf-actions"><NavLink className="wf-primary" to="/tasks"><Plus size={17} /> New task</NavLink><NavLink className="wf-hero-link" to="/ai"><Sparkles size={16} /> Ask AI to plan your next sprint <ArrowUpRight size={15} /></NavLink></div></div><div className="wf-ring"><strong>{pct}%</strong><span>done</span></div></section> }
function Metrics({ stats }) { return <div className="wf-metrics">{[['Active projects', stats.projects, 'This workspace', FolderKanban], ['Tasks completed', stats.completed, 'Completed', Check], ['In progress', stats.active, 'Keep momentum', Clock3], ['Needs attention', stats.overdue, stats.overdue ? 'Overdue items' : 'All clear', Bell]].map(([title, value, sub, Icon]) => <div className="wf-metric" key={title}><div className="wf-metric-icon"><Icon size={17} /></div><span>{title}</span><strong>{value}</strong><small>{sub}</small></div>)}</div> }
function ProjectCard({ p }) { return <div className="wf-card"><span className="wf-tag">{p.status}</span><h3>{p.name}</h3><p>{p.description}</p><div className="wf-progress-meta"><span>Progress</span><b>{p.progress || 0}%</b></div><div className="wf-progress"><span style={{ width: `${p.progress || 0}%` }} /></div><div className="wf-card-foot"><span>{p.completed || 0}/{p.taskCount || 0} tasks</span><span>{dateText(p.dueDate)}</span></div></div> }
function TaskTable({ tasks }) { return <div className="wf-table">{tasks?.length ? tasks.map(t => <div className="wf-task-row" key={t._id}><div><b>{t.title}</b><small>{t.project?.name || 'Project'}</small></div><span className={`wf-pill ${t.priority}`}>{t.priority}</span><span className={`wf-status ${t.status}`}>{t.status}</span><span>{dateText(t.dueDate)}</span></div>) : <div className="wf-empty">No tasks yet.</div>}</div> }

function ProjectsPage() { const [projects, setProjects] = useState([]); const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [description, setDescription] = useState(''); const load = () => api.get('/projects').then(r => setProjects(r.data)); useEffect(load, []); const create = async e => { e.preventDefault(); await api.post('/projects', { name, description, color: '#6c5ce7' }); setName(''); setDescription(''); setOpen(false); load() }; return <div><PageHeader title="Projects" subtitle="Plan, track and ship every initiative." action={<button className="wf-primary" onClick={() => setOpen(true)}><Plus size={17} /> New project</button>} />{projects.length ? <div className="wf-grid">{projects.map(p => <ProjectCard key={p._id} p={p} />)}</div> : <EmptyState text="No projects yet. Create your first project." onClick={() => setOpen(true)} />}{open && <Modal title="Create project" onClose={() => setOpen(false)}><form onSubmit={create} className="wf-form"><label>Project name<input autoFocus value={name} onChange={e => setName(e.target.value)} /></label><label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} /></label><button className="wf-primary">Create project</button></form></Modal>}</div> }
function TasksPage() { const [tasks, setTasks] = useState([]); useEffect(() => { api.get('/tasks').then(r => setTasks(r.data)) }, []); return <div><PageHeader title="Tasks" subtitle="A clear list of what needs to move next." /><TaskTable tasks={tasks} /></div> }
function CalendarPage() { const [tasks, setTasks] = useState([]); useEffect(() => { api.get('/tasks').then(r => setTasks(r.data)) }, []); const dated = tasks.filter(t => t.dueDate); return <div><PageHeader title="Calendar" subtitle="Upcoming work and deadlines in one view." /><div className="wf-calendar">{dated.length ? dated.sort((a,b) => new Date(a.dueDate)-new Date(b.dueDate)).map(t => <div key={t._id} className="wf-calendar-item"><div className="wf-datebox"><strong>{new Date(t.dueDate).getDate()}</strong><span>{new Date(t.dueDate).toLocaleDateString(undefined,{month:'short'})}</span></div><div><b>{t.title}</b><span>{t.project?.name || 'Project'} · {t.status}</span></div></div>) : <EmptyState text="No tasks have due dates yet." />}</div></div> }
function AiPage() { const [brief,setBrief]=useState('Launch a SaaS analytics dashboard'); const [tasks,setTasks]=useState([]); const [loading,setLoading]=useState(false); const generate=async()=>{setLoading(true);try{const r=await api.post('/ai/generate-tasks',{projectName:'Dev Studio',brief});setTasks(r.data.tasks||[])}finally{setLoading(false)}};return <div><PageHeader title="AI Copilot" subtitle="Turn a brief into a practical delivery plan." /><div className="wf-ai"><div className="wf-ai-input"><Sparkles size={18}/><input value={brief} onChange={e=>setBrief(e.target.value)} /><button className="wf-primary" onClick={generate}>{loading?'Thinking…':'Generate plan'}</button></div>{tasks.map((t,i)=><div className="wf-ai-row" key={i}><span className={`wf-pill ${t.priority}`}>{t.priority}</span><div><b>{t.title}</b><small>{t.description}</small></div><Check size={17}/></div>)}</div></div> }
function AnalyticsPage() { const [d,setD]=useState(null); useEffect(()=>{api.get('/dashboard').then(r=>setD(r.data))},[]); return <div><PageHeader title="Analytics" subtitle="A quick read on your current workspace." />{d && <div className="wf-analytics">{Object.entries(d.stats).map(([k,v])=><div key={k} className="wf-analytics-card"><small>{k.replace('_',' ')}</small><strong>{v}</strong><div className="wf-bar"><span style={{width:`${Math.min(Number(v)*10,100)}%`}}/></div></div>)}</div>}</div> }
function SettingsPage({ user }) { return <div><PageHeader title="Settings" subtitle="Workspace preferences and account details." /><div className="wf-settings"><div><small>ACCOUNT</small><h3>{user.name}</h3><p>{user.email}</p></div><div><small>WORKSPACE</small><h3>Dev Studio</h3><p>Personal workspace</p></div><div><small>DEMO MODE</small><p>All core features are enabled for the capstone showcase.</p></div></div></div> }
function PageHeader({ title, subtitle, action }) { return <div className="wf-page-head"><div><small>DEVFLOW AI</small><h1>{title}</h1><p>{subtitle}</p></div>{action}</div> }
function Modal({ title, onClose, children }) { return <div className="wf-modal-bg" onMouseDown={onClose}><div className="wf-modal" onMouseDown={e=>e.stopPropagation()}><div className="wf-modal-head"><h3>{title}</h3><button className="wf-icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</div></div> }
function EmptyState({ text, onClick }) { return <div className="wf-empty-card"><FolderKanban size={24}/><b>{text}</b>{onClick && <button className="wf-primary" onClick={onClick}>Create</button>}</div> }
function ErrorState({ message, retry }) { return <div className="wf-empty-card"><CircleHelp size={24}/><b>{message}</b><button className="wf-primary" onClick={retry}>Try again</button></div> }
function LoadingState() { return <div className="wf-loading"><div /><div /><div /></div> }
