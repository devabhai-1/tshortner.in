# TShortner React App

Complete React conversion of the TShortner URL shortening panel with Firebase integration.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd react-app
npm install
```

### 2. Configure Firebase (Using Environment Variables)

**IMPORTANT:** Firebase config is now securely stored in environment variables (not in source code).

#### Step-by-Step:

1. **Copy the example environment file:**
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

2. **Get your Firebase config:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Enable **Authentication** (Email/Password + Google Sign-In)
   - Enable **Realtime Database**
   - Go to Project Settings (⚙️ gear icon)
   - Scroll to "Your apps" section
   - Copy the config values

3. **Fill in your `.env` file:**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
   ```

   ⚠️ **Important Notes:**
   - No quotes around values
   - No spaces around the `=` sign
   - The `databaseURL` is **required** for Realtime Database
   - The `.env` file is in `.gitignore` and will **never** be committed to git

4. **Security:**
   - ✅ `.env` is excluded from git via `.gitignore`
   - ✅ Config values stay out of source code
   - ✅ Different environments can use different configs
   - ✅ This is the standard industry practice for React apps

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

---

## 📁 Project Structure

```
react-app/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/             # React Context
│   │   └── AuthContext.jsx  # Authentication state
│   ├── firebase/            # Firebase configuration
│   │   ├── config.js        # ⚠️ Configure this first!
│   │   └── utils.js         # Firebase utility functions
│   ├── pages/               # All pages
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── SignupReferral.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Links.jsx
│   │   ├── Wallet.jsx
│   │   ├── Partnership.jsx
│   │   ├── Profile.jsx
│   │   ├── Support.jsx
│   │   ├── Privacy.jsx
│   │   └── Terms.jsx
│   ├── styles/
│   │   └── global.css       # Global styles
│   ├── App.jsx              # Routes configuration
│   └── main.jsx             # Entry point
├── package.json
├── vite.config.js
└── index.html
```

---

## 🔥 Firebase Setup Details

### Realtime Database Structure

The app uses this RTDB structure:

```
{
  "users": {
    "<email,with,commas>": {
      "profile": { name, email, uid, createdAt, lastLogin },
      "dashboard": { 
        dailyEarning, dailyCPM, totalEarning, 
        totalImpressions, overallCPM, withdrawnAmount,
        daily: { "2026-01-03": { impressions, cpm, earning }, ... }
      },
      "wallet": {
        currentBalance, pendingBalance, totalWithdrawn,
        withdrawalRequests: [...]
      },
      "links": {
        "telegram": { totalLinks, activeLinks, totalClicks, list: [...] },
        "website": { totalLinks, activeLinks, totalClicks, list: [...] }
      },
      "partnership": {
        enabled, links: { ... }
      },
      "referral": { ... }
    }
  },
  "allLinks": {
    "<code>": {
      code, originalUrl, shortUrl, totalUses,
      users: { "<emailKey>": true, ... }
    }
  }
}
```

### Database Rules (Security)

Update your Firebase Realtime Database rules:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "users": {
      "$emailKey": {
        ".read": "auth != null && (auth.token.email.replace('.', ',') == $emailKey || root.child('users/' + $emailKey + '/partnership/enabled').val() == true)",
        ".write": "auth != null && auth.token.email.replace('.', ',') == $emailKey"
      }
    },
    "allLinks": {
      ".read": "auth != null",
      "$code": {
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 🎨 Features

### Authentication
- ✅ Email/Password signup & login
- ✅ Google Sign-In
- ✅ Referral-based signup
- ✅ Protected routes

### Dashboard
- ✅ Real-time earning stats (USD)
- ✅ Daily/Total earnings, CPM, impressions
- ✅ 90-day daily performance table
- ✅ Yesterday comparison

### Links Management
- ✅ Telegram bot integration (2 bots)
- ✅ Web shortener (Terabox ID extraction)
- ✅ Duplicate detection (per code)
- ✅ Global link tracking (allLinks node)
- ✅ Click tracking

### Wallet
- ✅ Current balance, pending balance, withdrawn amount
- ✅ Withdraw requests (UPI / Binance USDT)
- ✅ Payout history (Paid/Pending/Rejected)
- ✅ Minimum $10 withdrawal

### Partnership
- ✅ Referral link generation
- ✅ Custom referral codes (6-12 chars)
- ✅ Signup tracking
- ✅ Percentage-based earnings
- ✅ Max 50 signups per link

### Profile
- ✅ View/Edit profile info
- ✅ Change password
- ✅ Account statistics
- ✅ Created at / Last login

### Support & Static Pages
- ✅ Contact form
- ✅ Privacy Policy
- ✅ Terms of Service

---

## 🛠️ Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Firebase v10** - Authentication + Realtime Database
- **Vite** - Fast build tool
- **CSS Modules** - Component-scoped styling

---

## 📝 Key Differences from Original

### Architecture
- **No inline scripts**: All logic in React components
- **Context API**: Global auth state management
- **Protected routes**: Automatic redirect to login
- **CSS Modules**: Scoped styling per component

### Firebase Integration
- **Preserved logic**: All Firebase operations unchanged
- **Utility functions**: Extracted to `firebase/utils.js`
- **Same database structure**: 100% compatible with original

### Styling
- **Same design**: Pixel-perfect conversion
- **Dark theme**: Preserved gradient backgrounds
- **Responsive**: Mobile-friendly layouts

---

## 🐛 Troubleshooting

### Error: "Missing Firebase environment variables"
- **Cause**: `.env` file not created or empty
- **Fix**: 
  1. Copy `.env.example` to `.env`
  2. Fill in all Firebase values
  3. Restart dev server: `npm run dev`

### Error: "Cannot parse Firebase url"
- **Cause**: Missing or invalid `VITE_FIREBASE_DATABASE_URL` in `.env`
- **Fix**: Add proper database URL: `https://your-project-default-rtdb.firebaseio.com`

### Error: "Permission denied"
- **Cause**: Database rules blocking access
- **Fix**: Update Firebase RTDB rules (see Database Rules section above)

### Links not saving
- **Cause**: Missing `allLinks` write permission
- **Fix**: Ensure user is authenticated and rules allow write

### Google Sign-In not working
- **Cause**: Google provider not enabled
- **Fix**: Enable Google Sign-In in Firebase Console → Authentication → Sign-in method

### Changes to .env not working
- **Cause**: Dev server needs restart to pick up env changes
- **Fix**: Stop server (Ctrl+C) and run `npm run dev` again

---

## 📦 Deployment

### Environment Variables on Production

When deploying, you need to set environment variables on your hosting platform:

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Configure **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Add Environment Variables** (Settings → Environment Variables):
   ```
   VITE_FIREBASE_API_KEY = your_value
   VITE_FIREBASE_AUTH_DOMAIN = your_value
   VITE_FIREBASE_DATABASE_URL = your_value
   VITE_FIREBASE_PROJECT_ID = your_value
   VITE_FIREBASE_STORAGE_BUCKET = your_value
   VITE_FIREBASE_MESSAGING_SENDER_ID = your_value
   VITE_FIREBASE_APP_ID = your_value
   ```
5. Deploy

### Netlify

1. Push to GitHub
2. Connect to Netlify
3. Configure **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Add Environment Variables** (Site settings → Build & deploy → Environment):
   - Add all 7 `VITE_FIREBASE_*` variables
5. Add `_redirects` file in `public/`:
   ```
   /* /index.html 200
   ```
6. Deploy

### Other Platforms

For any hosting platform:
1. Set all environment variables (starting with `VITE_FIREBASE_`)
2. Run build command: `npm run build`
3. Deploy the `dist/` folder

⚠️ **Important**: 
- Never commit `.env` file to git
- Always use environment variables on production
- Update Firebase rules before going live

---

## 📄 License

Same as original project.

## 🤝 Support

For issues or questions, contact the original panel maintainer.

---

**Note:** This is a complete React conversion that preserves 100% of the original Firebase logic and database structure. All features from the original HTML/JS version are implemented.
