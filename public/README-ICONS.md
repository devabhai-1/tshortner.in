# TShortner PWA Icons Guide

## Icon Files Needed

For complete PWA support, you need to generate the following icon sizes:

- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels (iOS)
- `icon-192x192.png` - 192x192 pixels (Android)
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels (Splash screen)

## Quick Generation Methods

### Method 1: Online Tools (Recommended)

1. **PWA Builder Image Generator**
   - Visit: https://www.pwabuilder.com/imageGenerator
   - Upload a 512x512px base image
   - Download all generated sizes

2. **RealFaviconGenerator**
   - Visit: https://realfavicongenerator.net/
   - Upload a 512x512px image
   - Generate all platforms

3. **Favicon.io**
   - Visit: https://favicon.io/
   - Use text generator with letter "T"
   - Download PNG files

### Method 2: Use generate-icons.html

1. Open `generate-icons.html` in browser
2. Click buttons to generate 192x192 and 512x512
3. Use those as base for other sizes (resize using image editor)

### Method 3: Create Base Icon

Create a 512x512px image with:
- Background: Gradient (Purple #6366f1 → Green #22c55e) or (Gold #d97706 → Green #059669)
- Letter: White "T" in bold, centered
- Shape: Rounded rectangle (20% border radius)
- Save as PNG with transparency

Then resize to all required sizes using:
- Image editor (GIMP, Photoshop, Figma)
- Online tool: https://www.iloveimg.com/resize-image
- Command line: ImageMagick `convert icon-512x512.png -resize 192x192 icon-192x192.png`

## Design Specifications

**Dark Theme Colors:**
- Background: Linear gradient from #6366f1 (purple) → #8b5cf6 (violet) → #22c55e (green)
- Text: White (#ffffff)
- Border radius: 20% of size

**Light Theme Colors:**
- Background: Linear gradient from #d97706 (gold) → #f59e0b (amber) → #059669 (emerald) → #1e40af (blue)
- Text: White (#ffffff)
- Border radius: 20% of size

**Font:**
- Bold, sans-serif
- Size: 60% of icon size
- Letter: "T" (for TShortner)

## Placement

Place all generated PNG files in the `public/` directory.

## Testing

After adding icons:
1. Build the app: `npm run build`
2. Test PWA installation on mobile device
3. Check manifest in browser DevTools → Application → Manifest
4. Verify icons in Application → Service Workers
