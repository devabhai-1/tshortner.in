const FB_BASE =
  process.env.FIREBASE_DATABASE_URL ||
  process.env.VITE_FIREBASE_DATABASE_URL ||
  'https://tshortner-in-default-rtdb.asia-southeast1.firebasedatabase.app'

/** Sirf ye domains se player events accept — baaki block */
export const ALLOWED_PLAYER_HOSTS = new Set([
  'teraboxlinke.com',
  'www.teraboxlinke.com',
])

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

export function hostFromUrl(value) {
  try {
    const u = new URL(String(value || '').trim())
    return String(u.hostname || '').toLowerCase()
  } catch {
    return ''
  }
}

export function isAllowedPlayerHost(host) {
  return ALLOWED_PLAYER_HOSTS.has(String(host || '').toLowerCase())
}

/**
 * Origin / Referer / pageUrl — kam se kam ek allowed domain hona chahiye.
 * Warna event reject.
 */
export function verifyPlayerDomain(req, body = {}) {
  const originHost = hostFromUrl(req.headers.origin || '')
  const refererHost = hostFromUrl(req.headers.referer || req.headers.referrer || '')
  const pageHost = hostFromUrl(body.pageUrl || body.page_url || '')
  const referrerBodyHost = hostFromUrl(body.referrer || '')

  const hosts = [originHost, refererHost, pageHost, referrerBodyHost].filter(Boolean)
  const allowed = hosts.find((h) => isAllowedPlayerHost(h)) || ''

  return {
    ok: !!allowed,
    host: allowed || hosts[0] || '',
    checked: hosts,
  }
}

function decodeEmailKey(key) {
  if (!key) return ''
  if (String(key).includes(',')) return String(key).replace(/,/g, '.')
  return String(key).replace(/_/g, '.')
}

function emailsFromNode(data) {
  if (!data || typeof data !== 'object') return { email: '', emailKey: '' }
  let email = String(data.ownerEmail || data.email || '').trim()
  let emailKey = String(data.ownerEmailKey || data.emailKey || '').trim()
  if (!email && emailKey) email = decodeEmailKey(emailKey)
  if (!email && data.users && typeof data.users === 'object') {
    const keys = Object.keys(data.users)
      .filter((k) => data.users[k] && k && k !== '_unknown')
      .sort()
    const preferred = keys.find((k) => k.includes('@')) || keys[0] || ''
    if (preferred) {
      emailKey = preferred
      email = decodeEmailKey(preferred)
    }
  }
  if (!email) return { email: '', emailKey: '' }
  return { email, emailKey: emailKey || email.replace(/\./g, ',') }
}

export function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim()
  return xf || String(req.headers['x-real-ip'] || '').trim() || ''
}

export function cors(res, req) {
  const origin = String(req?.headers?.origin || '')
  const originHost = hostFromUrl(origin)
  if (origin && isAllowedPlayerHost(originHost)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else if (!origin) {
    // same-origin / non-browser tools — no ACAO needed
  }
  // Disallowed origins: no CORS header → browser blocks
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-api-key')
}

export async function resolveOwner(linkId) {
  const code = String(linkId || '').trim()
  if (!code || code === 'demo123' || code === 'player' || code === 'v') {
    return { email: '', emailKey: '', found: false }
  }
  try {
    const res = await fetch(`${FB_BASE}/allLinks/${encodeURIComponent(code)}.json`, {
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return { email: '', emailKey: '', found: false }
    const owner = emailsFromNode(await res.json())
    return { email: owner.email, emailKey: owner.emailKey, found: !!owner.email }
  } catch {
    return { email: '', emailKey: '', found: false }
  }
}

export async function saveEvent(row) {
  const day = String(row.ts || new Date().toISOString()).slice(0, 10)
  const pushRes = await fetch(`${FB_BASE}/playerAnalytics/events/${day}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
  })
  if (!pushRes.ok) {
    const text = await pushRes.text().catch(() => '')
    throw new Error(`Firebase save failed ${pushRes.status} ${text.slice(0, 120)}`)
  }
  const pushed = await pushRes.json()
  return { key: pushed?.name || row.id, row }
}

export async function loadDayEvents(day) {
  const res = await fetch(`${FB_BASE}/playerAnalytics/events/${day}.json`)
  if (!res.ok) return []
  const data = await res.json()
  if (!data || typeof data !== 'object') return []
  return Object.entries(data).map(([key, val]) => ({ id: key, ...(val || {}) }))
}

function isoDaysBetween(start, end) {
  const out = []
  let cur = start
  while (cur && cur <= end && out.length < 90) {
    out.push(cur)
    const [y, m, d] = cur.split('-').map(Number)
    cur = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10)
  }
  return out
}

export async function buildStats({ start, end, linkId, email } = {}) {
  const endDay = end || new Date().toISOString().slice(0, 10)
  const startDay = start || endDay
  const days = isoDaysBetween(startDay, endDay)
  const rows = []
  for (const day of days) {
    const list = await loadDayEvents(day)
    for (const row of list) {
      if (linkId && row.linkId !== linkId) continue
      if (email && String(row.ownerEmail || '').toLowerCase() !== String(email).toLowerCase()) {
        continue
      }
      rows.push(row)
    }
  }

  const byEvent = {}
  const byAd = {}
  const byLink = {}
  const byMail = {}
  const byIp = {}
  const sessions = new Set()
  let touches = 0
  let playerClicks = 0
  let playlineClicks = 0
  let adContinues = 0
  let redirects = 0

  for (const row of rows) {
    const ev = row.event || 'unknown'
    byEvent[ev] = (byEvent[ev] || 0) + 1
    if (row.sessionId) sessions.add(row.sessionId)
    if (row.ip) byIp[row.ip] = (byIp[row.ip] || 0) + 1

    if (row.linkId) {
      if (!byLink[row.linkId]) {
        byLink[row.linkId] = {
          linkId: row.linkId,
          ownerEmail: row.ownerEmail || '',
          events: 0,
          player_click: 0,
          playline_click: 0,
          ad_continue: 0,
          page_view: 0,
        }
      }
      const L = byLink[row.linkId]
      L.events += 1
      if (ev in L) L[ev] += 1
      if (row.ownerEmail) L.ownerEmail = row.ownerEmail
    }

    const mail = row.ownerEmail || 'Mail not linked'
    if (!byMail[mail]) {
      byMail[mail] = {
        email: mail,
        events: 0,
        player_click: 0,
        playline_click: 0,
        ad_continue: 0,
        page_view: 0,
        uniqueLinks: new Set(),
      }
    }
    const M = byMail[mail]
    M.events += 1
    if (ev in M) M[ev] += 1
    if (row.linkId) M.uniqueLinks.add(row.linkId)

    if (row.adSlot || row.adUnit) {
      const key = row.adSlot || row.adUnit || 'unknown'
      if (!byAd[key]) {
        byAd[key] = {
          adSlot: key,
          adUnit: row.adUnit || '',
          impressions: 0,
          clicks: 0,
          continues: 0,
        }
      }
      const A = byAd[key]
      if (ev === 'ad_impression' || ev === 'ad_shown') A.impressions += 1
      if (ev === 'ad_click') A.clicks += 1
      if (ev === 'ad_continue' || ev === 'ad_close') A.continues += 1
    }

    if (ev === 'touch') touches += 1
    if (ev === 'player_click') playerClicks += 1
    if (ev === 'playline_click') playlineClicks += 1
    if (ev === 'ad_continue' || ev === 'ad_close') adContinues += 1
    if (ev === 'redirect') redirects += 1
  }

  return {
    totalEvents: rows.length,
    sessions: sessions.size,
    touches,
    playerClicks,
    playlineClicks,
    adContinues,
    redirects,
    byEvent,
    byAd: Object.values(byAd),
    byLink: Object.values(byLink).sort((a, b) => b.events - a.events).slice(0, 200),
    byMail: Object.values(byMail)
      .map((m) => ({
        email: m.email,
        events: m.events,
        player_click: m.player_click,
        playline_click: m.playline_click,
        ad_continue: m.ad_continue,
        page_view: m.page_view,
        uniqueLinks: m.uniqueLinks.size,
      }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 200),
    topIps: Object.entries(byIp)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50),
  }
}

export { ALLOWED_EVENTS, FB_BASE }
