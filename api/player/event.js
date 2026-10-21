import crypto from 'node:crypto'
import {
  ALLOWED_EVENTS,
  clientIp,
  cors,
  resolveOwner,
  saveEvent,
  verifyPlayerDomain,
} from './_lib.js'

export default async function handler(req, res) {
  cors(res, req)
  if (req.method === 'OPTIONS') {
    const check = verifyPlayerDomain(req, {})
    if (!check.ok && req.headers.origin) {
      return res.status(403).json({ ok: false, error: 'Domain not allowed' })
    }
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'POST only' })
  }

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
    const owner = await resolveOwner(linkId)
    const row = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      event,
      linkId,
      ownerEmail: owner.email || String(body.ownerEmail || '').trim(),
      ownerEmailKey: owner.emailKey || '',
      ownerResolved: !!owner.found,
      adSlot: String(body.adSlot || body.ad_slot || '').trim().slice(0, 80),
      adUnit: String(body.adUnit || body.ad_unit || '').trim().slice(0, 160),
      pageUrl: String(body.pageUrl || body.page_url || '').trim().slice(0, 500),
      referrer: String(body.referrer || req.headers.referer || '').trim().slice(0, 500),
      playerHost: domain.host,
      sessionId:
        String(body.sessionId || body.session_id || '').trim().slice(0, 80) ||
        crypto.randomUUID(),
      ip: clientIp(req),
      userAgent: String(body.userAgent || req.headers['user-agent'] || '').slice(0, 400),
      touch:
        body.touch && typeof body.touch === 'object'
          ? {
              x: Number(body.touch.x) || 0,
              y: Number(body.touch.y) || 0,
              type: String(body.touch.type || 'unknown').slice(0, 20),
            }
          : null,
      meta: body.meta && typeof body.meta === 'object' ? body.meta : undefined,
    }

    const saved = await saveEvent(row)
    return res.status(200).json({
      ok: true,
      id: row.id,
      key: saved.key,
      ownerEmail: row.ownerEmail,
      ip: row.ip,
      playerHost: row.playerHost,
    })
  } catch (err) {
    console.error('player event', err)
    return res.status(500).json({ ok: false, error: err.message || 'Server error' })
  }
}
