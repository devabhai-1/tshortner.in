import { buildStats, cors } from './_lib.js'

export default async function handler(req, res) {
  cors(res, req)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'GET only' })
  }

  const key = String(req.headers['x-api-key'] || req.query.key || '').trim()
  const expected = String(process.env.PLAYER_API_KEY || '').trim()
  if (expected && key !== expected) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' })
  }

  try {
    const stats = await buildStats({
      start: String(req.query.start || '').slice(0, 10) || undefined,
      end: String(req.query.end || '').slice(0, 10) || undefined,
      linkId: String(req.query.linkId || '').trim() || undefined,
      email: String(req.query.email || '').trim() || undefined,
    })
    return res.status(200).json({ ok: true, ...stats })
  } catch (err) {
    console.error('player stats', err)
    return res.status(500).json({ ok: false, error: err.message || 'Server error' })
  }
}
