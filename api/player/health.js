import { ALLOWED_PLAYER_HOSTS, cors } from './_lib.js'

export default async function handler(req, res) {
  cors(res, req)
  if (req.method === 'OPTIONS') return res.status(204).end()
  return res.status(200).json({
    ok: true,
    service: 'tshortner-player-api',
    host: 'tshortner.in',
    allowedPlayerHosts: [...ALLOWED_PLAYER_HOSTS],
    ts: new Date().toISOString(),
  })
}
