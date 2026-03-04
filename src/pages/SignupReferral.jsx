import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';
import { auth, db } from '../firebase/config';
import { emailToKey, buildDailyMap } from '../firebase/utils';
import styles from './Auth.module.css';

function SignupReferral() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralCode = searchParams.get('ref') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
      
      if (user) {
        // User already logged in - clear any previous errors/success
        setError('');
        setSuccess('');
      } else {
        // User logged out - clear error and enable form
        setError('');
        setSuccess('Logout successful! Ab aap naya account bana sakte hain.');
      }
    });

    return unsubscribe;
  }, []);

  // Find referrer by code
  const findReferrerByCode = async (code) => {
    if (!code) return null;

    const usersRef = ref(db, "users");
    const snap = await get(usersRef);

    if (!snap.exists()) return null;

    const users = snap.val() || {};

    for (const [emailKey, userData] of Object.entries(users)) {
      const partnership = userData.partnership || {};
      const links = partnership.links || {};

      for (const [linkId, linkData] of Object.entries(links)) {
        if (linkData.referralCode === code) {
          const signups = linkData.signups || 0;
          const maxSignups = linkData.maxSignups || 50;

          if (signups >= maxSignups) {
            throw new Error("Is referral link ki signup limit (50) full ho chuki hai.");
          }

          return {
            emailKey: emailKey,
            email: userData.profile?.email || emailKey.replace(/,/g, "."),
            percentage: linkData.percentage || 0,
            linkId: linkId
          };
        }
      }
    }

    return null;
  };

  // Create user node with referral info
  const createUserNodeWithReferral = async (user, userName, referrerInfo) => {
    const uid = user.uid;
    const userEmail = user.email;
    const now = Date.now();

    const userEmailKey = emailToKey(userEmail);
    const dailyMap = buildDailyMap(90);

    const userRef = ref(db, "users/" + userEmailKey);

    const userNode = {
      profile: {
        email: userEmail,
        name: userName,
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
    };

    // Add referral section if referrer exists
    if (referrerInfo) {
      userNode.referral = {
        referredBy: referrerInfo.emailKey,
        referredByEmail: referrerInfo.email,
        referralCode: referralCode,
        referralLinkId: referrerInfo.linkId,
        referralPercentage: referrerInfo.percentage,
        joinedAt: now,
        daily: buildDailyMap(10)
      };
    }

    await set(userRef, userNode);

    // Update referrer's partnership link
    if (referrerInfo && referrerInfo.linkId) {
      const linkRef = ref(db, `users/${referrerInfo.emailKey}/partnership/links/${referrerInfo.linkId}`);
      const linkSnap = await get(linkRef);

      if (linkSnap.exists()) {
        const linkData = linkSnap.val() || {};
        const currentSignups = linkData.signups || 0;

        if (!linkData.users) {
          linkData.users = {};
        }

        linkData.users[userEmailKey] = {
          email: userEmail,
          name: userName,
          joinedAt: now
        };

        await update(linkRef, {
          signups: currentSignups + 1,
          users: linkData.users
        });
      }
    }

    return userNode;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle the state update and message
    } catch (err) {
      console.error(err);
      setError('Logout me problem: ' + (err.code || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if user is already logged in
    if (currentUser) {
      setError('Aap already logged in hain. Naya account banane ke liye pehle logout karein.');
      return;
    }

    if (password !== confirm) {
      setError('Password & Confirm Password same hone chahiye.');
      return;
    }

    if (!referralCode) {
      setError('Referral code missing hai. Sahi referral link se aao.');
      return;
    }

    setLoading(true);

    try {
      // Find referrer first
      const referrerInfo = await findReferrerByCode(referralCode);

      if (!referrerInfo) {
        throw new Error("Invalid referral code. Sahi referral link use karo.");
      }

      // Create user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // Update auth display name
      await updateProfile(user, { displayName: name });

      // Create RTDB node with referral
      await createUserNodeWithReferral(user, name, referrerInfo);

      setSuccess('Account Successfully Created with Referral!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      let msg = 'Signup failed: ' + err.code;
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Ye email pehle se registered hai. Login karein ya different email use karein.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Checking authentication...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1>Create Account</h1>
          <p className={styles.subtitle}>Referral link se signup karo aur partnership earning start karo.</p>

          {referralCode && (
            <div className={styles.referralBadge}>
              🎁 Referral Code: <strong>{referralCode}</strong>
            </div>
          )}

          {/* Show logout option if user is already logged in */}
          {currentUser && (
            <div className={styles.msg} style={{ 
              display: 'block', 
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              color: '#92400e',
              marginBottom: '1rem',
              padding: '0.75rem',
              borderRadius: '0.6rem'
            }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                ⚠️ Aap already logged in hain ({currentUser.email})
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Naya account banane ke liye pehle logout karein, phir referral link se signup karein.
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(245, 158, 11, 0.6)',
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#92400e',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Logout Karo
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!!currentUser}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!currentUser}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!!currentUser}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={!!currentUser}
                required
              />
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnGreen}`} disabled={loading || currentUser}>
              {loading ? 'Creating...' : currentUser ? 'Pehle Logout Karein' : 'Create Account'}
            </button>

            {error && <div className={`${styles.msg} ${styles.error}`}>{error}</div>}
            {success && <div className={`${styles.msg} ${styles.success}`}>{success}</div>}
          </form>

          <p className={styles.bottomText}>
            Already account hai? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupReferral;
