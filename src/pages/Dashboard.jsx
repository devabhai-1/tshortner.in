import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ref, get, set, update, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { emailToKey, formatMoney, formatNumber, formatDateLabel } from '../firebase/utils';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardGateModals from '../components/DashboardGateModals';
import styles from './Dashboard.module.css';

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <div className={styles.tooltipHeader}>
          <span className={styles.tooltipIcon}>📅</span>
          <span className={styles.tooltipDate}>{label}</span>
        </div>
        <div className={styles.tooltipDivider} />
        <div className={styles.tooltipBody}>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className={styles.tooltipRow}>
              <div className={styles.tooltipLeft}>
                <span className={styles.tooltipDot} style={{ backgroundColor: entry.color }}></span>
                <span className={styles.tooltipName}>
                  {entry.dataKey === 'earning' ? 'Daily Earning' : 'Impressions'}
                </span>
              </div>
              <span className={styles.tooltipValue} style={{ color: entry.color }}>
                {entry.dataKey === 'earning' 
                  ? `$${Number(entry.value).toFixed(2)}` 
                  : `${(Number(entry.value) * 1000).toLocaleString()} views`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function kolkataDaysAgo(n) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()).split('-').map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  date.setUTCDate(date.getUTCDate() - n);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const COUNTRY_RANGES = [
  { id: '1', label: 'Aaj', days: 1 },
  { id: '7', label: '7 days', days: 7 },
  { id: '30', label: '30 days', days: 30 },
];

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [profileChecked, setProfileChecked] = useState(false);
  const [stats, setStats] = useState({
    dailyEarning: 0,
    dailyCPM: 0,
    totalEarning: 0,
    totalImpressions: 0,
    overallCPM: 0,
    withdrawnAmount: 0
  });
  const [dailyData, setDailyData] = useState([]);
  const [yesterdayEarning, setYesterdayEarning] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [countryRange, setCountryRange] = useState('1');
  const [topCountries, setTopCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [planEnabled, setPlanEnabled] = useState(false);
  const [planUrl, setPlanUrl] = useState('');
  const [planSaving, setPlanSaving] = useState(false);
  const [planNote, setPlanNote] = useState('');
  const [filterClicks, setFilterClicks] = useState({
    total: 0,
    daily: 0,
    updatedAt: 0,
    byDay: {},
  });
  const [filterClickPulse, setFilterClickPulse] = useState(false);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.email) return;

      try {
        const email = user.email;
        const emailKey = emailToKey(email);

        const userRef = ref(db, 'users/' + emailKey);
        const snap = await get(userRef);

        if (!snap.exists()) {
          setError('Database node nahi mila. Pehle signup page se user create hua hona chahiye.');
          setProfileChecked(true);
          setLoading(false);
          return;
        }

        const data = snap.val() || {};
        const profile = data.profile || {};
        const savedTg = String(profile.telegramUsername || '').trim();
        setTelegramUsername(savedTg);
        setProfileChecked(true);
        const plan = data.filterPlan || {};
        setPlanEnabled(!!plan.enabled);
        setPlanUrl(String(plan.url || plan.link || ''));
        const dash = data.dashboard || {};
        const wallet = data.wallet || {};
        const dailyMap = dash.daily || {};

        // Set stats (EXACT same as HTML)
        setStats({
          dailyEarning: dash.dailyEarning || 0,
          dailyCPM: dash.dailyCPM || 0,
          totalEarning: dash.totalEarning || 0,
          totalImpressions: dash.totalImpressions || 0,
          overallCPM: dash.overallCPM || 0,
          withdrawnAmount: dash.withdrawnAmount || wallet.totalWithdrawn || 0
        });

        // Process daily data (EXACT same as HTML)
        const entries = Object.entries(dailyMap);
        if (entries.length) {
          // Sort desc by date key (latest upar) - same as HTML
          entries.sort((a, b) => (a[0] < b[0] ? 1 : -1));
          
          // Maximum 90 entries (same as HTML)
          const list = entries.slice(0, 90);
          setDailyData(list);

          // Yesterday earning (2nd entry agar hai) - same as HTML
          if (list.length > 1) {
            setYesterdayEarning(list[1][1].earning || 0);
          } else {
            setYesterdayEarning(0);
          }
        } else {
          setDailyData([]);
          setYesterdayEarning(0);
        }

        console.log('✅ Dashboard data loaded from RTDB');
        setLoading(false);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Dashboard load karte waqt error: ' + (err.code || err.message));
        setProfileChecked(true);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Live /t/ clicks only (filter bot short links) — not /x or /v
  useEffect(() => {
    if (!user?.email) return undefined;
    const emailKey = emailToKey(user.email);
    const clicksRef = ref(db, `users/${emailKey}/filterClicks`);
    let lastTotal = -1;
    const unsub = onValue(clicksRef, (snap) => {
      const v = snap.val() || {};
      const today = kolkataDaysAgo(0);
      const byDay = v.daily && typeof v.daily === 'object' ? v.daily : {};
      const total = Number(v.total) || 0;
      const daily = Number(byDay[today]) || 0;
      setFilterClicks({
        total,
        daily,
        updatedAt: Number(v.updatedAt) || 0,
        byDay,
      });
      if (lastTotal >= 0 && total > lastTotal) {
        setFilterClickPulse(true);
        window.setTimeout(() => setFilterClickPulse(false), 900);
      }
      lastTotal = total;
    });
    return () => unsub();
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return undefined;
    const emailKey = emailToKey(user.email);
    const days = COUNTRY_RANGES.find((item) => item.id === countryRange)?.days || 1;
    let stop = false;
    setCountriesLoading(true);
    (async () => {
      try {
        const dates = Array.from({ length: days }, (_, index) => kolkataDaysAgo(index));
        const snaps = await Promise.all(
          dates.map((day) => get(ref(db, `realtimeTraffic/days/${day}/emails/${emailKey}/byCountry`))),
        );
        const totals = new Map();
        snaps.forEach((snap) => {
          const node = snap.val();
          if (!node || typeof node !== 'object') return;
          Object.entries(node).forEach(([code, row]) => {
            if (!row || typeof row !== 'object') return;
            const hits = Number(row.hits) || 0;
            if (!hits) return;
            const current = totals.get(code) || { code, name: row.country || row.name || code, hits: 0 };
            current.hits += hits;
            current.name = row.country || row.name || current.name;
            totals.set(code, current);
          });
        });
        const sum = Array.from(totals.values()).reduce((total, row) => total + row.hits, 0);
        const ranked = Array.from(totals.values())
          .sort((a, b) => b.hits - a.hits)
          .slice(0, 7)
          .map((row) => ({
            code: row.code,
            name: row.name,
            pct: sum ? Math.round((row.hits / sum) * 1000) / 10 : 0,
          }));
        if (!stop) setTopCountries(ranked);
      } catch (err) {
        console.error('Country share load error:', err);
        if (!stop) setTopCountries([]);
      } finally {
        if (!stop) setCountriesLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, [user, countryRange]);

  const needsTelegram = profileChecked && !telegramUsername;


  const handleSaveTelegram = useCallback(
    async (username) => {
      if (!user?.email) throw new Error('Login required');
      const emailKey = emailToKey(user.email);
      const now = Date.now();
      await update(ref(db, `users/${emailKey}/profile`), {
        telegramUsername: username,
        telegramUsernameAt: now,
      });
      setTelegramUsername(username);
    },
    [user],
  );

  // Last 90 days: earning rows + live /t/ clicks by date
  const dailyPerformanceRows = useMemo(() => {
    const map = new Map();
    dailyData.forEach(([dateKey, obj]) => {
      map.set(dateKey, {
        dateKey,
        impressions: Number(obj?.impressions) || 0,
        cpm: Number(obj?.cpm) || 0,
        earning: Number(obj?.earning) || 0,
        clicks: 0,
      });
    });
    Object.entries(filterClicks.byDay || {}).forEach(([dateKey, n]) => {
      const clicks = Number(n) || 0;
      if (!clicks || !dateKey) return;
      const prev = map.get(dateKey) || {
        dateKey,
        impressions: 0,
        cpm: 0,
        earning: 0,
        clicks: 0,
      };
      prev.clicks = clicks;
      map.set(dateKey, prev);
    });
    return Array.from(map.values())
      .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
      .slice(0, 90);
  }, [dailyData, filterClicks.byDay]);

  const chartDataLast10 = useMemo(() => {
    if (!dailyData.length) return [];
    const last10 = dailyData.slice(0, 10).reverse();
    return last10.map(([dateKey, obj]) => {
      const full = formatDateLabel(dateKey);
      const parts = full.split(' ');
      const label = parts.length >= 2 ? `${parts[0]} ${parts[1]}` : full;
      return {
        date: label,
        dateKey,
        earning: parseFloat(obj.earning || 0),
        impressions: parseFloat(obj.impressions || 0) / 1000,
      };
    });
  }, [dailyData]);

  const chartStats10 = useMemo(() => {
    if (!chartDataLast10.length) return { peakEarning: 0, peakViews: 0, total10Earning: 0 };
    let peakE = 0;
    let peakV = 0;
    let totE = 0;
    chartDataLast10.forEach(item => {
      if (item.earning > peakE) peakE = item.earning;
      if (item.impressions > peakV) peakV = item.impressions;
      totE += item.earning;
    });
    return { peakEarning: peakE, peakViews: peakV * 1000, total10Earning: totE };
  }, [chartDataLast10]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Layout activeNav="dashboard">
      <DashboardGateModals
        needsTelegram={needsTelegram}
        telegramUsername={telegramUsername}
        onSaveTelegram={handleSaveTelegram}
      />
      <div className={`${styles.mainInner} pageEnter${needsTelegram ? ` ${styles.mainBlocked}` : ''}`}>
        <div className={styles.pageTitle}>
          <div>
            <p className={styles.pageEyebrow}>Overview</p>
            <h1>Dashboard</h1>
            <p>Live stats, routing, aur earning — ek clean view.</p>
          </div>
        </div>

        <aside className={styles.siteNotice} role="status">
          <div className={styles.siteNoticeHead}>
            <span className={styles.siteNoticeDot} aria-hidden />
            <strong>Panel live</strong>
          </div>
          <p>
            Pehla short link <Link to="/links">Links</Link> se banao, traffic share karo —
            earning yahan dikhegi. Withdraw <Link to="/wallet">Wallet</Link> se ($10 min).
          </p>
        </aside>

        {error && <div className={styles.error}>{error}</div>}

        {/* First-visit plan link — Filter Bot / open.tshortner /t /x */}
        <section className={styles.planCard} aria-labelledby="plan-heading">
          <div className={styles.planTop}>
            <div className={styles.planIdentity}>
              <div className={styles.planIcon} aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4.93"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 19.07"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className={styles.planEyebrow}>Traffic routing</p>
                <h2 id="plan-heading">First-visit plan link</h2>
                <p className={styles.planLead}>
                  Naye visitor ko aapka offer open hota hai. Returning IP pe short link
                  normal flow (/t original · /x player) follow karti hai.
                </p>
              </div>
            </div>
            <div className={styles.planSwitchWrap}>
              <span
                className={planEnabled ? styles.planBadgeOn : styles.planBadgeOff}
                aria-live="polite"
              >
                {planEnabled ? 'Active' : 'Off'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={planEnabled}
                aria-label="Enable first-visit plan"
                className={`${styles.planSwitch}${planEnabled ? ` ${styles.planSwitchOn}` : ''}`}
                onClick={() => setPlanEnabled((v) => !v)}
              >
                <span className={styles.planSwitchKnob} />
              </button>
            </div>
          </div>

          <ol className={styles.planFlow} aria-label="How routing works">
            <li>
              <span className={styles.planFlowNum}>1</span>
              <div>
                <strong>New IP</strong>
                <span>Plan link open</span>
              </div>
            </li>
            <li className={styles.planFlowArrow} aria-hidden>
              →
            </li>
            <li>
              <span className={styles.planFlowNum}>2</span>
              <div>
                <strong>Known IP</strong>
                <span>/t or /x normal</span>
              </div>
            </li>
            <li className={styles.planFlowArrow} aria-hidden>
              →
            </li>
            <li>
              <span className={styles.planFlowNum}>3</span>
              <div>
                <strong>You earn</strong>
                <span>Stats update</span>
              </div>
            </li>
          </ol>

          <form
            className={styles.planForm}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!user?.email) return;
              setPlanSaving(true);
              setPlanNote('');
              const urlVal = planUrl.trim();
              if (planEnabled && !/^https?:\/\//i.test(urlVal)) {
                setPlanNote('Enable ke liye valid http(s) URL chahiye.');
                setPlanSaving(false);
                return;
              }
              try {
                const emailKey = emailToKey(user.email);
                await set(ref(db, 'users/' + emailKey + '/filterPlan'), {
                  enabled: !!planEnabled,
                  url: urlVal,
                  updatedAt: Date.now(),
                });
                setPlanNote('Plan saved.');
              } catch (err) {
                console.error(err);
                setPlanNote('Save error: ' + (err.code || err.message));
              }
              setPlanSaving(false);
            }}
          >
            <label className={styles.planField}>
              <span>Destination URL</span>
              <div className={styles.planUrlRow}>
                <input
                  type="url"
                  placeholder="https://your-offer.com/landing"
                  value={planUrl}
                  onChange={(e) => setPlanUrl(e.target.value)}
                  aria-label="New user plan URL"
                  autoComplete="url"
                />
                <button
                  type="button"
                  className={styles.planCopyBtn}
                  disabled={!planUrl.trim()}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(planUrl.trim());
                      setPlanNote('Link copied.');
                    } catch {
                      setPlanNote('Copy fail.');
                    }
                  }}
                >
                  Copy
                </button>
              </div>
            </label>
            <div className={styles.planActions}>
              <button type="submit" className={styles.planSaveBtn} disabled={planSaving}>
                {planSaving ? 'Saving…' : 'Save plan'}
              </button>
              {planNote ? (
                <span className={planNote.includes('saved') || planNote.includes('copied') ? styles.planOk : styles.planErr}>
                  {planNote}
                </span>
              ) : (
                <span className={styles.planHint}>Toggle on + valid URL, phir save.</span>
              )}
            </div>
          </form>
        </section>

        {/* /t/ clicks — filter bot only (live) */}
        <section
          className={`${styles.tClicksCard}${filterClickPulse ? ` ${styles.tClicksPulse}` : ''}`}
          aria-labelledby="t-clicks-heading"
        >
          <div className={styles.tClicksHead}>
            <div>
              <p className={styles.planEyebrow}>Filter bot · /t/ only</p>
              <h2 id="t-clicks-heading">Short link clicks</h2>
              <p className={styles.tClicksLead}>
                Sirf <code>/t/</code> visits count hote hain — live update. /x aur /v yahan
                nahi dikhte.
              </p>
            </div>
            <span className={styles.tClicksLive} aria-live="polite">
              <span className={styles.tClicksLiveDot} aria-hidden />
              Live
            </span>
          </div>
          <div className={styles.tClicksGrid}>
            <div className={styles.tClicksStat}>
              <span className={styles.tClicksLabel}>Today</span>
              <strong className={styles.tClicksValue}>{formatNumber(filterClicks.daily)}</strong>
              <span className={styles.tClicksSub}>Daily /t/ clicks (IST)</span>
            </div>
            <div className={styles.tClicksStat}>
              <span className={styles.tClicksLabel}>All time</span>
              <strong className={styles.tClicksValue}>{formatNumber(filterClicks.total)}</strong>
              <span className={styles.tClicksSub}>Total /t/ clicks</span>
            </div>
          </div>
          <p className={styles.tClicksFoot}>
            Date-wise clicks neeche <strong>Daily Performance (90 days)</strong> table me live
            update hote rehte hain.
          </p>
        </section>

        {/* TOP STATS (6 CARDS) */}
        <section className={`${styles.statsGrid} ${styles.statsEnter}`}>
          {/* Daily Earning */}
          <div className={`${styles.card} ${styles.highlightCard}`}>
            <div className={styles.highlightBg}></div>
            <div className={styles.highlightInner}>
              <div className={styles.statLabel}>
                <span>Daily Earning</span>
                <span className={`${styles.badge} ${styles.badgeGreen}`}>Today</span>
              </div>
              <div className={styles.statValue}>$ {formatMoney(stats.dailyEarning)}</div>
              <div className={styles.statSub}>Yesterday: $ {formatMoney(yesterdayEarning)}</div>
              <div className={styles.hint}>Aaj ka total earning (00:00 se abhi tak), USD me.</div>
            </div>
          </div>

          {/* Daily CPM */}
          <div className={styles.card}>
            <div className={styles.statLabel}>
              <span>Daily CPM</span>
            </div>
            <div className={styles.statValue}>$ {formatMoney(stats.dailyCPM)}</div>
            <div className={styles.statSub}>Aaj ka average CPM per 1000 impressions.</div>
          </div>

          {/* Total Earning */}
          <div className={styles.card}>
            <div className={styles.statLabel}>
              <span>Total Earning</span>
            </div>
            <div className={styles.statValue}>$ {formatMoney(stats.totalEarning)}</div>
            <div className={styles.statSub}>Panel start hone se ab tak ka total (lifetime).</div>
          </div>

          {/* Total Impressions */}
          <div className={styles.card}>
            <div className={styles.statLabel}>
              <span>Total Impressions</span>
            </div>
            <div className={styles.statValue}>{formatNumber(stats.totalImpressions)}</div>
            <div className={styles.statSub}>Sabhi links ka lifetime view count.</div>
          </div>

          {/* Overall CPM */}
          <div className={styles.card}>
            <div className={styles.statLabel}>
              <span>Overall CPM</span>
            </div>
            <div className={styles.statValue}>$ {formatMoney(stats.overallCPM)}</div>
            <div className={styles.statSub}>Total earning / total impressions × 1000 (approx).</div>
          </div>

          {/* Withdrawn Amount */}
          <div className={styles.card}>
            <div className={styles.statLabel}>
              <span>Withdrawn Amount</span>
            </div>
            <div className={styles.statValue}>$ {formatMoney(stats.withdrawnAmount)}</div>
            <div className={styles.statSub}>Jo paisa already aapke account me ja chuka hai.</div>
          </div>
        </section>

        <section className={styles.countryCard}>
          <div className={styles.sectionTitle}>
            <div>
              <h2>Top countries</h2>
              <span>Sabse zyada traffic wale 7 desh. Sirf share %.</span>
            </div>
            <div className={styles.countryRanges} role="tablist">
              {COUNTRY_RANGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={countryRange === item.id ? styles.countryRangeActive : styles.countryRange}
                  onClick={() => setCountryRange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {countriesLoading ? <p className={styles.countryEmpty}>Load ho raha hai...</p> : null}
          {!countriesLoading && !topCountries.length ? (
            <p className={styles.countryEmpty}>Is period mein abhi country traffic nahi hai.</p>
          ) : null}
          {!countriesLoading && topCountries.length ? (
            <ol className={styles.countryList}>
              {topCountries.map((row, index) => (
                <li key={row.code}>
                  <span className={styles.countryRank}>{index + 1}</span>
                  <span className={styles.countryName}>{row.name}</span>
                  <span className={styles.countryTrack}>
                    <span style={{ width: `${Math.min(100, row.pct)}%` }} />
                  </span>
                  <strong>{row.pct}%</strong>
                </li>
              ))}
            </ol>
          ) : null}
        </section>

        {/* CHART SECTION - Last 10 Days (or guided placeholder when empty) */}
        <section className={styles.chartSection}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <div>
                <h2>Performance Analytics (Last 10 Days)</h2>
                <span>
                  {dailyData.length > 0
                    ? 'Real-time daily earnings & impressions analytics breakdown.'
                    : 'Yahan aapke last 10 din ka earning chart dikhega jab traffic start hoga.'}
                </span>
              </div>
              {dailyData.length > 0 ? (
                <span className={styles.badgeGreen}>Live 10-Day Metrics</span>
              ) : (
                <span className={styles.badge}>Waiting for data</span>
              )}
            </div>

            {dailyData.length > 0 ? (
              <>
                <div className={styles.chartHeaderStats}>
                  <div className={styles.statPill}>
                    <span className={styles.statPillLabel}>Peak Earning Day</span>
                    <span className={`${styles.statPillVal} ${styles.greenVal}`}>
                      ${formatMoney(chartStats10.peakEarning)}
                    </span>
                  </div>
                  <div className={styles.statPill}>
                    <span className={styles.statPillLabel}>Peak Impressions</span>
                    <span className={`${styles.statPillVal} ${styles.blueVal}`}>
                      {formatNumber(chartStats10.peakViews)}
                    </span>
                  </div>
                  <div className={styles.statPill}>
                    <span className={styles.statPillLabel}>10-Day Total Earning</span>
                    <span className={`${styles.statPillVal} ${styles.purpleVal}`}>
                      ${formatMoney(chartStats10.total10Earning)}
                    </span>
                  </div>
                </div>

                <div className={styles.chartWrapper}>
                  <ResponsiveContainer
                    width="100%"
                    height={isMobile ? 340 : 420}
                    minHeight={isMobile ? 340 : 420}
                  >
                    <ComposedChart
                      data={chartDataLast10}
                      margin={{ top: 20, right: 24, left: 0, bottom: isMobile ? 40 : 20 }}
                    >
                      <defs>
                        <linearGradient id="earningGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                          <stop offset="60%" stopColor="#059669" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#047857" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                          <stop offset="60%" stopColor="#1d4ed8" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#1e40af" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="var(--border-soft)"
                        opacity={0.18}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="var(--text-soft)"
                        tick={{
                          fontSize: isMobile ? 10 : 12,
                          fill: 'var(--text-soft)',
                          fontWeight: 600,
                        }}
                        axisLine={{ stroke: 'var(--border-soft)', opacity: 0.4 }}
                        tickLine={false}
                        interval={0}
                        tickMargin={10}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#10b981"
                        tick={{
                          fontSize: isMobile ? 10 : 11,
                          fill: '#10b981',
                          fontWeight: 600,
                        }}
                        width={48}
                        axisLine={false}
                        tickLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(v) => `$${Number(v).toFixed(1)}`}
                        allowDecimals={true}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#3b82f6"
                        tick={{
                          fontSize: isMobile ? 10 : 11,
                          fill: '#3b82f6',
                          fontWeight: 600,
                        }}
                        width={48}
                        axisLine={false}
                        tickLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(v) => `${Number(v).toFixed(1)}K`}
                        allowDecimals={true}
                      />
                      <Tooltip
                        content={<CustomChartTooltip />}
                        cursor={{
                          stroke: '#10b981',
                          strokeWidth: 1.5,
                          strokeDasharray: '4 4',
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: isMobile ? '0.78rem' : '0.88rem',
                          paddingTop: '1.2rem',
                          fontWeight: 700,
                        }}
                        iconSize={12}
                        iconType="circle"
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="earning"
                        fill="url(#earningGradient)"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Daily Earning ($)"
                        isAnimationActive={true}
                        animationDuration={600}
                        dot={{ r: 4, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 3 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="impressions"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 1.5 }}
                        name="Impressions (K)"
                        isAnimationActive={true}
                        animationDuration={600}
                        activeDot={{ r: 7, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <p className={styles.note}>
                  Chart me last 10 din ka daily earning (USD) aur impressions (thousands me) dikhaya
                  gaya hai.
                </p>
              </>
            ) : (
              <div className={styles.chartEmpty}>
                <div className={styles.chartEmptyGlow} aria-hidden />
                <div className={styles.chartEmptyInner}>
                  <p className={styles.chartEmptyTitle}>Analytics ready — waiting for traffic</p>
                  <p className={styles.chartEmptyText}>
                    Short link banao, share karo. Impressions aate hi yahan 10-day chart live ho
                    jayega.
                  </p>
                  <ol className={styles.guideSteps}>
                    <li>
                      <Link to="/links">Links</Link> par jaake web / Telegram short link banao
                    </li>
                    <li>Link ko apne audience ke saath share karo</li>
                    <li>Views + earning yahan auto update honge</li>
                  </ol>
                  <div className={styles.chartEmptyActions}>
                    <Link to="/links" className={styles.primaryCta}>
                      Create first link
                    </Link>
                    <Link to="/support/manage" className={styles.secondaryCta}>
                      Support / Telegram
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* DAILY BREAKDOWN */}
        <section>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <div>
                <h2>Daily Performance (Last 90 Days)</h2>
                <span>
                  Date-wise impressions, CPM, earning + live <code>/t/</code> clicks.
                </span>
              </div>
              <span className={styles.badge}>Timezone: IST · Currency: USD</span>
            </div>

            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clicks (/t/)</th>
                    <th>Impressions</th>
                    <th>Daily CPM ($)</th>
                    <th>Daily Earning ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyPerformanceRows.length === 0 ? (
                    <tr>
                      <td colSpan="5" className={styles.emptyTableCell}>
                        <div className={styles.guidedEmpty}>
                          <p className={styles.guidedEmptyTitle}>Abhi koi daily row nahi</p>
                          <p className={styles.guidedEmptyText}>
                            /t/ clicks ya impressions aate hi date-wise yahan list hogi.
                          </p>
                          <div className={styles.guideMini}>
                            <span>1. Create link</span>
                            <span>2. Share</span>
                            <span>3. Earn</span>
                          </div>
                          <Link to="/links" className={styles.primaryCta}>
                            Go to Links
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    dailyPerformanceRows.map((row) => (
                      <tr key={row.dateKey}>
                        <td>{formatDateLabel(row.dateKey)}</td>
                        <td className={row.clicks > 0 ? styles.textGreen : ''}>
                          {formatNumber(row.clicks)}
                        </td>
                        <td>{formatNumber(row.impressions)}</td>
                        <td>{formatMoney(row.cpm)}</td>
                        <td className={row.earning > 0 ? styles.textGreen : ''}>
                          {formatMoney(row.earning)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className={styles.note}>
              {dailyPerformanceRows.length > 0
                ? `Last ${dailyPerformanceRows.length} days · /t/ clicks live update.`
                : error
                  ? error
                  : 'Create link → share → earn. Stats auto fill honge.'}
            </p>

            {/* Options Below Table */}
            <div className={styles.tableOptions}>
              <button 
                className={styles.optionBtn}
                onClick={() => {
                  const csv = [
                    ['Date', 'Clicks (/t/)', 'Impressions', 'Daily CPM ($)', 'Daily Earning ($)'],
                    ...dailyPerformanceRows.map((row) => [
                      formatDateLabel(row.dateKey),
                      row.clicks,
                      row.impressions,
                      row.cpm,
                      row.earning,
                    ]),
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                disabled={dailyPerformanceRows.length === 0}
              >
                📥 Export CSV
              </button>
              <button 
                className={styles.optionBtn}
                onClick={async () => {
                  setCopyFeedback('');
                  try {
                    const text = dailyPerformanceRows.map((row) =>
                      `${formatDateLabel(row.dateKey)} | Clicks(/t/): ${formatNumber(row.clicks)} | Impressions: ${formatNumber(row.impressions)} | CPM: $${formatMoney(row.cpm)} | Earning: $${formatMoney(row.earning)}`
                    ).join('\n');
                    await navigator.clipboard.writeText(text);
                    setCopyFeedback('Copied!');
                    setTimeout(() => setCopyFeedback(''), 2000);
                  } catch (e) {
                    setCopyFeedback('Copy failed');
                    setTimeout(() => setCopyFeedback(''), 3000);
                  }
                }}
                disabled={dailyPerformanceRows.length === 0}
              >
                📋 Copy Data{copyFeedback ? ` — ${copyFeedback}` : ''}
              </button>
              <button 
                className={styles.optionBtn}
                onClick={() => window.print()}
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </section>

        {/* Navigation Links - Separate Box */}
        <section>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <div>
                <h2>Quick Navigation</h2>
                <span>Fast access to all dashboard sections.</span>
              </div>
            </div>

            <div className={styles.navLinksGrid}>
              <Link to="/links" className={styles.navLinkBtn}>
                <span className={styles.navLinkIcon}>🔗</span>
                <span className={styles.navLinkText}>Links</span>
              </Link>
              <Link to="/wallet" className={styles.navLinkBtn}>
                <span className={styles.navLinkIcon}>💰</span>
                <span className={styles.navLinkText}>Wallet</span>
              </Link>
              <Link to="/profile/manage" className={styles.navLinkBtn}>
                <span className={styles.navLinkIcon}>👤</span>
                <span className={styles.navLinkText}>Profile</span>
              </Link>
              <Link to="/support/manage" className={styles.navLinkBtn}>
                <span className={styles.navLinkIcon}>💬</span>
                <span className={styles.navLinkText}>Support</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
