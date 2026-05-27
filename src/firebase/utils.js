// Firebase Utility Functions - EXACT same logic as original project
import { ref, get, set, update, push } from 'firebase/database';
import { db } from './config';

// Email → RTDB key conversion (replace . with ,)
export function emailToKey(email) {
  return email.replace(/\./g, ",");
}

// Build 90 days daily map (zero initialized)
export function buildDailyMap(days = 90) {
  const out = {};
  const t = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(t);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    out[key] = {
      impressions: 0,
      cpm: 0,
      earning: 0
    };
  }
  return out;
}

// Format money to 2 decimal places
export function formatMoney(num = 0) {
  const n = Number(num) || 0;
  return n.toFixed(2);
}

// Format number with Indian locale
export function formatNumber(num = 0) {
  const n = Number(num) || 0;
  return n.toLocaleString("en-IN");
}

// Format date label from ISO string
export function formatDateLabel(iso) {
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// Format date from timestamp
export function formatDateFromTs(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// Create full user node in RTDB (for new signups) - EXACT same as HTML
export async function createUserNode(user, name) {
  const uid = user.uid;
  const email = user.email;
  const now = Date.now();

  const emailKey = emailToKey(email);
  const dailyMap = buildDailyMap(90);

  const userRef = ref(db, "users/" + emailKey);

  // EXACT structure matching HTML:
  // users
  //  └─ vishan@gmail,com
  //      ├─ profile { ... }
  //      ├─ dashboard { dailyEarning, ..., daily {date: {...}} }
  //      ├─ wallet { ... }
  //      └─ links { telegram {...}, website {...} }
  await set(userRef, {
    profile: {
      email: email,
      name: name,
      uid: uid,
      createdAt: now,
      lastLogin: now
    },

    dashboard: {
      dailyEarning: 0,
      dailyCPM: 0,
      totalEarning: 0,
      totalImpressions: 0,
      overallCPM: 0,
      withdrawnAmount: 0,
      daily: dailyMap
    },

    wallet: {
      currentBalance: 0,
      pendingBalance: 0,
      totalWithdrawn: 0,
      withdrawalRequests: []
    },

    links: {
      telegram: {
        totalLinks: 0,
        activeLinks: 0,
        totalClicks: 0,
        list: []
      },
      website: {
        totalLinks: 0,
        activeLinks: 0,
        totalClicks: 0,
        list: []
      }
    }
  });

  console.log('✅ User node created in RTDB:', emailKey);
}

// Ensure user node exists (for login - creates if missing, updates lastLogin if exists)
// Same behavior as HTML ensureFullUserDoc
export async function ensureUserNode(user) {
  const email = user.email;
  if (!email) {
    console.warn('⚠️ No email found for user');
    return "existing";
  }

  const ek = emailToKey(email);
  const userRef = ref(db, "users/" + ek);
  const snap = await get(userRef);
  const now = Date.now();

  // If node doesn't exist, create full structure (same as signup)
  if (!snap.exists()) {
    console.log('📝 User node not found, creating full structure...');
    await createUserNode(user, user.displayName || email.split('@')[0] || email);
    return "new";
  }

  // Node exists - update lastLogin and ensure all required sections exist
  const data = snap.val() || {};
  const updates = {};

  // Update lastLogin
  if (data.profile) {
    updates["profile/lastLogin"] = now;
  } else {
    // Profile missing - create it
    updates["profile"] = {
      email: email,
      name: user.displayName || email.split('@')[0] || email,
      uid: user.uid,
      createdAt: data.profile?.createdAt || now,
      lastLogin: now
    };
  }

  // Ensure dashboard exists
  if (!data.dashboard) {
    updates["dashboard"] = {
      dailyEarning: 0,
      dailyCPM: 0,
      totalEarning: 0,
      totalImpressions: 0,
      overallCPM: 0,
      withdrawnAmount: 0,
      daily: buildDailyMap(90)
    };
  }

  // Ensure wallet exists
  if (!data.wallet) {
    updates["wallet"] = {
      currentBalance: 0,
      pendingBalance: 0,
      totalWithdrawn: 0,
      withdrawalRequests: []
    };
  }

  // Ensure links exists
  if (!data.links) {
    updates["links"] = {
      telegram: {
        totalLinks: 0,
        activeLinks: 0,
        totalClicks: 0,
        list: []
      },
      website: {
        totalLinks: 0,
        activeLinks: 0,
        totalClicks: 0,
        list: []
      }
    };
  }

  // Apply updates if any
  if (Object.keys(updates).length > 0) {
    await update(userRef, updates);
    console.log('✅ User node updated in RTDB');
  } else {
    console.log('✅ User node already exists and is complete');
  }

  return "existing";
}

// Extract code from URL (/s/<id> pattern)
export function extractCodeFromUrl(url) {
  const match = url.match(/\/s\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Update global allLinks/<code> node
export async function updateGlobalAllLinks(code, longUrl, shortUrl, emailKey) {
  const globalRef = ref(db, "allLinks/" + code);
  const snap = await get(globalRef);
  const now = Date.now();
  const base = {
    code,
    originalUrl: longUrl,
    shortUrl: shortUrl,
    firstCreatedAt: now
  };

  if (!snap.exists()) {
    const obj = {
      ...base,
      createdAt: now,
      lastUsedAt: now,
      totalUses: 1,
      users: {
        [emailKey]: true
      }
    };
    await set(globalRef, obj);
  } else {
    const data = snap.val() || {};
    const total = (data.totalUses || 0) + 1;

    const updates = {
      lastUsedAt: now,
      totalUses: total
    };
    updates["users/" + emailKey] = true;

    await update(globalRef, updates);
  }
}

// Save web link (user-wise + global with dedupe)
export async function saveWebLink(emailKey, email, longUrl, code, shortUrl) {
  const now = Date.now();
  const dateISO = new Date(now).toISOString().slice(0, 10);

  const listRef = ref(db, "users/" + emailKey + "/links/website/list");
  const metaRef = ref(db, "users/" + emailKey + "/links/website");

  // Check if code already exists for user
  const listSnap = await get(listRef);
  if (listSnap.exists()) {
    const data = listSnap.val() || {};
    const values = Object.values(data);
    const existing = values.find(it => it.code === code);

    if (existing) {
      await updateGlobalAllLinks(code, existing.originalUrl, existing.shortUrl, emailKey);
      return {
        item: existing,
        alreadyExists: true
      };
    }
  }

  // Create new item
  const newRef = push(listRef);
  const item = {
    id: newRef.key,
    createdAt: now,
    date: dateISO,
    originalUrl: longUrl,
    shortUrl: shortUrl,
    code: code,
    source: "website",
    clicks: 0,
    active: true,
    emailKey: emailKey,
    email: email
  };

  await set(newRef, item);

  // Update meta counts
  const metaSnap = await get(metaRef);
  const meta = metaSnap.exists() ? metaSnap.val() : {};
  const totalLinks = (meta.totalLinks || 0) + 1;
  const activeLinks = (meta.activeLinks || 0) + 1;

  await update(metaRef, {
    totalLinks,
    activeLinks,
    totalClicks: meta.totalClicks || 0
  });

  // Update global allLinks
  await updateGlobalAllLinks(code, longUrl, shortUrl, emailKey);

  return {
    item,
    alreadyExists: false
  };
}

// Generate referral code from email + index
export function generateReferralCode(email, index) {
  const hash = (email + index).split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return Math.abs(hash).toString(36).substring(0, 8).toUpperCase();
}

// Build 10 days daily map for referral
export function buildDailyMap10Days() {
  const out = {};
  const base = new Date();

  for (let i = -9; i <= 0; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    out[key] = {
      impressions: 0,
      cpm: 0,
      earning: 0
    };
  }
  return out;
}
