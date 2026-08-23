import express from 'express'
import Task from '../models/Task.js'
import Project from '../models/Project.js'
import Activity from '../models/Activity.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()
router.use(auth)

router.get('/', async (req, res, next) => {
  try {
    const { status, priority, q } = req.query
    const projects = await Project.find({ owner: req.user._id }).select('_id')
    const filter = { project: { $in: projects.map(p => p._id) } }
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (q) filter.title = { $regex: q, $options: 'i' }
    const tasks = await Task.find(filter).populate('project', 'name color').populate('assignee', 'name email').sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { title, description, project, status = 'todo', priority = 'medium', dueDate, labels = [] } = req.body
    const p = await Project.findOne({ _id: project, owner: req.user._id })
    if (!p) return res.status(404).json({ message: 'Project not found.' })
    if (!title?.trim()) return res.status(400).json({ message: 'Task title is required.' })
    const task = await Task.create({ title: title.trim(), description, project, assignee: req.user._id, status, priority, dueDate, labels })
    await Activity.create({ user: req.user._id, action: 'created a task', entity: task.title })
    res.status(201).json(await task.populate([{ path: 'project', select: 'name color' }, { path: 'assignee', select: 'name email' }]))
  } catch (err) { next(err) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const ownedProjects = await Project.find({ owner: req.user._id }).select('_id')
    const task = await Task.findOneAndUpdate({ _id: req.params.id, project: { $in: ownedProjects.map(p => p._id) } }, req.body, { new: true, runValidators: true }).populate('project', 'name color').populate('assignee', 'name email')
    if (!task) return res.status(404).json({ message: 'Task not found.' })
    await Activity.create({ user: req.user._id, action: `changed task to ${task.status}`, entity: task.title })
    res.json(task)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const ownedProjects = await Project.find({ owner: req.user._id }).select('_id')
    const task = await Task.findOne({ _id: req.params.id, project: { $in: ownedProjects.map(p => p._id) } })
    if (!task) return res.status(404).json({ message: 'Task not found.' })
    await task.deleteOne()
    await Activity.create({ user: req.user._id, action: 'deleted a task', entity: task.title })
    res.status(204).end()
  } catch (err) { next(err) }
})

export default router
