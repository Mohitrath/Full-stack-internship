import handler from '../serverless-api.js'

export default function apiIndex(req, res) {
  const raw = req.url || '/api/index'
  const queryIndex = raw.indexOf('?')
  const query = queryIndex >= 0 ? raw.slice(queryIndex) : ''
  const params = new URLSearchParams(query)
  const route = params.get('route') || '/health'
  req.url = `/api${route}`
  return handler(req, res)
}
