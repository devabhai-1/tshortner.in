import { useState, useEffect } from 'react';
import { ref, get, push, set, update } from 'firebase/database';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { emailToKey, formatMoney, formatDateFromTs } from '../firebase/utils';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Wallet.module.css';

function Wallet() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Wallet state
  const [walletState, setWalletState] = useState({
    currentBalance: 0,
    pendingBalance: 0,
    totalWithdrawn: 0
  });
  
  const [history, setHistory] = useState([]);
  
  // Form state
  const [amount, setAmount] = useState('0.00');
  const [method, setMethod] = useState('UPI');
  const [account, setAccount] = useState('');
  // Bank details state
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [amountError, setAmountError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [withdrawNote, setWithdrawNote] = useState('Note: abhi ye Firebase ke wallet node se connected hai. Request bhejne par currentBalance → kam, pendingBalance → badhega, aur request list me "pending" status ke saath save hogi.');

  const mapStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid" || s === "completed") return `${styles.statusBadge} ${styles.statusPaid}`;
    if (s === "rejected" || s === "cancelled") return `${styles.statusBadge} ${styles.statusRejected}`;
    return `${styles.statusBadge} ${styles.statusPending}`;
  };

  const mapStatusLabel = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid" || s === "completed") return "Paid";
    if (s === "rejected" || s === "cancelled") return "Rejected";
    return "Pending";
  };

  const loadWallet = async (emailKey) => {
    const walletRef = ref(db, "users/" + emailKey + "/wallet");
    const snap = await get(walletRef);

    if (!snap.exists()) {
      setWalletState({
        currentBalance: 0,
        pendingBalance: 0,
        totalWithdrawn: 0
      });
      setHistory([]);
      return;
    }

    const data = snap.val() || {};
    const current = Number(data.currentBalance || 0);
    
    setWalletState({
      currentBalance: current,
      pendingBalance: Number(data.pendingBalance || 0),
      totalWithdrawn: Number(data.totalWithdrawn || 0)
    });

    // Process history
    const rawReq = data.withdrawalRequests;
    let list = [];

    if (rawReq) {
      if (Array.isArray(rawReq)) {
        list = rawReq.filter(Boolean);
      } else if (typeof rawReq === "object") {
        list = Object.values(rawReq);
      }
    }

    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setHistory(list);
  };

  useEffect(() => {
    if (user?.email) {
      const emailKey = emailToKey(user.email);
      loadWallet(emailKey).then(() => setLoading(false));
    }
  }, [user]);

  // Update amount input when wallet state changes (EXACT same as HTML)
  useEffect(() => {
    if (walletState.currentBalance > 0) {
      setAmount(formatMoney(walletState.currentBalance));
    } else {
      setAmount('0.00');
    }
  }, [walletState.currentBalance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAmountError('');

    const amountVal = parseFloat(amount || "0");
    const minAmount = 10;

    if (isNaN(amountVal) || amountVal <= 0) {
      setAmountError("Sahi amount daalo.");
      return;
    }
    if (amountVal < minAmount) {
      setAmountError("Minimum withdraw amount $10.00 hai.");
      return;
    }
    if (amountVal > walletState.currentBalance) {
      setAmountError("Itna balance available nahi hai. Max: $" + formatMoney(walletState.currentBalance));
      return;
    }
    // Validation based on method
    if (method === 'Bank') {
      if (!bankName.trim()) {
        alert("Bank name required hai.");
        return;
      }
      if (!accountNumber.trim()) {
        alert("Account number required hai.");
        return;
      }
      if (!ifscCode.trim()) {
        alert("IFSC code required hai.");
        return;
      }
      if (!accountHolderName.trim()) {
        alert("Account holder name required hai.");
        return;
      }
    } else {
      if (!account.trim()) {
        alert("Payment ID (UPI ID / Binance UID / Wallet) required hai.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const emailKey = emailToKey(user.email);
      
      // 1. Calculate new balances
      const newCurrent = walletState.currentBalance - amountVal;
      const newPending = walletState.pendingBalance + amountVal;

      // 2. Create request
      const reqRef = ref(db, "users/" + emailKey + "/wallet/withdrawalRequests");
      const newRef = push(reqRef);
      
      const item = {
        id: newRef.key,
        createdAt: Date.now(),
        currency: "USD",
        status: "pending",
        amount: amountVal,
        method,
        account: method === 'Bank' ? `${accountHolderName.trim()} - ${bankName.trim()}` : account.trim(),
        // Bank-specific fields
        ...(method === 'Bank' && {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim(),
          accountHolderName: accountHolderName.trim()
        })
      };

      await set(newRef, item);

      // 3. Update balances
      const walletRef = ref(db, "users/" + emailKey + "/wallet");
      await update(walletRef, {
        currentBalance: newCurrent,
        pendingBalance: newPending
      });

      // 4. Reload data (EXACT same as HTML)
      await loadWallet(emailKey);
      
      setWithdrawNote("Request submit ho gayi. Admin approve karega to status Pending → Paid ho jayega.");
      
      // Alert message (EXACT same as HTML)
      alert(
        "Withdraw Request Submitted\n\n" +
        "Amount: $" + formatMoney(amountVal) + "\n" +
        "Method: " + method + "\n" +
        "Account: " + account.trim() + "\n\n" +
        "Balance update ho chuka hai. Ab request Pending me hai."
      );
      
      // Reset form - keep method, reset amount and bank fields
      setAmount(walletState.currentBalance > 0 ? formatMoney(walletState.currentBalance) : '0.00');
      if (method === 'Bank') {
        setBankName('');
        setAccountNumber('');
        setIfscCode('');
        setAccountHolderName('');
      } else {
        setAccount('');
      }
      
    } catch (err) {
      console.error(err);
      alert("Withdraw request save karte waqt error: " + (err.code || err.message));
    }

    setSubmitting(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading wallet..." />;
  }

  return (
    <Layout activeNav="wallet">
      <div className={styles.mainInner}>
        {/* Title */}
        <div className={styles.pageTitle}>
          <div>
            <h1>Wallet</h1>
            <p>Yahan se tum apna balance, pending earning aur UPI / Binance payouts manage karoge.</p>
          </div>
          <div className={styles.tagSmall}>
            <span className={styles.tagDot}></span>
            <span>Currency: USD ($)</span>
          </div>
        </div>

        {/* WALLET SUMMARY */}
        <section className={styles.walletGrid}>
          {/* Current Balance */}
          <div className={`${styles.card} ${styles.highlightCard}`}>
            <div className={styles.highlightBg}></div>
            <div className={styles.highlightInner}>
              <div className={styles.statLabel}>
                <span>Current Balance</span>
                <span className={`${styles.badgeSoft} ${styles.badgeGreen}`}>Available</span>
              </div>
              <div className={styles.statValue}>$ {formatMoney(walletState.currentBalance)}</div>
              <div className={styles.statSub}>Itna amount abhi withdraw ke liye ready hai.</div>
              <div className={styles.hint}>Minimum payout: <b>$ 10.00</b></div>
            </div>
          </div>

          {/* Pending Clearance */}
          <div className={styles.card}>
            <div className={styles.statLabel}>
              <span>Pending Clearance</span>
              <span className={`${styles.badgeSoft} ${styles.badgeYellow}`}>On Hold</span>
            </div>
            <div className={styles.statValue}>$ {formatMoney(walletState.pendingBalance)}</div>
            <div className={styles.statSub}>Recent earning jo abhi hold period me hai (e.g. 7 days).</div>
          </div>

          {/* Total Withdrawn */}
          <div className={styles.card}>
            <div className={styles.statLabel}>
              <span>Total Withdrawn</span>
              <span className={styles.badgeSoft}>Lifetime</span>
            </div>
            <div className={styles.statValue}>$ {formatMoney(walletState.totalWithdrawn)}</div>
            <div className={styles.statSub}>Ab tak tumhare account me bheja gaya total amount.</div>
          </div>
        </section>

        {/* WITHDRAW + HISTORY */}
        <section className={styles.bottomGrid}>
          {/* Withdraw Request */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Withdraw Request</h2>
                <span>Current balance se payout request bhejo.</span>
              </div>
              <span className={styles.badgeSoft}>
                Min: $10.00 · Max: ${formatMoney(walletState.currentBalance)}
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="amount">Amount ($)</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={walletState.currentBalance}
                  required
                />
                <span className={styles.hintText}>Minimum: $10.00 – agar isse kam doge to request reject ho sakti hai.</span>
                {amountError && <span className={styles.errorText} style={{ display: 'block' }}>{amountError}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="method">Payment Method</label>
                <select 
                  id="method" 
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value);
                    // Clear fields when method changes
                    setAccount('');
                    setBankName('');
                    setAccountNumber('');
                    setIfscCode('');
                    setAccountHolderName('');
                  }}
                  required
                >
                  <option value="UPI">UPI (India)</option>
                  <option value="Binance">Binance (USDT · TRC20)</option>
                  <option value="Bank">Bank Transfer (India)</option>
                </select>
                <span className={styles.hintText}>
                  3 methods available: <b>UPI</b> India ke liye, <b>Binance USDT (TRC20)</b> global ke liye, aur <b>Bank Transfer</b> India ke liye.
                </span>
              </div>

              {method === 'Bank' ? (
                <>
                  <div className={styles.field}>
                    <label htmlFor="bankName">Bank Name</label>
                    <input
                      id="bankName"
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., State Bank of India, HDFC Bank"
                      required
                    />
                    <span className={styles.hintText}>Apne bank ka naam likho.</span>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="accountHolderName">Account Holder Name</label>
                    <input
                      id="accountHolderName"
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Account holder ka naam (exactly bank me jaisa hai)"
                      required
                    />
                    <span className={styles.hintText}>Account holder ka naam jo bank me registered hai.</span>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="accountNumber">Account Number</label>
                    <input
                      id="accountNumber"
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Bank account number"
                      required
                    />
                    <span className={styles.hintText}>Apna bank account number likho.</span>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="ifscCode">IFSC Code</label>
                    <input
                      id="ifscCode"
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g., SBIN0001234"
                      required
                      maxLength={11}
                      style={{ textTransform: 'uppercase' }}
                    />
                    <span className={styles.hintText}>Bank ka IFSC code (11 characters).</span>
                  </div>
                </>
              ) : (
                <div className={styles.field}>
                  <label htmlFor="account">
                    {method === 'UPI' ? 'UPI ID' : 'Binance UID / Wallet Address'}
                  </label>
                  <input
                    id="account"
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder={method === 'UPI' ? 'example@upi' : 'Binance UID / TRC20 address'}
                    required
                  />
                  <span className={styles.hintText}>
                    {method === 'UPI' 
                      ? 'Apna UPI ID likho (e.g., yourname@paytm, yourname@ybl).'
                      : 'Binance UID ya USDT TRC20 wallet address likho.'}
                  </span>
                </div>
              )}

              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                <span className={styles.icon}>💸</span>
                <span>{submitting ? 'Submitting...' : 'Submit Withdraw Request'}</span>
              </button>
            </form>

            <p className={styles.withdrawNote}>{withdrawNote}</p>
          </div>

          {/* Payout History */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Payout History</h2>
                <span>Recent withdraw requests (live from wallet.withdrawalRequests).</span>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount ($)</th>
                    <th>Method</th>
                    <th>Account / Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="5" className={styles.textSoft}>
                        Abhi tak koi withdraw request nahi hai.
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id || item.createdAt}>
                        <td>{formatDateFromTs(item.createdAt || Date.now())}</td>
                        <td>$ {formatMoney(item.amount)}</td>
                        <td>{item.method || "-"}</td>
                        <td>
                          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                            {item.method === 'Bank' && item.bankName 
                              ? `${item.accountHolderName || ''} - ${item.bankName || ''} (${item.accountNumber ? item.accountNumber.substring(0, 4) + '****' : ''})`
                              : (item.account || "-")
                            }
                          </span>
                          {item.method === 'Bank' && item.ifscCode && (
                            <span style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block', marginTop: '0.2rem' }}>
                              IFSC: {item.ifscCode}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={mapStatusClass(item.status)}>
                            <span className={styles.statusDot}></span> {mapStatusLabel(item.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className={styles.note}>
              {history.length > 0 
                ? `Latest ${history.length} withdraw requests.`
                : 'Abhi tak koi withdraw request nahi hai.'}
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Wallet;
