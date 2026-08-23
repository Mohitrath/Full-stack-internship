import express from 'express'
import OpenAI from 'openai'
import { auth } from '../middleware/auth.js'

const router = express.Router()
router.use(auth)

router.post('/generate-tasks', async (req, res, next) => {
  try {
    const { projectName, brief } = req.body
    if (!projectName?.trim()) return res.status(400).json({ message: 'Project name is required.' })

    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Return JSON with a tasks array. Each task has title, description, priority (low|medium|high|urgent), and labels array.' },
          { role: 'user', content: `Create 5 practical software project tasks for "${projectName}". Brief: ${brief || 'A modern product build'}` }
        ]
      })
      const data = JSON.parse(completion.choices[0].message.content)
      return res.json({ source: 'openai', tasks: data.tasks || [] })
    }

    const base = [
      ['Define project scope and acceptance criteria', 'high', ['planning']],
      ['Design responsive interface states', 'high', ['frontend', 'ux']],
      ['Implement REST API endpoints', 'urgent', ['backend', 'api']],
      ['Connect database models and validation', 'medium', ['database']],
      ['Add tests, polish, and deployment checks', 'medium', ['qa', 'deployment']]
    ]
    res.json({ source: 'local-fallback', tasks: base.map(([title, priority, labels]) => ({ title, priority, labels, description: `Suggested execution step for ${projectName}.` })) })
  } catch (err) { next(err) }
})

export default router
