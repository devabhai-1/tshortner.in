import { useState, useEffect } from 'react';
import { ref, get, set, push } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { emailToKey, generateReferralCode, buildDailyMap10Days, formatMoney, formatNumber, formatDateLabel } from '../firebase/utils';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Partnership.module.css';

function Partnership() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralLinks, setReferralLinks] = useState([]);
  
  // Form state
  const [percent, setPercent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [modalNote, setModalNote] = useState('');


  const loadReferralLinks = async (emailKey) => {
    const partnershipRef = ref(db, "users/" + emailKey + "/partnership");
    const snap = await get(partnershipRef);

    if (!snap.exists()) {
      setReferralLinks([]);
      return;
    }

    const data = snap.val() || {};
    const links = data.links || {};
    const entries = Object.entries(links);
    
    if (entries.length === 0) {
      setReferralLinks([]);
      return;
    }
    
    // Sort by createdAt (latest first) - EXACT same as HTML
    entries.sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));
    
    // Convert to array with ID
    const linksArray = entries.map(([id, data]) => ({
      id,
      ...data
    }));
    
    setReferralLinks(linksArray);
  };

  useEffect(() => {
    if (user?.email) {
      const emailKey = emailToKey(user.email);
      loadReferralLinks(emailKey).then(() => setLoading(false));
    }
  }, [user]);

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const percentVal = parseFloat(percent || "0");

    if (isNaN(percentVal) || percentVal < 0) {
      setError("Sahi percentage daalo.");
      return;
    }

    if (percentVal > 30) {
      setError("Maximum partnership percentage 30% hai.");
      return;
    }

    setSubmitting(true);

    try {
      const emailKey = emailToKey(user.email);
      const partnershipRef = ref(db, "users/" + emailKey + "/partnership");
      const snap = await get(partnershipRef);

      let partnershipData = snap.exists() ? snap.val() : {};
      if (!partnershipData.links) {
        partnershipData.links = {};
      }

      // Check max 5 links limit
      const existingLinks = Object.keys(partnershipData.links || {});
      if (existingLinks.length >= 5) {
        throw new Error("Maximum 5 referral links ban sakte hain. Pehle kisi link ko delete karo.");
      }

      // Generate new link
      const newLinkRef = push(ref(db, "users/" + emailKey + "/partnership/links"));
      const linkId = newLinkRef.key;
      const referralCode = generateReferralCode(user.email, existingLinks.length);
      
      // 10 days daily map (EXACT same as HTML - past 9 days + today)
      const dailyMap = buildDailyMap10Days();

      const linkData = {
        id: linkId,
        referralCode: referralCode,
        percentage: percentVal,
        signups: 0,
        maxSignups: 50,
        createdAt: Date.now(),
        daily: dailyMap
      };

      partnershipData.links[linkId] = linkData;
      await set(partnershipRef, partnershipData);

      setSuccess("Referral link successfully created!");
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      setPercent('');
      await loadReferralLinks(emailKey);
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Link create karte waqt error: " + (err.code || err.message));
    }

    setSubmitting(false);
  };

  const copyLink = (code) => {
    const link = `https://tshortner.in/signup-referral?ref=${code}`;
    navigator.clipboard.writeText(link).then(
      () => {
        setSuccess("Referral link copied to clipboard!");
        setTimeout(() => setSuccess(''), 3000);
      },
      () => alert("Copy nahi ho paya, manually copy karein.")
    );
  };

  const viewDashboard = async (linkId, code) => {
    setModalTitle(`Referral Dashboard - ${code}`);
    setModalData([]);
    setModalNote("Loading dashboard data...");
    setModalOpen(true);

    try {
      const emailKey = emailToKey(user.email);
      const referralRef = ref(db, `users/${emailKey}/partnership/links/${linkId}/daily`);
      const snap = await get(referralRef);

      if (!snap.exists()) {
        setModalNote("Abhi tak koi daily data nahi hai.");
        setModalData([]);
        return;
      }

      const dailyMap = snap.val() || {};
      const entries = Object.entries(dailyMap);

      if (entries.length === 0) {
        setModalNote("Abhi tak koi daily stats nahi hain.");
        setModalData([]);
        return;
      }

      // Sort desc by date
      entries.sort((a, b) => (a[0] < b[0] ? 1 : -1));
      
      // Show 10 days
      setModalData(entries.slice(0, 10));
      setModalNote(`Latest ${Math.min(entries.length, 10)} days data loaded.`);
      
    } catch (err) {
      console.error(err);
      setModalNote("Dashboard load karte waqt error: " + (err.code || err.message));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading partnership data..." />;
  }

  return (
    <Layout activeNav="partnership">
      <div className={styles.mainInner}>
        {/* Title */}
        <div className={styles.pageTitle}>
          <div>
            <h1>Partnership</h1>
            <p>Multiple referral links banao (max 5), har link ka apna dashboard aur 50 signups limit.</p>
          </div>
          <div className={styles.tagSmall}>
            <span className={styles.tagDot}></span>
            <span>Max 5 Links · 50 Signups per Link</span>
          </div>
        </div>

        {/* Create New Referral Link */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Create New Referral Link</h2>
              <p>Naya referral link banao (maximum 5 links ban sakte hain).</p>
            </div>
          </div>

          <form onSubmit={handleCreateLink}>
            <div className={styles.field}>
              <label htmlFor="partnershipPercent">Partnership Percentage (%)</label>
              <input
                id="partnershipPercent"
                type="number"
                min="0"
                max="30"
                step="0.1"
                placeholder="20"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                required
              />
              <span className={styles.hintText}>0 se 30% tak partnership percentage set kar sakte ho. Example: 20, 10, 14</span>
              {error && <span className={styles.errorText} style={{ display: 'block' }}>{error}</span>}
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              <span>{submitting ? 'Creating...' : '💼 Create Referral Link'}</span>
            </button>

            {success && <div className={styles.successMsg} style={{ display: 'block' }}>{success}</div>}
          </form>
        </section>

        {/* Existing Referral Links */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Your Referral Links</h2>
              <p>Sabhi referral links aur unke dashboards yahan dikhenge.</p>
            </div>
          </div>

          <div className={styles.referralLinksGrid}>
            {referralLinks.length === 0 ? null : (
              referralLinks.map((link) => {
                const linkUrl = `https://tshortner.in/signup-referral?ref=${link.referralCode}`;
                const usersList = Object.values(link.users || {});
                
                return (
                  <div key={link.id} className={styles.referralLinkCard}>
                    <div className={styles.linkCardHeader}>
                      <div className={styles.linkCardTitle}>Referral Link #{link.id.substring(0, 6)}</div>
                      <span className={styles.linkBadge}>{link.percentage}%</span>
                    </div>
                    <div className={styles.linkInfo}>
                      <strong>Signups:</strong> {link.signups || 0} / {link.maxSignups || 50}
                    </div>
                    <div className={styles.linkInfo}>
                      <strong>Code:</strong> {link.referralCode}
                    </div>
                    <div className={styles.referralLinkValue}>{linkUrl}</div>
                    
                    <div className={styles.usersList}>
                      <div className={styles.usersListTitle}>Invited Users ({usersList.length}):</div>
                      <div className={styles.usersListItems}>
                        {usersList.length === 0 ? (
                          <div className={styles.userItemEmpty}>Abhi tak koi user invite nahi hua.</div>
                        ) : (
                          usersList.map((u, idx) => (
                            <div key={idx} className={styles.userItem}>
                              📧 {u.email} ({u.name || 'Unknown'})
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.linkActions}>
                      <button className={styles.btnCopy} onClick={() => copyLink(link.referralCode)}>
                        📋 Copy
                      </button>
                      <button className={styles.btnView} onClick={() => viewDashboard(link.id, link.referralCode)}>
                        📊 Dashboard
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p className={styles.note}>
            {referralLinks.length > 0 
              ? `Total ${referralLinks.length} referral links.`
              : 'Abhi tak koi referral link nahi bana. Upar se naya link create karo.'}
          </p>
        </section>
      </div>

      {/* Dashboard Modal */}
      {modalOpen && (
        <div className={`${styles.modalOverlay} ${styles.active}`} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{modalTitle}</h3>
              <button className={styles.btnClose} onClick={() => setModalOpen(false)}>&times;</button>
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
                  {modalData.length === 0 ? null : (
                    modalData.map(([dateKey, obj]) => (
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
            <p className={styles.note}>{modalNote}</p>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Partnership;
