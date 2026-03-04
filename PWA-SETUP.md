# PWA (Progressive Web App) Setup Guide

## ✅ PWA Features Enabled

This app is configured as a Progressive Web App (PWA) with the following features:

### 1. **Installable**
- Users can install the app on their devices (mobile & desktop)
- App appears in app drawer/home screen
- Standalone mode (no browser UI)

### 2. **Offline Support**
- Service Worker caches essential files
- App works offline (basic functionality)
- Automatic cache updates

### 3. **App Manifest**
- App name: "TShortner - URL Shortener Panel"
- Short name: "TShortner"
- Theme color: Green (#22c55e)
- Icons: 192x192 and 512x512 PNG

### 4. **Service Worker**
- Automatic registration in production
- Cache management
- Update notifications

## 📱 How to Install

### On Mobile (Android/iPhone):
1. Open the app in browser
2. Tap the browser menu (3 dots)
3. Select "Add to Home Screen" or "Install App"
4. Confirm installation

### On Desktop (Chrome/Edge):
1. Look for install icon in address bar
2. Click "Install" button
3. App will open in standalone window

## 🔧 Technical Details

### Files:
- `/public/manifest.json` - PWA manifest
- `/public/sw.js` - Service Worker
- `/public/icon-192x192.png` - App icon (192x192)
- `/public/icon-512x512.png` - App icon (512x512)
- `/public/favicon.svg` - Favicon
- `/public/browserconfig.xml` - Windows tile config

### Service Worker:
- Cache version: `tshortner-v2`
- Auto-updates every hour
- Caches essential files for offline use

### Manifest Features:
- Display mode: `standalone`
- Orientation: `portrait-primary`
- Start URL: `/`
- Shortcuts: Dashboard, Links

## 🚀 Production Build

To build for production:
```bash
npm run build
```

The build output will be in `/dist` folder. Deploy this folder to your hosting service.

## 📝 Notes

- Service Worker only registers in production mode
- Development mode automatically unregisters old service workers
- Icons must be present in `/public` folder for PWA to work
- HTTPS required for PWA features (except localhost)

## 🎨 Theme Colors

- Dark theme: `#22c55e` (Green)
- Light theme: `#d97706` (Orange)
- Background: `#0f0f1e` (Dark)
