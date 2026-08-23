import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Authentication required.' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-passwordHash')
    if (!user) return res.status(401).json({ message: 'User no longer exists.' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired session.' })
  }
}
