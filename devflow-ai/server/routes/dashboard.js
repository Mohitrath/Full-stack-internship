import express from 'express'
import { auth } from '../middleware/auth.js'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import Activity from '../models/Activity.js'

const router = express.Router()
router.use(auth)

router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 }).lean()
    const projectIds = projects.map(p => p._id)
    const tasks = await Task.find({ project: { $in: projectIds } }).populate('project', 'name color').sort({ updatedAt: -1 }).lean()
    const stats = {
      projects: projects.length,
      tasks: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      active: tasks.filter(t => t.status !== 'done').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
    }
    const activity = await Activity.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(6).lean()
    res.json({ stats, projects, tasks: tasks.slice(0, 8), activity })
  } catch (err) { next(err) }
})

export default router
