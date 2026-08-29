import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
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

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [profileChecked, setProfileChecked] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
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

  const needsTelegram = profileChecked && !telegramUsername;

  const showWelcomeNotice = !welcomeDismissed;

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

  const handleDismissWelcome = useCallback(() => {
    setWelcomeDismissed(true);
  }, []);

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
        showWelcomeNotice={showWelcomeNotice}
        onDismissWelcome={handleDismissWelcome}
      />
      <div className={styles.mainInner + (needsTelegram ? ' ' + styles.mainBlocked : '')}>
        {/* Title */}
        <div className={styles.pageTitle}>
          <div>
            <h1>Dashboard</h1>
            <p>Daily stats + overall earning ka clean overview.</p>
          </div>
        </div>

        <aside className={styles.siteNotice} role="status">
          <div className={styles.siteNoticeHead}>
            <span aria-hidden>●</span>
            <strong>TShortner is live</strong>
          </div>
          <p>
            Panel ready hai. Pehla short link{' '}
            <Link to="/links">Links</Link> se banao, traffic share karo, phir earning yahan
            dikhegi. Withdraw{' '}
            <Link to="/wallet">Wallet</Link> se ($10 min).
          </p>
        </aside>

        {error && <div className={styles.error}>{error}</div>}

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
                <span>Roz ka data: impressions, daily CPM & daily earning.</span>
              </div>
              <span className={styles.badge}>Timezone: IST · Currency: USD</span>
            </div>

            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Impressions</th>
                    <th>Daily CPM ($)</th>
                    <th>Daily Earning ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className={styles.emptyTableCell}>
                        <div className={styles.guidedEmpty}>
                          <p className={styles.guidedEmptyTitle}>Abhi koi daily row nahi</p>
                          <p className={styles.guidedEmptyText}>
                            Pehli impressions aate hi date-wise CPM aur earning yahan list hogi.
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
                    dailyData.map(([dateKey, obj]) => (
                      <tr key={dateKey}>
                        <td>{formatDateLabel(dateKey)}</td>
                        <td>{formatNumber(obj.impressions || 0)}</td>
                        <td>{formatMoney(obj.cpm || 0)}</td>
                        <td className={(obj.earning || 0) > 0 ? styles.textGreen : ''}>
                          {formatMoney(obj.earning || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className={styles.note}>
              {dailyData.length > 0
                ? `Data loaded from your panel (last ${dailyData.length} days).`
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
                    ['Date', 'Impressions', 'Daily CPM ($)', 'Daily Earning ($)'],
                    ...dailyData.map(([dateKey, obj]) => [
                      formatDateLabel(dateKey),
                      obj.impressions || 0,
                      obj.cpm || 0,
                      obj.earning || 0
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                disabled={dailyData.length === 0}
              >
                📥 Export CSV
              </button>
              <button 
                className={styles.optionBtn}
                onClick={async () => {
                  setCopyFeedback('');
                  try {
                    const text = dailyData.map(([dateKey, obj]) => 
                      `${formatDateLabel(dateKey)} | Impressions: ${formatNumber(obj.impressions || 0)} | CPM: $${formatMoney(obj.cpm || 0)} | Earning: $${formatMoney(obj.earning || 0)}`
                    ).join('\n');
                    await navigator.clipboard.writeText(text);
                    setCopyFeedback('Copied!');
                    setTimeout(() => setCopyFeedback(''), 2000);
                  } catch (e) {
                    setCopyFeedback('Copy failed');
                    setTimeout(() => setCopyFeedback(''), 3000);
                  }
                }}
                disabled={dailyData.length === 0}
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
