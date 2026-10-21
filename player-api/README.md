# tshortner Player API (alag system)

Ye **Node.js** API sirf Player tracking ke liye hai.  
`tshortner site` React app aur existing ads setup **touch nahi** hota.

## Run

```bash
cd "tshortner site/player-api"
cp .env.example .env
npm install
npm start
```

Default URL: `http://localhost:8787`

## Player.html me API URL

Live pe already set hai:

```html
<script>
  window.PLAYER_API_BASE = 'https://tshortner.in';
</script>
```

Player host **sirf**:
- `https://teraboxlinke.com` (e.g. `/x/player.html`)
- `https://www.teraboxlinke.com`

Doosri domain se event aaya to API **403** degi.

Vercel pe site deploy ke baad endpoints:
- `https://tshortner.in/api/player/health`
- `https://tshortner.in/api/player/event`
- `https://tshortner.in/api/player/stats`

## Endpoints

| Method | Path | Auth | Kaam |
|--------|------|------|------|
| POST | `/api/player/event` | no | 1 event save (IP server pe) |
| POST | `/api/player/events` | no | batch |
| GET | `/api/player/health` | no | alive check |
| GET | `/api/player/stats` | `x-api-key` | totals / ads / mails / links |
| GET | `/api/player/events` | `x-api-key` | raw rows |

### Event example

```json
{
  "event": "player_click",
  "linkId": "1S78f4Bm5U9W1uMCgYiipAg",
  "sessionId": "abc",
  "adSlot": "24-august-intricial",
  "adUnit": "/23113214187/24-august-intricial",
  "pageUrl": "https://tera.cybernewhub.com/v/xxx",
  "touch": { "x": 120, "y": 40, "type": "touch" }
}
```

Server khud:
- IP nikalta hai
- `allLinks/{linkId}` se owner **email** resolve karta hai
- `data/events/YYYY-MM-DD.jsonl` me save karta hai

## Record hone wali cheezein

- page_view + IP
- touch (x/y/type)
- player_click (Click to View)
- playline_click
- ad_impression / ad_shown / ad_click
- ad_continue / ad_close
- redirect
- linkId + owner email
