/**
 * Bump CACHE_CLEAR_VERSION on each production deploy when you want every device
 * to wipe TShortner PWA caches (Cache Storage + service workers) once, then reload.
 * Har device par pehli baar nayi version dikhte hi yeh chalega.
 */
const STORAGE_KEY = 'tshortner_app_cache_clear_v';

export const CACHE_CLEAR_VERSION = '3';

export async function runCacheVersionMigration() {
  if (import.meta.env.DEV) return;

  let stored;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    return;
  }

  if (stored === CACHE_CLEAR_VERSION) return;

  try {
    if (typeof caches !== 'undefined' && caches.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch (e) {
    console.warn('TShortner: could not clear Cache Storage', e);
  }

  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch (e) {
    console.warn('TShortner: could not unregister service workers', e);
  }

  try {
    localStorage.setItem(STORAGE_KEY, CACHE_CLEAR_VERSION);
  } catch {
    return;
  }

  window.location.reload();
}
