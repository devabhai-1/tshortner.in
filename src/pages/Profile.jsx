import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { emailToKey } from '../firebase/utils';
import Layout from '../components/Layout';
import styles from './Profile.module.css';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('IN');
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) return;

      try {
        const emailKey = emailToKey(user.email);
        const profileRef = ref(db, 'users/' + emailKey + '/profile');
        const snap = await get(profileRef);

        let profileData;

        if (!snap.exists()) {
          // agar profile node nahi hai to ek default create kar dete hain (EXACT same as HTML)
          const now = Date.now();
          profileData = {
            name: user.displayName || user.email || "User",
            email: user.email,
            country: "IN",
            uid: user.uid,
            createdAt: now,
            lastLogin: now
          };
          await set(profileRef, profileData);
        } else {
          profileData = snap.val() || {};
        }

        // form fill (EXACT same as HTML)
        const nameVal = profileData.name || user.displayName || (user.email ? user.email.split("@")[0] : "User");
        const emailVal = profileData.email || user.email;
        const countryVal = profileData.country || "IN";

        setName(nameVal);
        setEmail(emailVal || "");
        setCountry(countryVal);

        setNote("Profile loaded from Firebase (users/" + emailKey + "/profile).");
        setLoading(false);
      } catch (err) {
        console.error(err);
        setNote("Profile load karte waqt error: " + (err.code || err.message));
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNote('');

    const nameVal = name.trim();
    if (!nameVal) {
      alert("Name empty nahi ho sakta.");
      setSaving(false);
      return;
    }

    try {
      const emailKey = emailToKey(user.email);
      const profileRef = ref(db, 'users/' + emailKey + '/profile');
      const now = Date.now();

      // existing data merge ke liye pehle current fetch (EXACT same as HTML)
      const snap = await get(profileRef);
      const old = snap.exists() ? snap.val() : {};

      const payload = {
        ...old,
        name: nameVal,
        country,
        email: old.email || user.email,
        uid: old.uid || user.uid,
        lastLogin: now
      };

      await set(profileRef, payload);

      // auth displayName bhi update kar dete hain (optional) - EXACT same as HTML
      try {
        await updateProfile(auth.currentUser, { displayName: nameVal });
      } catch (e) {
        console.warn("updateProfile failed:", e);
      }

      setNote("Profile successfully updated.");
    } catch (err) {
      console.error(err);
      setNote("Profile save karte waqt error: " + (err.code || err.message));
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <Layout activeNav="profile">
        <div className={styles.loading}>Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout activeNav="profile">
      <div className={styles.mainInner}>
        <div className={styles.pageTitle}>
          <h1>Profile</h1>
          <p>Yahan se tum apni basic details + legal pages manage kar sakte ho.</p>
        </div>

        {/* Account Details */}
        <section>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Account Details</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email (login)</label>
                <input type="email" id="email" value={email} disabled />
                <span className={styles.note}>
                  Email login ka base hai, isko change karna ho to support se contact karo.
                </span>
              </div>

              <div className={styles.field}>
                <label htmlFor="country">Country</label>
                <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="BD">Bangladesh</option>
                  <option value="PK">Pakistan</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>

              <p className={`${styles.note} ${note.includes('successfully') ? styles.noteSuccess : ''}`}>
                {note || "Profile details Firebase ke users/<emailKey>/profile node se linked hain."}
              </p>
            </form>
          </div>
        </section>

        {/* Legal & Policies */}
        <section>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Legal & Policies</h2>
            </div>

            <div className={styles.policyLinks}>
              <span>
                Panel use karne se pehle <b>Privacy Policy</b> aur <b>Terms & Conditions</b> ek baar zaroor padhein.
              </span>

              <div className={styles.policyBtns}>
                <button className={styles.btnLink} type="button" onClick={() => navigate('/privacy')}>
                  📜 Privacy Policy
                </button>
                <button className={styles.btnLink} type="button" onClick={() => navigate('/terms')}>
                  ⚖️ Terms & Conditions
                </button>
              </div>

              <span className={styles.note}>
                Ye pages <code>/privacy</code> aur <code>/terms</code> static HTML hain.
                Public ke liye open rakh sakte ho (login ke bina bhi).
              </span>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Profile;
