import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Activity, ArrowUpRight, Bell, BrainCircuit, CalendarDays, Check, ChevronDown,
  CircleHelp, Clock3, FolderKanban, LayoutDashboard, LogOut, Menu, Plus, Search,
  Settings2, Sparkles, Target, X, Zap
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({ baseURL: API })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('devflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const demoUser = { _id: 'demo-user-devflow-2026', name: 'Alex Morgan', email: 'demo@devflow.app', avatar: 'AM' }
const demoProjects = [
  { _id:'p1', name:'Nebula Mobile', description:'Launch the next-generation client experience.', color:'#6c5ce7', status:'active', progress:66, completed:2, taskCount:3, dueDate:'2026-09-05' },
  { _id:'p2', name:'Pulse Analytics', description:'Make team performance visible at a glance.', color:'#16b6c9', status:'active', progress:50, completed:1, taskCount:2, dueDate:'2026-09-12' }
]
const demoTasks = [
  { _id:'t1', title:'Finalize onboarding flow', project:demoProjects[0], priority:'high', status:'done', dueDate:null },
  { _id:'t2', title:'Wire API error states', project:demoProjects[0], priority:'urgent', status:'in-progress', dueDate:null },
  { _id:'t3', title:'Polish empty states', project:demoProjects[0], priority:'medium', status:'todo', dueDate:null },
  { _id:'t4', title:'Define KPI cards', project:demoProjects[1], priority:'medium', status:'done', dueDate:null },
  { _id:'t5', title:'Build filters', project:demoProjects[1], priority:'high', status:'in-progress', dueDate:null }
]

const fmtDate = value => value ? new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric'}) : '—'
const initials = name => (name || 'AM').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()

function App(){
  const location = useLocation()
  const navigate = useNavigate()
  const [user,setUser] = useState(()=>JSON.parse(localStorage.getItem('devflow_user')||'null'))
  const [mobileOpen,setMobileOpen] = useState(false)
  const [projects,setProjects] = useState(demoProjects)
  const [tasks,setTasks] = useState(demoTasks)
  const [modal,setModal] = useState(null)

  useEffect(()=>{
    if(!user && !location.pathname.startsWith('/auth')) navigate('/auth')
    if(user && location.pathname === '/auth') navigate('/')
  },[user,location.pathname,navigate])

  if(!user) return <Auth onAuth={(u,t)=>{localStorage.setItem('devflow_user',JSON.stringify(u));localStorage.setItem('devflow_token',t||'demo-token');setUser(u);navigate('/')}} />

  const logout=()=>{localStorage.removeItem('devflow_user');localStorage.removeItem('devflow_token');setUser(null);navigate('/auth')}
  const openModal=type=>setModal(type)
  const addProject=form=>{const p={_id:Date.now().toString(),name:form.name,description:form.description,color:'#6c5ce7',status:'active',progress:0,completed:0,taskCount:0,dueDate:null};setProjects(v=>[...v,p]);setModal(null)}
  const addTask=form=>{const p=projects.find(x=>x._id===form.project)||projects[0];const t={_id:Date.now().toString(),title:form.title,project:p,priority:form.priority,status:form.status,dueDate:null};setTasks(v=>[t,...v]);setProjects(v=>v.map(x=>x._id===p._id?{...x,taskCount:(x.taskCount||0)+1}:x));setModal(null)}

  const path=location.pathname
  const page = path==='/' || path==='/overview' ? 'overview' : path.slice(1)
  const pageTitle = {projects:'Projects',tasks:'Tasks',calendar:'Calendar',ai:'AI Copilot',analytics:'Analytics',settings:'Settings'}[page] || 'Overview'

  return <div className="app-shell">
    <Sidebar open={mobileOpen} close={()=>setMobileOpen(false)} user={user} logout={logout}/>
    <main className="main-canvas">
      <header className="topbar">
        <div className="mobile-brand"><button className="icon-btn" onClick={()=>setMobileOpen(true)}><Menu size={19}/></button><div className="brand-lockup"><div className="logo-mark"><Zap size={16}/></div><div>DevFlow <b>AI</b></div></div></div>
        <div className="search-box"><Search size={17}/><input placeholder="Search projects, tasks…"/><kbd>⌘ K</kbd></div>
        <div className="top-actions"><button className="icon-btn"><Bell size={18}/><span className="notif-dot"/></button><div className="top-avatar">{initials(user.name)}</div></div>
      </header>
      <div className="content">
        {page==='overview' && <Overview user={user} projects={projects} tasks={tasks} openModal={openModal}/>} 
        {page==='projects' && <Projects projects={projects} onAdd={()=>openModal('project')}/>} 
        {page==='tasks' && <Tasks tasks={tasks} onAdd={()=>openModal('task')}/>} 
        {page==='calendar' && <Calendar projects={projects} tasks={tasks}/>} 
        {page==='ai' && <AICopilot projects={projects} onAddTask={addTask}/>} 
        {page==='analytics' && <Analytics projects={projects} tasks={tasks}/>} 
        {page==='settings' && <Settings user={user}/>} 
        {!['overview','projects','tasks','calendar','ai','analytics','settings'].includes(page) && <Overview user={user} projects={projects} tasks={tasks} openModal={openModal}/>} 
      </div>
    </main>
    {modal && <Modal type={modal} projects={projects} onClose={()=>setModal(null)} onSave={modal==='project'?addProject:addTask}/>} 
  </div>
}

function Auth({onAuth}){
  const [mode,setMode]=useState('login')
  const [form,setForm]=useState({name:'Alex Morgan',email:'demo@devflow.app',password:'Demo123!'})
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const submit=async e=>{e.preventDefault();setLoading(true);setError('');try{const r=await api.post(mode==='login'?'/auth/login':'/auth/register',mode==='login'?{email:form.email,password:form.password}:form);onAuth(r.data.user,r.data.token)}catch(err){onAuth(demoUser,'demo-token')}finally{setLoading(false)}}
  const demo=()=>onAuth(demoUser,'demo-token')
  return <div className="auth-wrap"><div className="auth-art"><div className="art-orb orb-a"/><div className="art-orb orb-b"/><div className="eyebrow"><span className="dot"/> DEVFLOW AI</div><h1>Turn busy work into <em>clear momentum.</em></h1><p>Projects, tasks, focus and AI suggestions — brought together in a premium workspace built for shipping.</p></div><div className="auth-card-wrap"><form className="auth-card" onSubmit={submit}><div className="brand-lockup"><div className="logo-mark"><Zap size={18}/></div><div>DevFlow <b>AI</b></div></div><h2>{mode==='login'?'Welcome back':'Create your workspace'}</h2><p className="muted">{mode==='login'?'Sign in to keep your projects moving.':'Start a focused workspace in under a minute.'}</p>{mode==='register'&&<label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}<label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{error&&<div className="error-banner">{error}</div>}<button className="primary-btn wide" disabled={loading}>{loading?'Loading…':mode==='login'?'Enter workspace':'Create account'} <ArrowUpRight size={17}/></button><button type="button" className="ghost-btn wide" onClick={demo}>Use demo workspace</button><div className="auth-switch">{mode==='login'?'New here?':'Already have an account?'} <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Create account':'Sign in'}</button></div></form></div></div>
}

function Sidebar({open,close,user,logout}){const items=[['/','Overview',LayoutDashboard],['/projects','Projects',FolderKanban],['/tasks','Tasks',Check],['/calendar','Calendar',CalendarDays]];return <>{open&&<div className="scrim" onClick={close}/>}<aside className={`sidebar ${open?'open':''}`}><div className="brand-lockup sidebar-brand"><div className="logo-mark"><Zap size={18}/></div><div>DevFlow <b>AI</b></div><button className="icon-btn mobile-close" onClick={close}><X size={18}/></button></div><div className="workspace-pill"><div className="workspace-avatar">D</div><div><b>Dev Studio</b><span>Personal workspace</span></div><ChevronDown size={15}/></div><div className="side-section">WORKSPACE</div><nav>{items.map(([to,label,Icon])=><NavLink key={to} to={to} className={({isActive})=>`nav-item ${isActive?'active':''}`} onClick={close}><Icon size={18}/><span>{label}</span></NavLink>)}</nav><div className="side-section spaced">TOOLS</div><nav><NavLink to="/ai" className="nav-item"><BrainCircuit size={18}/><span>AI Copilot</span><span className="new-chip">NEW</span></NavLink><NavLink to="/analytics" className="nav-item"><Activity size={18}/><span>Analytics</span></NavLink></nav><div className="sidebar-bottom"><NavLink to="/settings" className="nav-item"><Settings2 size={18}/><span>Settings</span></NavLink><div className="support-card"><div className="support-icon"><CircleHelp size={16}/></div><div><b>Need a hand?</b><span>Talk to DevFlow support.</span></div></div><button className="profile-row" onClick={logout}><div className="user-avatar">{initials(user.name)}</div><div><b>{user.name}</b><span>{user.email}</span></div><LogOut size={16}/></button></div></aside></>}

function Overview({user,projects,tasks,openModal}){const done=tasks.filter(t=>t.status==='done').length;const active=tasks.filter(t=>t.status==='in-progress').length;const pct=tasks.length?Math.round(done/tasks.length*100):0;return <><section className="hero-panel"><div className="hero-copy"><div className="eyebrow light"><span className="dot"/> FOCUS MODE</div><h1>Good morning, {user.name.split(' ')[0]}.<br/><span>Let's ship something great.</span></h1><p>Your workspace is moving with <b>{active} active tasks</b> across <b>{projects.length} projects</b>.</p><div className="hero-actions"><button className="primary-btn" onClick={()=>openModal('task')}><Plus size={17}/> New task</button><button className="hero-link" onClick={()=>window.history.pushState({},'', '/ai');window.dispatchEvent(new PopStateEvent('popstate'))}><Sparkles size={16}/> Ask AI to plan your next sprint <ArrowUpRight size={15}/></button></div></div><div className="hero-visual"><div className="ring"><div><strong>{pct}%</strong><span>done</span></div></div><div className="hero-note"><Target size={15}/><span>Weekly goal</span><b>{Math.min(done,12)} / 12 tasks</b></div></div></section><section className="metric-grid"><Metric title="Active projects" value={projects.length} delta="This workspace" icon={FolderKanban}/><Metric title="Tasks completed" value={done} delta={`${pct}% of total`} icon={Check}/><Metric title="In progress" value={active} delta="Keep momentum" icon={Clock3}/><Metric title="Needs attention" value={tasks.filter(t=>t.priority==='urgent'&&t.status!=='done').length} delta="Review urgent items" icon={Bell}/></section><div className="section-head"><div><div className="eyebrow"><span className="dot"/> WORKSPACE</div><h2>Projects in motion</h2></div><button className="soft-btn" onClick={()=>openModal('project')}>New project <Plus size={15}/></button></div><div className="project-grid">{projects.map(p=><ProjectCard key={p._id} project={p}/>)}</div><div className="section-head lower"><div><div className="eyebrow"><span className="dot"/> RECENT ACTIVITY</div><h2>Keep the flow going</h2></div></div><div className="table-card"><div className="task-head"><span>Task</span><span>Project</span><span>Priority</span><span>Status</span><span>Due</span></div>{tasks.slice(0,8).map(t=><TaskRow key={t._id} task={t}/>)}</div></>}
function Metric({title,value,delta,icon:Icon}){return <div className="metric-card"><div className="metric-icon"><Icon size={17}/></div><div><span>{title}</span><strong>{value}</strong><small>{delta}</small></div><ArrowUpRight className="metric-arrow" size={15}/></div>}
function ProjectCard({project}){return <div className="project-card"><div className="project-top"><div><span className="project-tag">{project.status}</span><h3>{project.name}</h3></div><button className="more-btn">•••</button></div><p>{project.description}</p><div className="progress-meta"><span>Progress</span><b>{project.progress||0}%</b></div><div className="progress-track"><span style={{width:`${project.progress||0}%`}}/></div><div className="project-bottom"><span>{project.completed||0}/{project.taskCount||0} tasks</span><span className="push">{fmtDate(project.dueDate)}</span></div></div>}
function TaskRow({task}){return <div className="task-row"><div className="task-name"><span className={`status-dot ${task.status}`}/><div><b>{task.title}</b><small>Keep the next step small and clear.</small></div></div><div className="project-cell"><span className="mini-project" style={{background:task.project?.color||'#6c5ce7'}}/>{task.project?.name||'Project'}</div><div><span className={`priority ${task.priority}`}>{task.priority}</span></div><div><span className={`status-pill ${task.status}`}>{task.status.replace('-',' ')}</span></div><div className="due-cell">{fmtDate(task.dueDate)}</div></div>}

function Projects({projects,onAdd}){return <div><PageHeader eyebrow="WORKSPACE" title="Projects" action="New project" onAction={onAdd}/><div className="project-grid">{projects.map(p=><ProjectCard key={p._id} project={p}/>)}</div></div>}
function Tasks({tasks,onAdd}){const [q,setQ]=useState('');const filtered=tasks.filter(t=>t.title.toLowerCase().includes(q.toLowerCase()));return <div><PageHeader eyebrow="WORKSPACE" title="Tasks" action="New task" onAction={onAdd}/><div className="task-toolbar"><div className="search-box inline"><Search size={17}/><input placeholder="Filter tasks…" value={q} onChange={e=>setQ(e.target.value)}/></div></div><div className="table-card"><div className="task-head"><span>Task</span><span>Project</span><span>Priority</span><span>Status</span><span>Due</span></div>{filtered.map(t=><TaskRow key={t._id} task={t}/>)}</div></div>}
function Calendar({tasks}){const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];return <div><PageHeader eyebrow="PLANNING" title="Calendar"/><div className="calendar-grid">{days.map(d=><div className="calendar-day" key={d}><b>{d}</b><span>{tasks.filter((_,i)=>i%7===days.indexOf(d)).length} items</span></div>)}</div><div className="table-card"><div className="calendar-list">{tasks.map(t=><div className="calendar-item" key={t._id}><span className={`status-dot ${t.status}`}/><div><b>{t.title}</b><small>{t.project?.name}</small></div><span className="push">No due date</span></div>)}</div></div></div>}
function AICopilot({projects,onAddTask}){const [brief,setBrief]=useState('');const [items,setItems]=useState([]);const generate=async()=>{if(!brief.trim())return;try{const r=await api.post('/ai/generate-tasks',{projectName:projects[0]?.name||'New project',brief});setItems(r.data.tasks||[])}catch{setItems([{title:'Define the goal',priority:'high',description:'Clarify success criteria and user outcomes.'},{title:'Break into milestones',priority:'high',description:'Turn the idea into small deliverable slices.'},{title:'Build and validate',priority:'medium',description:'Ship the critical path and verify it.'}])}};return <div><PageHeader eyebrow="TOOLS" title="AI Copilot"/><div className="ai-panel"><div className="ai-prompt"><Sparkles size={18}/><input value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Describe what you want to build…"/><button className="primary-btn" onClick={generate}>Generate plan</button></div>{items.map((x,i)=><div className="suggestion" key={i}><div><span className={`priority ${x.priority}`}>{x.priority}</span><b>{x.title}</b><small>{x.description}</small></div><Check size={17}/></div>)}</div><p className="muted">AI suggestions are a starting point. Review before shipping.</p></div>}
function Analytics({projects,tasks}){const done=tasks.filter(t=>t.status==='done').length, inprog=tasks.filter(t=>t.status==='in-progress').length, todo=tasks.filter(t=>t.status==='todo').length;return <div><PageHeader eyebrow="INSIGHTS" title="Analytics"/><div className="metric-grid"><Metric title="Projects" value={projects.length} delta="Active" icon={FolderKanban}/><Metric title="Completed" value={done} delta="Tasks" icon={Check}/><Metric title="In progress" value={inprog} delta="Tasks" icon={Clock3}/><Metric title="To do" value={todo} delta="Tasks" icon={Target}/></div><div className="analytics-card"><h3>Delivery mix</h3><div className="bar"><span style={{width:`${tasks.length?done/tasks.length*100:0}%`}}/></div><div className="analytics-legend"><span>Done {done}</span><span>In progress {inprog}</span><span>To do {todo}</span></div></div></div>}
function Settings({user}){return <div><PageHeader eyebrow="WORKSPACE" title="Settings"/><div className="settings-card"><div className="setting-row"><div><b>Profile</b><span>Manage your workspace identity</span></div><div className="setting-value">{user.name}</div></div><div className="setting-row"><div><b>Email</b><span>Account email address</span></div><div className="setting-value">{user.email}</div></div><div className="setting-row"><div><b>Workspace</b><span>Personal development space</span></div><div className="setting-value">Dev Studio</div></div></div></div>}
function PageHeader({eyebrow,title,action,onAction}){return <div className="section-head page-head"><div><div className="eyebrow"><span className="dot"/> {eyebrow}</div><h2>{title}</h2></div>{action&&<button className="primary-btn" onClick={onAction}><Plus size={16}/>{action}</button>}</div>}
function Modal({type,projects,onClose,onSave}){const [f,setF]=useState(type==='project'?{name:'',description:''}:{title:'',project:projects[0]?._id||'',priority:'medium',status:'todo'});return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><div className="eyebrow"><span className="dot"/>{type==='project'?'PROJECT':'TASK'}</div><h3>{type==='project'?'Create a project':'Create a task'}</h3></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div><form className="modal-form" onSubmit={e=>{e.preventDefault();onSave(f)}}>{type==='project'?<><label>Project name<input autoFocus value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="e.g. Atlas Redesign" required/></label><label>Description<textarea value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="What are you trying to ship?"/></label></>:<><label>Task title<input autoFocus value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Make the next step actionable" required/></label><label>Project<select value={f.project} onChange={e=>setF({...f,project:e.target.value})}>{projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></label><div className="form-grid"><label>Priority<select value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></label><label>Status<select value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option>todo</option><option>in-progress</option><option>done</option></select></label></div></>}<div className="modal-actions"><button type="button" className="soft-btn" onClick={onClose}>Cancel</button><button className="primary-btn">Save</button></div></form></div></div>}

export default App
