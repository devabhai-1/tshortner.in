import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { emailToKey, formatMoney, formatNumber, formatDateLabel } from '../firebase/utils';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Partnership.module.css';

function PartnershipDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { linkId } = useParams();
  const location = useLocation();
  const { code, referralCode } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (user?.email && linkId) {
      loadDashboardData();
    }
  }, [user, linkId]);

  const loadDashboardData = async () => {
    setLoading(true);
    setNote("Loading dashboard data...");

    try {
      const emailKey = emailToKey(user.email);
      const referralRef = ref(db, `users/${emailKey}/partnership/links/${linkId}/daily`);
      const snap = await get(referralRef);

      if (!snap.exists()) {
        setNote("Abhi tak koi daily data nahi hai.");
        setDashboardData([]);
        setLoading(false);
        return;
      }

      const dailyMap = snap.val() || {};
      const entries = Object.entries(dailyMap);

      if (entries.length === 0) {
        setNote("Abhi tak koi daily stats nahi hain.");
        setDashboardData([]);
        setLoading(false);
        return;
      }

      // Sort desc by date
      entries.sort((a, b) => (a[0] < b[0] ? 1 : -1));
      
      // Show all days (or limit to 30 days)
      setDashboardData(entries.slice(0, 30));
      setNote(`Latest ${Math.min(entries.length, 30)} days data loaded.`);
      
    } catch (err) {
      console.error(err);
      setNote("Dashboard load karte waqt error: " + (err.code || err.message));
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  return (
    <Layout activeNav="partnership">
      <div className={styles.mainInner}>
        <div className={styles.pageTitle}>
          <div>
            <h1>Referral Dashboard - {referralCode || code || linkId?.substring(0, 6)}</h1>
            <p>Daily stats aur earnings ka detailed view.</p>
          </div>
          <button 
            className={styles.btnPrimary}
            onClick={() => navigate('/partnership/manage')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            ← Back to Partnership
          </button>
        </div>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Daily Statistics</h2>
              <p>Har din ke impressions, CPM, aur earnings ka record.</p>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Impressions</th>
                  <th>CPM ($)</th>
                  <th>Earning ($)</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-soft)' }}>
                      No data available yet.
                    </td>
                  </tr>
                ) : (
                  dashboardData.map(([dateKey, obj]) => (
                    <tr key={dateKey}>
                      <td>{formatDateLabel(dateKey)}</td>
                      <td>{formatNumber(obj.impressions)}</td>
                      <td>{formatMoney(obj.cpm)}</td>
                      <td className={obj.earning > 0 ? styles.textGreen : ''}>
                        {formatMoney(obj.earning)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {note && <p className={styles.note}>{note}</p>}
        </section>
      </div>
    </Layout>
  );
}

export default PartnershipDashboard;
