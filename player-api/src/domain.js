/** Sirf ye domains se player events accept */
export const ALLOWED_PLAYER_HOSTS = new Set([
  'teraboxlinke.com',
  'www.teraboxlinke.com',
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

export function verifyPlayerDomain(req, body = {}) {
  const originHost = hostFromUrl(req.headers?.origin || '')
  const refererHost = hostFromUrl(req.headers?.referer || req.headers?.referrer || '')
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
