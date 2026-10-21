import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(
  process.env.DATA_DIR || path.join(__dirname, '..', 'data'),
)
const EVENTS_DIR = path.join(DATA_DIR, 'events')

function ensureDirs() {
  fs.mkdirSync(EVENTS_DIR, { recursive: true })
}

function dayFile(isoDay) {
  return path.join(EVENTS_DIR, `${isoDay}.jsonl`)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function initStore() {
  ensureDirs()
}

export function appendEvent(event) {
  ensureDirs()
  const day = String(event.ts || new Date().toISOString()).slice(0, 10)
  const line = JSON.stringify(event) + '\n'
  fs.appendFileSync(dayFile(day), line, 'utf8')
  return event
}

function listDayFiles() {
  ensureDirs()
  return fs
    .readdirSync(EVENTS_DIR)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(name))
    .sort()
}

function readDay(isoDay) {
  const file = dayFile(isoDay)
  if (!fs.existsSync(file)) return []
  const text = fs.readFileSync(file, 'utf8')
  const out = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      out.push(JSON.parse(line))
    } catch {
      /* skip bad line */
    }
  }
  return out
}

export function readEvents({ start, end, limit = 200, offset = 0, linkId, email, event } = {}) {
  const files = listDayFiles()
  const startDay = start || (files[0] ? files[0].replace('.jsonl', '') : todayIso())
  const endDay = end || todayIso()
  const rows = []

  for (const name of files) {
    const day = name.replace('.jsonl', '')
    if (day < startDay || day > endDay) continue
    for (const row of readDay(day)) {
      if (linkId && row.linkId !== linkId) continue
      if (email && String(row.ownerEmail || '').toLowerCase() !== String(email).toLowerCase()) {
        continue
      }
      if (event && row.event !== event) continue
      rows.push(row)
    }
  }

  rows.sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
  const sliced = rows.slice(offset, offset + Math.max(1, Math.min(2000, limit)))
  return { total: rows.length, rows: sliced }
}

export function buildStats({ start, end, linkId, email } = {}) {
  const { rows, total } = readEvents({
    start,
    end,
    linkId,
    email,
    limit: 500000,
    offset: 0,
  })

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

  const topIps = Object.entries(byIp)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)

  const links = Object.values(byLink)
    .sort((a, b) => b.events - a.events)
    .slice(0, 200)

  const mails = Object.values(byMail)
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
    .slice(0, 200)

  return {
    totalEvents: total,
    sessions: sessions.size,
    touches,
    playerClicks,
    playlineClicks,
    adContinues,
    redirects,
    byEvent,
    byAd: Object.values(byAd).sort((a, b) => b.impressions + b.clicks - (a.impressions + a.clicks)),
    byLink: links,
    byMail: mails,
    topIps,
  }
}
