import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Activity, ArrowUpRight, Bell, BrainCircuit, CalendarDays, Check, ChevronDown, CircleHelp,
  Clock3, FolderKanban, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2,
  Sparkles, Target, X, Zap
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const api = axios.create({ baseURL: API })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('devflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const fmtDate = d => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'
const initials = name => (name || 'DM').split(' ').map(v => v[0]).slice(0,2).join('').toUpperCase()

function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('devflow_user') || 'null'))
  const [mobileNav, setMobileNav] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!user && !location.pathname.startsWith('/auth')) navigate('/auth')
    if (user && location.pathname === '/auth') navigate('/')
  }, [user])

  if (!user) return <AuthScreen mode={authMode} setMode={setAuthMode} onAuth={(u, token) => { localStorage.setItem('devflow_token', token); localStorage.setItem('devflow_user', JSON.stringify(u)); setUser(u); navigate('/') }} loading={authLoading} setLoading={setAuthLoading} error={authError} setError={setAuthError} />

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileNav} close={() => setMobileNav(false)} user={user} logout={() => { localStorage.clear(); setUser(null); navigate('/auth') }} />
      <main className="main-canvas">
        <Topbar user={user} onMenu={() => setMobileNav(true)} />
        <Dashboard user={user} />
      </main>
    </div>
  )
}

function AuthScreen({ mode, setMode, onAuth, loading, setLoading, error, setError }) {
  const [form, setForm] = useState({ name: 'Alex Morgan', email: 'demo@devflow.app', password: 'Demo123!' })
  const login = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form
      const { data } = await api.post(url, payload)
      onAuth(data.user, data.token)
    } catch (err) { setError(err.response?.data?.message || 'Unable to continue. Check the API server.') }
    finally { setLoading(false) }
  }
  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <div className="art-orb orb-a" /><div className="art-orb orb-b" />
        <div className="eyebrow"><span className="dot" /> DEVFLOW AI</div>
        <h1>Turn busy work into <em>clear momentum.</em></h1>
        <p>Projects, tasks, focus and AI suggestions — brought together in a premium workspace built for shipping.</p>
        <div className="mini-proof"><div className="avatar-stack"><span>AM</span><span>JS</span><span>RK</span><span>+8</span></div><span>Built for modern product teams</span></div>
      </div>
      <div className="auth-card-wrap">
        <form className="auth-card" onSubmit={login}>
          <div className="brand-lockup"><div className="logo-mark"><Zap size={18}/></div><div>DevFlow <b>AI</b></div></div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h2>
          <p className="muted">{mode === 'login' ? 'Sign in to keep your projects moving.' : 'Start a focused workspace in under a minute.'}</p>
          {mode === 'register' && <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>}
          <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
          <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></label>
          {error && <div className="error-banner">{error}</div>}
          <button className="primary-btn wide" disabled={loading}>{loading ? 'Loading…' : mode === 'login' ? 'Enter workspace' : 'Create account'} <ArrowUpRight size={17}/></button>
          <button type="button" className="ghost-btn wide" onClick={() => { setForm({ name:'Alex Morgan', email:'demo@devflow.app', password:'Demo123!' }); setMode('login'); setError('') }}>Use demo workspace</button>
          <div className="auth-switch">{mode === 'login' ? 'New here?' : 'Already have an account?'} <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></div>
        </form>
      </div>
    </div>
  )
}

function Sidebar({ mobileOpen, close, user, logout }) {
  const items = [
    ['/','Overview',LayoutDashboard],
    ['/projects','Projects',FolderKanban],
    ['/tasks','Tasks',Check],
    ['/calendar','Calendar',CalendarDays],
  ]
  return <>
    {mobileOpen && <div className="scrim" onClick={close}/>} 
    <aside className={`sidebar ${mobileOpen?'open':''}`}>
      <div className="brand-lockup sidebar-brand"><div className="logo-mark"><Zap size={18}/></div><div>DevFlow <b>AI</b></div><button className="icon-btn mobile-close" onClick={close}><X size={18}/></button></div>
      <div className="workspace-pill"><div className="workspace-avatar">D</div><div><b>Dev Studio</b><span>Personal workspace</span></div><ChevronDown size={15}/></div>
      <div className="side-section">WORKSPACE</div>
      <nav>{items.map(([to,label,Icon])=><NavLink key={to} to={to} className={({isActive})=>`nav-item ${isActive?'active':''}`} onClick={close}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="side-section spaced">TOOLS</div>
      <nav>
        <NavLink to="/ai" className="nav-item"><BrainCircuit size={18}/><span>AI Copilot</span><span className="new-chip">NEW</span></NavLink>
        <NavLink to="/analytics" className="nav-item"><Activity size={18}/><span>Analytics</span></NavLink>
      </nav>
      <div className="sidebar-bottom">
        <NavLink to="/settings" className="nav-item"><Settings2 size={18}/><span>Settings</span></NavLink>
        <div className="support-card"><div className="support-icon"><CircleHelp size={16}/></div><div><b>Need a hand?</b><span>Talk to DevFlow support.</span></div></div>
        <button className="profile-row" onClick={logout}><div className="user-avatar">{initials(user.name)}</div><div><b>{user.name}</b><span>{user.email}</span></div><LogOut size={16}/></button>
      </div>
    </aside>
  </>
}

function Topbar({ user, onMenu }) {
  const [q,setQ] = useState('')
  return <header className="topbar"><div className="mobile-brand"><button className="icon-btn" onClick={onMenu}><Menu size={19}/></button><div className="brand-lockup"><div className="logo-mark"><Zap size={16}/></div><div>DevFlow <b>AI</b></div></div></div><div className="search-box"><Search size={17}/><input placeholder="Search projects, tasks…" value={q} onChange={e=>setQ(e.target.value)} /><kbd>⌘ K</kbd></div><div className="top-actions"><button className="icon-btn"><Bell size={18}/><span className="notif-dot"/></button><button className="top-avatar">{initials(user.name)}</button></div></header>
}

function Dashboard({ user }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [refresh, setRefresh] = useState(0)
  useEffect(()=>{ api.get('/dashboard').then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message || 'Could not load dashboard.')) },[refresh])
  if (error) return <div className="content"><div className="error-state"><CircleHelp size={22}/><h3>We hit a snag</h3><p>{error}</p><button className="primary-btn" onClick={()=>{setError('');setRefresh(v=>v+1)}}>Try again</button></div></div>
  if (!data) return <div className="content"><div className="skeleton-hero"><div className="skeleton w-25"/><div className="skeleton w-60 lg"/><div className="skeleton w-40"/></div><div className="metric-grid"><div className="skeleton card"/><div className="skeleton card"/><div className="skeleton card"/><div className="skeleton card"/></div></div>
  const completedPct = data.stats.tasks ? Math.round(data.stats.completed/data.stats.tasks*100) : 0
  return <div className="content">
    <section className="hero-panel"><div className="hero-copy"><div className="eyebrow light"><span className="dot"/> TUESDAY, AUG 23 · FOCUS MODE</div><h1>Good morning, {user.name.split(' ')[0]}.<br/><span>Let's ship something great.</span></h1><p>Your workspace is moving. You have <b>{data.stats.active} active tasks</b> across <b>{data.stats.projects} projects</b>.</p><div className="hero-actions"><button className="primary-btn" onClick={()=>setModal('task')}><Plus size={17}/> New task</button><button className="hero-link" onClick={()=>setModal('ai')}><Sparkles size={16}/> Ask AI to plan your next sprint <ArrowUpRight size={15}/></button></div></div><div className="hero-visual"><div className="ring"><div><strong>{completedPct}%</strong><span>done</span></div></div><div className="hero-note"><Target size={15}/><span>Weekly goal</span><b>{Math.min(data.stats.completed, 12)} / 12 tasks</b></div></div></section>

    <section className="metric-grid">
      <Metric title="Active projects" value={data.stats.projects} delta="This workspace" icon={FolderKanban} />
      <Metric title="Tasks completed" value={data.stats.completed} delta={`${completedPct}% of total`} icon={Check} />
      <Metric title="In progress" value={data.stats.active} delta="Keep momentum" icon={Clock3} />
      <Metric title="Needs attention" value={data.stats.overdue} delta={data.stats.overdue?'Overdue items':'All clear'} icon={Bell} accent={!!data.stats.overdue} />
    </section>

    <section className="section-head"><div><div className="eyebrow"><span className="dot"/> WORKSPACE</div><h2>Projects in motion</h2></div><button className="soft-btn" onClick={()=>setModal('project')}>View all <ArrowUpRight size={15}/></button></section>
    <div className="project-grid">{data.projects.slice(0,3).map(p=><ProjectCard key={p._id} project={p}/>)}<button className="new-project-card" onClick={()=>setModal('project')}><span className="plus-circle"><Plus size={20}/></span><b>Start a new project</b><span>Define the goal. We'll help build the plan.</span></button></div>

    <section className="section-head lower"><div><div className="eyebrow"><span className="dot"/> RECENT ACTIVITY</div><h2>Keep the flow going</h2></div><button className="soft-btn">Open task board <ArrowUpRight size={15}/></button></section>
    <div className="table-card"><div className="task-head"><span>Task</span><span>Project</span><span>Priority</span><span>Status</span><span>Due</span></div>{data.tasks.length?data.tasks.map(t=><TaskRow key={t._id} task={t} />):<div className="empty-inline"><Search size={18}/><b>No tasks yet</b><span>Create your first task and watch your dashboard come alive.</span></div>}</div>

    {modal && <Modal type={modal} data={data} onClose={()=>setModal(null)} onDone={()=>{setModal(null);setRefresh(v=>v+1)}} />}
  </div>
}

function Metric({title,value,delta,icon:Icon,accent}) { return <div className="metric-card"><div className={`metric-icon ${accent?'alert':''}`}><Icon size={17}/></div><div><span>{title}</span><strong>{value}</strong><small>{delta}</small></div><ArrowUpRight className="metric-arrow" size={15}/></div> }

function ProjectCard({project}) { return <div className="project-card" style={{'--project': project.color || '#5b7cff'}}><div className="project-top"><div><span className="project-tag">{project.status || 'active'}</span><h3>{project.name}</h3></div><button className="more-btn">•••</button></div><p>{project.description || 'A focused project for the team.'}</p><div className="progress-meta"><span>Progress</span><b>{project.progress || 0}%</b></div><div className="progress-track"><span style={{width:`${project.progress || 0}%`}}/></div><div className="project-bottom"><div className="avatar-stack small"><span>{initials('Alex Morgan')}</span><span>+{Math.max((project.taskCount||1)-1,0)}</span></div><span>{project.completed || 0}/{project.taskCount || 0} tasks</span><span className="push">{fmtDate(project.dueDate)}</span></div></div> }

function TaskRow({task}) { return <div className="task-row"><div className="task-name"><span className={`status-dot ${task.status}`}/><div><b>{task.title}</b><small>{task.description || 'Keep the next step small and clear.'}</small></div></div><div className="project-cell"><span className="mini-project" style={{background:task.project?.color || '#6c5ce7'}}/>{task.project?.name || 'Project'}</div><div><span className={`priority ${task.priority}`}>{task.priority}</span></div><div><span className={`status-pill ${task.status}`}>{task.status.replace('-',' ')}</span></div><div className="due-cell">{fmtDate(task.dueDate)}</div></div> }

function Modal({type,data,onClose,onDone}) {
  const [form,setForm] = useState({name:'',description:'',project:data.projects[0]?._id || '',title:'',priority:'medium',status:'todo',brief:''})
  const [loading,setLoading]=useState(false), [error,setError]=useState(''), [suggestions,setSuggestions]=useState([])
  const save = async e => { e.preventDefault(); setLoading(true); setError('')
    try {
      if(type==='project') await api.post('/projects',{name:form.name,description:form.description,color:'#6c5ce7'})
      if(type==='task') await api.post('/tasks',{title:form.title,project:form.project,priority:form.priority,status:form.status})
      onDone()
    } catch (err) { setError(err.response?.data?.message || 'Could not save.') } finally { setLoading(false) }
  }
  const generate = async () => { setLoading(true); setError(''); try { const r=await api.post('/ai/generate-tasks',{projectName:data.projects[0]?.name || 'New project',brief:form.brief}); setSuggestions(r.data.tasks || []) } catch(err) { setError(err.response?.data?.message || 'AI request failed.') } finally{ setLoading(false) } }
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><span className="dot"/> {type==='ai'?'AI COPILOT':type.toUpperCase()}</span><h3>{type==='project'?'Create a project':type==='task'?'Create a task':'Plan with AI'}</h3></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
    {type==='ai' ? <div className="ai-modal"><div className="ai-prompt"><Sparkles size={18}/><input placeholder="e.g. Launch a SaaS analytics dashboard" value={form.brief} onChange={e=>setForm({...form,brief:e.target.value})}/><button className="primary-btn" onClick={generate}>{loading?'Thinking…':'Generate plan'}</button></div>{error&&<div className="error-banner">{error}</div>}{suggestions.length>0&&<div className="suggestions">{suggestions.map((s,i)=><div className="suggestion" key={i}><div><span className={`priority ${s.priority}`}>{s.priority}</span><b>{s.title}</b><small>{s.description}</small></div><Check size={17}/></div>)}</div>}<div className="ai-foot"><span><BrainCircuit size={15}/> AI output is a starting point — review before shipping.</span><button className="soft-btn" onClick={onClose}>Close</button></div></div> : <form onSubmit={save} className="modal-form">{type==='project' ? <><label>Project name<input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Atlas Redesign"/></label><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What are you trying to ship?"/></label></> : <><label>Task title<input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Make the next step actionable"/></label><label>Project<select value={form.project} onChange={e=>setForm({...form,project:e.target.value})}>{data.projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></label><div className="form-grid"><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>todo</option><option>in-progress</option><option>done</option></select></label></div></>}{error&&<div className="error-banner">{error}</div>}<div className="modal-actions"><button type="button" className="soft-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={loading}>{loading?'Saving…':'Save'}</button></div></form>}
  </div></div>
}

export default App
