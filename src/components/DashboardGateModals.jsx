import { useState } from 'react';
import styles from './DashboardGateModals.module.css';

export function normalizeTelegramUsername(raw) {
  let v = String(raw || '').trim();
  if (!v) return '';
  if (v.startsWith('@')) v = v.slice(1);
  v = v.replace(/\s+/g, '');
  if (!/^[a-zA-Z0-9_]{3,32}$/.test(v)) return '';
  return v;
}

export default function DashboardGateModals({
  needsTelegram,
  telegramUsername,
  onSaveTelegram,
  showWelcomeNotice,
  onDismissWelcome,
}) {
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!needsTelegram && !showWelcomeNotice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalized = normalizeTelegramUsername(input);
    if (!normalized) {
      setError('Enter a valid Telegram username (3–32 characters; @ is optional).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSaveTelegram(normalized);
    } catch (err) {
      setError(err?.message || 'Unable to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} role="presentation">
      <div className={styles.stack}>
        {needsTelegram ? (
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tg-username-title"
          >
            <div className={styles.modalHeader}>
              <span className={styles.icon} aria-hidden>
                ✈️
              </span>
              <h2 id="tg-username-title">Telegram Username Required</h2>
            </div>
            <p className={styles.lead}>
              To continue, please provide your <strong>Telegram username</strong>. This is a
              one-time setup and will be linked to your account for support and updates.
            </p>
            {telegramUsername ? (
              <p className={styles.savedHint}>
                Saved: <strong>@{telegramUsername}</strong>
              </p>
            ) : null}
            <form onSubmit={handleSubmit} className={styles.form}>
              <label htmlFor="tgUsernameInput">Telegram username</label>
              <div className={styles.inputRow}>
                <span className={styles.at}>@</span>
                <input
                  id="tgUsernameInput"
                  type="text"
                  autoComplete="off"
                  placeholder="your_username"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
              {error ? <p className={styles.err}>{error}</p> : null}
              <button type="submit" className={styles.primaryBtn} disabled={saving}>
                {saving ? 'Saving…' : 'Save & Continue'}
              </button>
              <p className={styles.note}>
                This step is required. Dashboard access will be enabled after you save.
              </p>
            </form>
          </div>
        ) : null}

        {showWelcomeNotice ? (
          <div className={styles.noticeModal} role="alertdialog" aria-labelledby="welcome-title">
            <div className={styles.noticeHeader}>
              <span className={styles.noticeIcon} aria-hidden>
                📢
              </span>
              <h3 id="welcome-title">TShortner — Important Notice</h3>
            </div>

            <div className={styles.noticeBlock}>
              <p className={styles.noticeLang}>English</p>
              <p className={styles.noticeText}>
                From <strong>16 August, 2:00 PM</strong>, Shortner traffic is being sent to your{' '}
                <strong>original links</strong>. After 2 PM this is already live.
              </p>
              <p className={styles.noticeText}>
                Shortner will be under update for <strong>2–3 days</strong>. After the update it
                will start again. Until then <strong>there will be no earning</strong>.
              </p>
              <p className={styles.noticeText}>
                Join <a href="https://firoplay.com" target="_blank" rel="noopener noreferrer">firoplay.com</a>{' '}
                and get <strong>$3 CPM</strong>.
              </p>
              <p className={styles.noticeText}>
                All pending payments will be completed on <strong>25 August</strong>. Please submit
                your <strong>withdrawal</strong> now. After 25 August, regular payments will be on
                time.
              </p>
            </div>

            <div className={styles.noticeDivider} aria-hidden />

            <div className={styles.noticeBlock}>
              <p className={styles.noticeLang}>हिंदी</p>
              <p className={styles.noticeText}>
                <strong>16 August, 2 baje</strong> se Shortner traffic aapke{' '}
                <strong>original link</strong> par bhej diya ja raha hai. 2 baje ke baad ye already
                chalu hai.
              </p>
              <p className={styles.noticeText}>
                Shortner <strong>2–3 din</strong> tak update hoga. Update ke baad wapas chalu ho
                jayega. Tab tak <strong>earning nahi hogi</strong>.
              </p>
              <p className={styles.noticeText}>
                <a href="https://firoplay.com" target="_blank" rel="noopener noreferrer">firoplay.com</a>{' '}
                ke saath aao — <strong>$3 CPM</strong> pa sakte ho.
              </p>
              <p className={styles.noticeText}>
                Sabhi ke payment <strong>25 August</strong> ko complete honge. Apna{' '}
                <strong>withdrawal</strong> abhi laga do. 25 ke baad regular payments time par hone
                lagenge.
              </p>
            </div>

            <button type="button" className={styles.secondaryBtn} onClick={onDismissWelcome}>
              Got it / Samajh gaya
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
