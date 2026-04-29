![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

# Test Data Generator · QA Tools v3

Pure-frontend test data generator with optional REST API backend.  
28 data types · 7 categories · 4 themes · zero external dependencies.

---

## 🌐 Live Demo

**Hosted on GitHub Pages:** https://iamragavendrans.github.io/simple-test-data-generator/

---

## Quick Start (Local Development)

```bash
python server.py          # macOS / Linux
start.bat                 # Windows
```

Browser opens at **http://localhost:8080** automatically.

---

## API

The same server also exposes a REST API at **http://localhost:8080/api/**

### Endpoints

```
GET  /api/categories                          — list all categories & types
GET  /api/types                               — flat list of all 28 type IDs
GET  /api/generate?type={id}&count={n}        — generate via query string
POST /api/generate  {type, count, options}    — generate via JSON body
```

Full interactive docs at **http://localhost:8080/api-docs.html**

### Examples

```bash
# UUID
curl "http://localhost:8080/api/generate?type=uuid&count=5"

# Strong password
curl -X POST http://localhost:8080/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"password","count":3,"options":{"length":32,"special":true}}'

# MAC address with dash separator
curl "http://localhost:8080/api/generate?type=mac_address&count=5&separator=-"

# IPv6
curl "http://localhost:8080/api/generate?type=ip&count=3&version=ipv6"

# EU-format dates 1990–2024
curl "http://localhost:8080/api/generate?type=date&count=5&format=eu&from_year=1990&to_year=2024"

# Japanese addresses
curl -X POST http://localhost:8080/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"address","count":5,"options":{"country":"JP"}}'
```

---

## All 28 Types

| Category | Types |
|---|---|
| 🔑 Identifiers & Security | `uuid` `hash` `password` `username` |
| 👤 Contact & Identity | `name` `email` `phone` `address` `country` `city` `zipcode` `coordinates` |
| 💳 Financial & Sensitive | `credit_card` `ssn` `barcode` `isbn` |
| 🌐 Network & Web | `ip` `url` `mac_address` `imei` |
| 🕐 Time & Text | `date` `datetime` `sentence` `paragraph` |
| 🎨 Colors | `hex_color` `rgb_color` |
| 🏢 Work & Organization | `company` `job` |

---

## Themes

Click the theme button (top-right of the app) to switch between:

| Theme | Mood |
|---|---|
| 🌙 Dark | Classic deep navy (default) |
| ☀️ Light | Clean white with subtle shadows |
| 🔮 Purple | Rich purple-violet gradients |
| 🌌 Midnight | Deep blue with cyan accents |

Theme is saved in `localStorage` and persists across reloads.

---

## Requirements

- Python 3.7+ (stdlib only — no pip install needed)
- Modern browser: Chrome 90+, Firefox 90+, Safari 15.4+, Edge 90+

---

## Files

```
app/
  index.html          app shell + 4 theme CSS blocks
  api-docs.html       interactive API documentation
  server.py           HTTP server (static files + API routing)
  api.py              all 28 Python generators + REST handler
  start.bat           Windows launcher
  js/
    app.js            entry point
    store.js          reactive state
    utils.js          randInt, choice, Luhn
    data/
      categories.js   taxonomy (7 categories, 28 types with options schema)
      datasets.js     static data arrays
    generators/
      index.js        dispatcher
      identifiers.js  uuid, password, username, imei, mac
      contact.js      name, email, phone, address, country, city, zip
      financial.js    credit_card, ssn, barcode, isbn
      network.js      ip, url
      time_text.js    datetime, sentence, paragraph
      colors.js       hex_color, rgb_color
      work.js         company, job
      extras.js       hash, coordinates, date
    ui/
      tabs.js         category tab bar
      subtypes.js     type list with groups + search
      config.js       config panel
      results.js      results list + copy
      toast.js        notification
      theme.js        theme toggle (4 themes, localStorage)
docs/                   GitHub Pages static files (copy of app/)
```

---

## Deploying to GitHub Pages

This app is fully client-side and can be hosted on GitHub Pages without any backend.

### Option 1: Use the `docs/` folder (Recommended)

1. Copy all contents from `app/` to `docs/` folder
2. Go to Repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose `main` branch and `/docs` folder
5. Save

The app will be available at: `https://iamragavendrans.github.io/simple-test-data-generator/`

### Option 2: Deploy from root

1. Move all contents from `app/` to the repository root
2. Go to Repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose `main` branch and `/ (root)` folder
5. Save

### Note

- The Flask server (`server.py`, `api.py`) is only for local development
- The GitHub Pages version uses client-side JavaScript generation (all 28 types work!)
- API documentation (`api-docs.html`) demonstrates the backend API but requires running the Flask server locally

### ⚠️ Important: Local File Limitations

When opening `index.html` directly via `file://` (double-clicking the file):
- Some browsers block module imports due to CORS restrictions
- You may see a blank screen or errors in the console
- **Solution**: Use a local server for development:
  ```bash
  python server.py  # or start.bat on Windows
  ```
- GitHub Pages serves files via HTTP, which works perfectly!
