import { useState, useEffect, useRef } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { emailToKey, saveWebLink, formatDateFromTs } from '../firebase/utils';
import Layout from '../components/Layout';
import styles from './Links.module.css';

function Links() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [webLinks, setWebLinks] = useState([]);
  const [telegramLinks, setTelegramLinks] = useState([]);
  const [loadError, setLoadError] = useState('');
  
  // Form state
  const [webUrl, setWebUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Output state
  const [showOutput, setShowOutput] = useState(false);
  const [outputOriginal, setOutputOriginal] = useState('');
  const [outputShort, setOutputShort] = useState('');
  const [outputNote, setOutputNote] = useState('');
  const [lastShortUrlForCopy, setLastShortUrlForCopy] = useState('');
  const [copyToast, setCopyToast] = useState('');
  const copyToastTimer = useRef(null);

  const extractCodeFromUrl = (url) => {
    const match = url.match(/\/s\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const loadTelegramLinks = async (emailKey) => {
    const listRef = ref(db, 'users/' + emailKey + '/links/telegram/list');
    const snap = await get(listRef);

    if (!snap.exists()) {
      return [];
    }

    const data = snap.val() || {};
    const entries = Object.values(data);
    entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return entries;
  };

  const loadWebLinks = async (emailKey) => {
    const listRef = ref(db, 'users/' + emailKey + '/links/website/list');
    const snap = await get(listRef);

    if (!snap.exists()) {
      return [];
    }

    const data = snap.val() || {};
    const entries = Object.values(data);
    entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return entries;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;

      try {
        const emailKey = emailToKey(user.email);
        const [tgLinks, webLinksData] = await Promise.all([
          loadTelegramLinks(emailKey),
          loadWebLinks(emailKey)
        ]);

        setTelegramLinks(tgLinks);
        setWebLinks(webLinksData);
        setLoadError('');
      } catch (err) {
        console.error('Links load error:', err);
        setLoadError('Links load karte waqt error: ' + (err?.code || err?.message || 'Unknown error'));
        setTelegramLinks([]);
        setWebLinks([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUrlError('');

    const longUrl = webUrl.trim();
    if (!longUrl) {
      setUrlError('URL empty hai.');
      return;
    }

    const code = extractCodeFromUrl(longUrl);
    if (!code) {
      setUrlError('Yeh URL short nahi ho sakti. Valid Terabox / share link paste karo.');
      return;
    }

    const shortUrl = `https://teraboxlinke.com/s/${code}`;
    setSubmitting(true);

    try {
      const emailKey = emailToKey(user.email);
      const { item, alreadyExists } = await saveWebLink(
        emailKey,
        user.email,
        longUrl,
        code,
        shortUrl
      );

      // Outputs - hamesha canonical existing item dikhayenge (EXACT same as HTML)
      setShowOutput(true);
      setOutputOriginal(item.originalUrl);
      setOutputShort(item.shortUrl);
      setLastShortUrlForCopy(item.shortUrl);

      if (alreadyExists) {
        // naya row add nahi karenge, count bhi same rahega (EXACT same as HTML)
        setOutputNote('Yeh link pehle se saved hai — existing short link use ho raha hai.');
      } else {
        // table me new row add karo (prepend)
        setWebLinks(prev => [item, ...prev]);
        setOutputNote('');
      }

      setWebUrl('');
    } catch (err) {
      console.error(err);
      setUrlError('Link save karte waqt error: ' + (err.code || err.message));
    }

    setSubmitting(false);
  };

  const showCopyToast = (msg) => {
    setCopyToast(msg);
    if (copyToastTimer.current) window.clearTimeout(copyToastTimer.current);
    copyToastTimer.current = window.setTimeout(() => setCopyToast(''), 2200);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => showCopyToast('Copied'),
      () => showCopyToast('Copy failed — manually select'),
    ).catch(() => showCopyToast('Copy failed — manually select'));
  };

  const copyShortOut = () => {
    if (!lastShortUrlForCopy) return;
    navigator.clipboard.writeText(lastShortUrlForCopy).then(
      () => showCopyToast('Short URL copied'),
      () => showCopyToast('Copy failed — manually select'),
    ).catch(() => showCopyToast('Copy failed — manually select'));
  };

  const openBot = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Layout activeNav="links">
        <div className={styles.loading}>Loading links...</div>
      </Layout>
    );
  }

  return (
    <Layout activeNav="links">
      <div className={styles.mainInner}>
        {copyToast ? (
          <div className={styles.copyToast} role="status" aria-live="polite">
            {copyToast}
          </div>
        ) : null}

        <div className={styles.pageTitle}>
          <div>
            <h1>Links</h1>
            <p>Telegram bots + web shortner — yahi se short links banao aur track karo.</p>
          </div>
          <div className={styles.tagSmall}>
            <span className={styles.tagDot}></span>
            <span>Web + Telegram short links</span>
          </div>
        </div>

        {loadError && (
          <div className={styles.errorText} style={{ display: 'block', marginBottom: '1rem' }}>
            {loadError}
          </div>
        )}

        {/* Web Shortner — primary */}
        <section className={`${styles.card} ${styles.createPrimary}`}>
          <div className={styles.createHead}>
            <div>
              <h2>Create web short link</h2>
              <p>Long link paste karo — short link generate hoke save ho jayegi.</p>
            </div>
            <span className={styles.badgeSoft}>Web</span>
          </div>

          <div className={styles.helperChips} aria-label="Tips">
            <span className={styles.chip}>Paste long URL</span>
            <span className={styles.chip}>Generate short link</span>
            <span className={styles.chip}>Copy & share</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.createForm}>
            <div className={styles.field}>
              <label htmlFor="webUrl">Paste long URL</label>
              <input
                id="webUrl"
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://…"
                required
              />
              <p className={styles.hintText}>
                Supported share / Terabox style links short ho kar panel me save hoti hain.
              </p>
              {urlError && (
                <p className={styles.errorText} style={{ display: 'block' }}>
                  {urlError}
                </p>
              )}
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              <span>{submitting ? 'Saving…' : 'Generate & Save Short Link'}</span>
            </button>
          </form>

          {showOutput && (
            <div className={styles.resultCard}>
              <div className={styles.resultBadge}>Ready</div>
              <div className={styles.resultShortBlock}>
                <span className={styles.resultLabel}>Your short URL</span>
                <p className={styles.resultShortUrl}>{outputShort}</p>
                <div className={styles.resultActions}>
                  <button className={styles.btnPrimary} type="button" onClick={copyShortOut}>
                    Copy short URL
                  </button>
                  <button
                    className={styles.btnSecondary}
                    type="button"
                    onClick={() => window.open(outputShort, '_blank')}
                  >
                    Open
                  </button>
                </div>
              </div>
              <div className={styles.resultMeta}>
                <span className={styles.resultLabel}>Original</span>
                <p className={styles.resultOriginal}>{outputOriginal}</p>
              </div>
              {outputNote ? <p className={styles.note}>{outputNote}</p> : null}
            </div>
          )}
        </section>

        {/* Telegram Bots */}
        <section className={styles.card} style={{ marginBottom: '1rem' }}>
          <h2 className={styles.sectionH2}>Telegram Bots</h2>
          <p className={styles.sectionSub}>
            Bots se Telegram par link bhejo — ye isi account ke under track honge.
          </p>

          <div className={styles.botGrid}>
            <div className={styles.botCard} id="bot1">
              <h3>ShortEarn Bot #1</h3>
              <p>Basic shortener — Terabox links is panel se track.</p>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => openBot('https://t.me/TShortnerbot')}
              >
                Open Bot 1
              </button>
            </div>

            <div className={styles.botCard} id="bot2">
              <h3>ShortEarn Bot #2</h3>
              <p>High traffic / multiple channels ke liye.</p>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => openBot('https://t.me/TShortner1bot')}
              >
                Open Bot 2
              </button>
            </div>
          </div>
        </section>

        {/* Telegram Links Table */}
        <section>
          <div className={styles.sectionTitle}>
            <div>
              <h2>Saved Telegram Links</h2>
              <span>Bot se create kiye links yahan list hote hain.</span>
            </div>
            <span className={styles.badgeSoft}>{telegramLinks.length} links</span>
          </div>

          <div className={styles.card}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Short URL</th>
                    <th>Original URL</th>
                    <th>Clicks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {telegramLinks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className={styles.emptyCell}>
                        <div className={styles.guidedEmpty}>
                          <p className={styles.guidedTitle}>No Telegram links yet</p>
                          <p className={styles.guidedText}>
                            Bot 1 ya Bot 2 kholo, link bhejo — saved links yahan dikhenge.
                          </p>
                          <div className={styles.guidedActions}>
                            <button
                              type="button"
                              className={styles.btnSecondary}
                              onClick={() => openBot('https://t.me/TShortnerbot')}
                            >
                              Open Bot 1
                            </button>
                            <button
                              type="button"
                              className={styles.btnSecondary}
                              onClick={() => openBot('https://t.me/TShortner1bot')}
                            >
                              Open Bot 2
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    telegramLinks.map((item) => (
                      <tr key={item.id || item.createdAt}>
                        <td>{formatDateFromTs(item.createdAt || Date.now())}</td>
                        <td>
                          <span className={styles.urlShort}>{item.shortUrl || 'N/A'}</span>
                        </td>
                        <td>
                          <span className={styles.urlMain} title={item.originalUrl}>
                            {item.originalUrl || 'N/A'}
                          </span>
                        </td>
                        <td>{item.clicks || 0}</td>
                        <td>
                          <button
                            className={styles.btnXs}
                            onClick={() => copyToClipboard(item.shortUrl || '')}
                          >
                            Copy
                          </button>
                          <button
                            className={styles.btnXs}
                            onClick={() => window.open(item.shortUrl || '', '_blank')}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.note}>
              {telegramLinks.length > 0
                ? `Latest ${telegramLinks.length} telegram links.`
                : 'Bot se pehla link banao — list auto update hogi.'}
            </p>
          </div>
        </section>

        {/* Web Links Table */}
        <section>
          <div className={styles.sectionTitle}>
            <div>
              <h2>Saved Web Links</h2>
              <span>Web shortner se save hue links.</span>
            </div>
            <span className={styles.badgeSoft}>{webLinks.length} links</span>
          </div>

          <div className={styles.card}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Short URL</th>
                    <th>Original URL</th>
                    <th>Clicks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {webLinks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className={styles.emptyCell}>
                        <div className={styles.guidedEmpty}>
                          <p className={styles.guidedTitle}>No web short links yet</p>
                          <p className={styles.guidedText}>
                            Upar form me long URL paste karke Generate karo.
                          </p>
                          <button
                            type="button"
                            className={styles.btnPrimary}
                            onClick={() =>
                              document.getElementById('webUrl')?.focus()
                            }
                          >
                            Paste URL above
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    webLinks.map((item) => (
                      <tr key={item.id || item.createdAt}>
                        <td>{formatDateFromTs(item.createdAt || Date.now())}</td>
                        <td>
                          <span className={styles.urlShort}>{item.shortUrl}</span>
                        </td>
                        <td>
                          <span className={styles.urlMain} title={item.originalUrl}>
                            {item.originalUrl}
                          </span>
                        </td>
                        <td>{item.clicks || 0}</td>
                        <td>
                          <button
                            className={styles.btnXs}
                            onClick={() => copyToClipboard(item.shortUrl)}
                          >
                            Copy
                          </button>
                          <button
                            className={styles.btnXs}
                            onClick={() => window.open(item.shortUrl, '_blank')}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.note}>
              {webLinks.length > 0
                ? `Latest ${webLinks.length} web links.`
                : 'Generate & Save se pehla web link add karo.'}
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Links;
