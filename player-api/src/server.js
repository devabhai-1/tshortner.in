import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import crypto from 'node:crypto'
import { ALLOWED_PLAYER_HOSTS, hostFromUrl, isAllowedPlayerHost, verifyPlayerDomain } from './domain.js'
import { resolveOwner } from './owner.js'
import { appendEvent, buildStats, initStore, readEvents } from './store.js'

const app = express()
const PORT = Number(process.env.PORT || 8787)
const API_KEY = String(process.env.PLAYER_API_KEY || '').trim()

const defaultCors = [
  'https://teraboxlinke.com',
  'https://www.teraboxlinke.com',
]
const corsOrigins = String(process.env.CORS_ORIGINS || defaultCors.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.set('trust proxy', true)
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (corsOrigins.includes('*')) return cb(null, true)
      if (corsOrigins.includes(origin)) return cb(null, true)
      const host = hostFromUrl(origin)
      if (isAllowedPlayerHost(host)) return cb(null, true)
      return cb(null, false)
    },
  }),
)
app.use(express.json({ limit: '64kb' }))

initStore()

const ALLOWED_EVENTS = new Set([
  'page_view',
  'touch',
  'player_click',
  'playline_click',
  'ad_impression',
  'ad_shown',
  'ad_click',
  'ad_continue',
  'ad_close',
  'redirect',
])

function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim()
  return (
    xf ||
    String(req.headers['x-real-ip'] || '').trim() ||
    req.socket?.remoteAddress ||
    ''
  )
}

function requireApiKey(req, res, next) {
  if (!API_KEY) return next()
  const key = String(req.headers['x-api-key'] || req.query.key || '').trim()
  if (key && key === API_KEY) return next()
  return res.status(401).json({ ok: false, error: 'Unauthorized' })
}

app.get('/api/player/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'tshortner-player-api',
    allowedPlayerHosts: [...ALLOWED_PLAYER_HOSTS],
    ts: new Date().toISOString(),
  })
})

/**
 * POST /api/player/event
 * Sirf teraboxlinke.com / www.teraboxlinke.com player se.
 */
app.post('/api/player/event', async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const domain = verifyPlayerDomain(req, body)
    if (!domain.ok) {
      return res.status(403).json({
        ok: false,
        error: 'Only teraboxlinke.com / www.teraboxlinke.com player allowed',
        host: domain.host || null,
      })
    }

    const event = String(body.event || '').trim()
    if (!ALLOWED_EVENTS.has(event)) {
      return res.status(400).json({ ok: false, error: 'Invalid event' })
    }

    const linkId = String(body.linkId || body.link_id || '').trim().slice(0, 120)
    const sessionId = String(body.sessionId || body.session_id || '').trim().slice(0, 80)
    const adSlot = String(body.adSlot || body.ad_slot || '').trim().slice(0, 80)
    const adUnit = String(body.adUnit || body.ad_unit || '').trim().slice(0, 160)
    const pageUrl = String(body.pageUrl || body.page_url || '').trim().slice(0, 500)
    const referrer = String(body.referrer || req.headers.referer || '').trim().slice(0, 500)
    const userAgent = String(body.userAgent || req.headers['user-agent'] || '').slice(0, 400)

    let touch = null
    if (body.touch && typeof body.touch === 'object') {
      touch = {
        x: Number(body.touch.x) || 0,
        y: Number(body.touch.y) || 0,
        type: String(body.touch.type || 'unknown').slice(0, 20),
      }
    }

    const owner = await resolveOwner(linkId)
    const row = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      event,
      linkId,
      ownerEmail: owner.email || String(body.ownerEmail || '').trim(),
      ownerEmailKey: owner.emailKey || '',
      ownerResolved: !!owner.found,
      adSlot,
      adUnit,
      pageUrl,
      referrer,
      playerHost: domain.host,
      sessionId: sessionId || crypto.randomUUID(),
      ip: clientIp(req),
      userAgent,
      touch,
      meta: body.meta && typeof body.meta === 'object' ? body.meta : undefined,
    }

    appendEvent(row)
    res.json({
      ok: true,
      id: row.id,
      ownerEmail: row.ownerEmail,
      ip: row.ip,
      playerHost: row.playerHost,
    })
  } catch (err) {
    console.error('event error', err)
    res.status(500).json({ ok: false, error: 'Server error' })
  }
})

/** Batch helper — same fields as single event */
app.post('/api/player/events', async (req, res) => {
  try {
    const list = Array.isArray(req.body?.events) ? req.body.events : []
    if (!list.length || list.length > 50) {
      return res.status(400).json({ ok: false, error: 'events array 1..50 required' })
    }
    const domain = verifyPlayerDomain(req, list[0] || {})
    if (!domain.ok) {
      return res.status(403).json({
        ok: false,
        error: 'Only teraboxlinke.com / www.teraboxlinke.com player allowed',
        host: domain.host || null,
      })
    }
    const saved = []
    for (const item of list) {
      const event = String(item.event || '').trim()
      if (!ALLOWED_EVENTS.has(event)) continue
      const itemDomain = verifyPlayerDomain(req, item)
      if (!itemDomain.ok) continue
      const linkId = String(item.linkId || '').trim().slice(0, 120)
      const owner = await resolveOwner(linkId)
      const row = {
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        event,
        linkId,
        ownerEmail: owner.email || '',
        ownerEmailKey: owner.emailKey || '',
        ownerResolved: !!owner.found,
        adSlot: String(item.adSlot || '').trim().slice(0, 80),
        adUnit: String(item.adUnit || '').trim().slice(0, 160),
        pageUrl: String(item.pageUrl || '').trim().slice(0, 500),
        referrer: String(item.referrer || '').trim().slice(0, 500),
        playerHost: itemDomain.host,
        sessionId: String(item.sessionId || '').trim().slice(0, 80) || crypto.randomUUID(),
        ip: clientIp(req),
        userAgent: String(item.userAgent || req.headers['user-agent'] || '').slice(0, 400),
        touch:
          item.touch && typeof item.touch === 'object'
            ? {
                x: Number(item.touch.x) || 0,
                y: Number(item.touch.y) || 0,
                type: String(item.touch.type || 'unknown').slice(0, 20),
              }
            : null,
      }
      appendEvent(row)
      saved.push(row.id)
    }
    res.json({ ok: true, saved: saved.length, ids: saved })
  } catch (err) {
    console.error('batch error', err)
    res.status(500).json({ ok: false, error: 'Server error' })
  }
})

app.get('/api/player/stats', requireApiKey, (req, res) => {
  const stats = buildStats({
    start: String(req.query.start || '').slice(0, 10) || undefined,
    end: String(req.query.end || '').slice(0, 10) || undefined,
    linkId: String(req.query.linkId || '').trim() || undefined,
    email: String(req.query.email || '').trim() || undefined,
  })
  res.json({ ok: true, ...stats })
})

app.get('/api/player/events', requireApiKey, (req, res) => {
  const result = readEvents({
    start: String(req.query.start || '').slice(0, 10) || undefined,
    end: String(req.query.end || '').slice(0, 10) || undefined,
    linkId: String(req.query.linkId || '').trim() || undefined,
    email: String(req.query.email || '').trim() || undefined,
    event: String(req.query.event || '').trim() || undefined,
    limit: parseInt(req.query.limit || '100', 10) || 100,
    offset: parseInt(req.query.offset || '0', 10) || 0,
  })
  res.json({ ok: true, ...result })
})

app.get('/', (_req, res) => {
  res.type('text').send(
    [
      'tshortner Player API',
      '',
      'POST /api/player/event',
      'POST /api/player/events',
      'GET  /api/player/health',
      'GET  /api/player/stats   (x-api-key)',
      'GET  /api/player/events  (x-api-key)',
    ].join('\n'),
  )
})

app.listen(PORT, () => {
  console.log(`Player API listening on http://localhost:${PORT}`)
  console.log(`Health: http://localhost:${PORT}/api/player/health`)
})
