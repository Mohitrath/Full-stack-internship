import express from 'express'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import Activity from '../models/Activity.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()
router.use(auth)

router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 })
    const withStats = await Promise.all(projects.map(async p => {
      const tasks = await Task.find({ project: p._id }).lean()
      const completed = tasks.filter(t => t.status === 'done').length
      return { ...p.toObject(), taskCount: tasks.length, completed, progress: tasks.length ? Math.round(completed / tasks.length * 100) : 0 }
    }))
    res.json(withStats)
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, description, color, dueDate, tags = [] } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Project name is required.' })
    const project = await Project.create({ owner: req.user._id, name: name.trim(), description, color, dueDate, tags })
    await Activity.create({ user: req.user._id, action: 'created a project', entity: project.name })
    res.status(201).json(project)
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const tasks = await Task.find({ project: project._id }).populate('assignee', 'name email').sort({ createdAt: -1 })
    res.json({ project, tasks })
  } catch (err) { next(err) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true, runValidators: true })
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    await Activity.create({ user: req.user._id, action: 'updated a project', entity: project.name })
    res.json(project)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    await Task.deleteMany({ project: project._id })
    await project.deleteOne()
    await Activity.create({ user: req.user._id, action: 'deleted a project', entity: project.name })
    res.status(204).end()
  } catch (err) { next(err) }
})

export default router
