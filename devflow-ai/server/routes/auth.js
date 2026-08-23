import express from 'express'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()
const hash = (password) => crypto.createHash('sha256').update(password).digest('hex')
const tokenFor = (user) => jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and a 6+ character password are required.' })
    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(409).json({ message: 'An account already exists for that email.' })
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash: hash(password) })
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) { next(err) }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: (email || '').toLowerCase() })
    if (!user || user.passwordHash !== hash(password || '')) return res.status(401).json({ message: 'Invalid email or password.' })
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) { next(err) }
})

export default router
