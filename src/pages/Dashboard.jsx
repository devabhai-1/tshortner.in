import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { emailToKey, formatMoney, formatNumber, formatDateLabel } from '../firebase/utils';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
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
          setLoading(false);
          return;
        }

        const data = snap.val() || {};
        const profile = data.profile || {};
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
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Layout activeNav="dashboard">
      {/* Announcement Banner */}
      <div className={styles.announcementBanner}>
        <div className={styles.announcementContent}>
          <span className={styles.announcementIcon}>📢</span>
          <div className={styles.announcementText}>
            <strong>Important Update:</strong> Apne dashboard me latest features aur improvements check karein. Agar koi issue ho to support se contact karein.
          </div>
          <button 
            className={styles.announcementClose}
            onClick={() => {
              const banner = document.querySelector(`.${styles.announcementBanner}`);
              if (banner) banner.style.display = 'none';
            }}
            aria-label="Close announcement"
          >
            ×
          </button>
        </div>
      </div>

      <div className={styles.mainInner}>
        {/* Title */}
        <div className={styles.pageTitle}>
          <div>
            <h1>Dashboard</h1>
            <p>Daily stats + overall earning ka clean overview.</p>
          </div>
          <div className={styles.tagSmall}>
            <span className={styles.tagDot}></span>
            <span>Live · Panel Data (USD)</span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* TOP STATS (6 CARDS) */}
        <section className={styles.statsGrid}>
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

        {/* CHART SECTION - Last 10 Days */}
        {dailyData.length > 0 && (
          <section>
            <div className={styles.card}>
              <div className={styles.sectionTitle}>
                <div>
                  <h2>Performance Chart (Last 10 Days)</h2>
                  <span>Daily earnings aur impressions ka visual overview.</span>
                </div>
                <span className={styles.badge}>Last 10 Days</span>
              </div>

              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={isMobile ? 320 : 400}>
                  <ComposedChart
                    data={dailyData.slice(0, 10).reverse().map(([dateKey, obj]) => {
                      const dateLabel = formatDateLabel(dateKey).split(' ')[0];
                      let displayDate = dateLabel;
                      if (isMobile && dateLabel.includes(' ')) {
                        const parts = dateLabel.split(' ');
                        displayDate = parts.length >= 2 ? `${parts[0]} ${parts[1].substring(0, 3)}` : dateLabel.substring(0, 6);
                      }
                      return {
                        date: displayDate,
                        earning: parseFloat(obj.earning || 0),
                        impressions: parseFloat(obj.impressions || 0) / 1000,
                      };
                    })}
                    margin={{ 
                      top: 10, 
                      right: isMobile ? 5 : 10, 
                      left: isMobile ? 0 : 0, 
                      bottom: isMobile ? 30 : 15 
                    }}
                  >
                    <defs>
                      <linearGradient id="earningGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-soft)"
                      tick={{ 
                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                        fill: 'var(--text-soft)',
                        fontWeight: 500
                      }}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 60 : 40}
                      axisLine={{ stroke: 'var(--border-soft)' }}
                      tickLine={{ stroke: 'var(--border-soft)' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="var(--text-soft)"
                      tick={{ 
                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                        fill: 'var(--text-soft)',
                        fontWeight: 500
                      }}
                      width={isMobile ? 50 : 60}
                      axisLine={{ stroke: 'var(--border-soft)' }}
                      tickLine={{ stroke: 'var(--border-soft)' }}
                      domain={['auto', 'auto']}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="var(--text-soft)"
                      tick={{ 
                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                        fill: 'var(--text-soft)',
                        fontWeight: 500
                      }}
                      width={isMobile ? 45 : 60}
                      axisLine={{ stroke: 'var(--border-soft)' }}
                      tickLine={{ stroke: 'var(--border-soft)' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        border: '2px solid var(--border-soft)',
                        borderRadius: '0.75rem',
                        color: 'var(--text-main)',
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        padding: isMobile ? '0.6rem' : '0.75rem',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                      }}
                      wrapperStyle={{
                        fontSize: isMobile ? '0.75rem' : '0.85rem'
                      }}
                      cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        paddingTop: isMobile ? '0.75rem' : '1.25rem',
                        fontWeight: 600
                      }}
                      iconSize={isMobile ? 12 : 14}
                      iconType="rect"
                    />
                    {/* Area chart for Earning - Trading style */}
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="earning" 
                      fill="url(#earningGradient)"
                      stroke="#22c55e" 
                      strokeWidth={isMobile ? 2 : 2.5}
                      name="Earning ($)"
                      activeDot={{ r: isMobile ? 6 : 8, fill: '#22c55e', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                    {/* Line chart for Impressions - Trading style */}
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="impressions" 
                      stroke="#60a5fa" 
                      strokeWidth={isMobile ? 2 : 2.5}
                      dot={false}
                      activeDot={{ r: isMobile ? 6 : 8, fill: '#60a5fa', stroke: '#ffffff', strokeWidth: 2 }}
                      name="Impressions (K)"
                    />
                    {/* Reference line for zero earning */}
                    <ReferenceLine yAxisId="left" y={0} stroke="var(--border-soft)" strokeDasharray="2 2" opacity={0.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <p className={styles.note}>
                Chart me last 10 din ka daily earning (USD) aur impressions (thousands me) dikhaya gaya hai.
              </p>
            </div>
          </section>
        )}

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
                      <td colSpan="4" className={styles.textSoft}>
                        Abhi daily stats empty hain. Jaise hi impressions/earning aayegi, yaha show hoga.
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
                : 'Abhi daily stats empty hain. Jaise hi impressions/earning aayegi, yaha show hoga.'}
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
                onClick={() => {
                  const text = dailyData.map(([dateKey, obj]) => 
                    `${formatDateLabel(dateKey)} | Impressions: ${formatNumber(obj.impressions || 0)} | CPM: $${formatMoney(obj.cpm || 0)} | Earning: $${formatMoney(obj.earning || 0)}`
                  ).join('\n');
                  
                  navigator.clipboard.writeText(text).then(() => {
                    alert('Data copied to clipboard!');
                  });
                }}
                disabled={dailyData.length === 0}
              >
                📋 Copy Data
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
              <Link to="/partnership/manage" className={styles.navLinkBtn}>
                <span className={styles.navLinkIcon}>🤝</span>
                <span className={styles.navLinkText}>Partnership</span>
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
