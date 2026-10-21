const FB_BASE =
  process.env.FIREBASE_DATABASE_URL ||
  'https://tshortner-in-default-rtdb.asia-southeast1.firebasedatabase.app'

const cache = new Map()
const CACHE_TTL_MS = 10 * 60 * 1000

function decodeEmailKey(key) {
  if (!key) return ''
  if (key.includes(',')) return key.replace(/,/g, '.')
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
  return {
    email,
    emailKey: emailKey || email.replace(/\./g, ','),
  }
}

export async function resolveOwner(linkId) {
  const code = String(linkId || '').trim()
  if (!code || code === 'demo123' || code === 'player' || code === 'v') {
    return { email: '', emailKey: '', found: false }
  }

  const hit = cache.get(code)
  if (hit && Date.now() - hit.t < CACHE_TTL_MS) return hit.value

  try {
    const url = `${FB_BASE}/allLinks/${encodeURIComponent(code)}.json`
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      const miss = { email: '', emailKey: '', found: false }
      cache.set(code, { t: Date.now(), value: miss })
      return miss
    }
    const data = await res.json()
    const owner = emailsFromNode(data)
    const value = {
      email: owner.email,
      emailKey: owner.emailKey,
      found: !!owner.email,
    }
    cache.set(code, { t: Date.now(), value })
    return value
  } catch {
    return { email: '', emailKey: '', found: false }
  }
}
