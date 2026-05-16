![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Python](https://img.shields.io/badge/Python-3.7%2B-blue)
![Dependencies](https://img.shields.io/badge/Dependencies-zero-brightgreen)

# Test Data Generator · QA Tools

Pure-frontend test data generator with an optional REST API backend.
**29 data types** across **8 categories**, **4 themes**, **zero external dependencies**.

Includes a **JSON Schema → Payload** generator that turns a schema (or a JSON example) into realistic mock payloads — UUIDs, emails, prices, tokens — using key-name heuristics, JSON-Schema formats, `multipleOf`, `enum`, `oneOf`, `$ref`, and more.

---

## Live Demo

GitHub Pages (client-side, no backend needed):
**https://iamragavendrans.github.io/simple-test-data-generator/**

---

## Quick Start

You only need **Python 3.7+** — there is nothing to `pip install`. Just clone and run from the repo root:

### macOS / Linux

```bash
./run.sh
```

### Windows

```bat
run.bat
```

The browser opens automatically at `http://localhost:8080`.

> The launchers find your Python (`python3` → `python` → `py`), `cd` into the right directory, forward CLI flags, and auto-bump to the next free port if 8080 is already in use. Press **Ctrl+C** to stop.

### Run options

```bash
./run.sh --port 9000          # use a specific port
./run.sh --no-browser         # don't open the browser
PORT=9000 ./run.sh            # via environment variable
./run.sh --host 0.0.0.0       # listen on all interfaces (LAN access)
```

### Manual run (if launchers are unavailable)

```bash
python3 app/server.py                # or `python` / `py -3`
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `command not found: python` | Install Python 3.7+ from [python.org](https://www.python.org/downloads/), or use the launcher (`./run.sh` or `run.bat`) — it auto-detects `python3`/`python`/`py`. |
| `Port 8080 is in use` | The server now auto-picks the next free port (8081, 8082, …). To force one: `./run.sh --port 9000`. |
| Blank page when double-clicking `index.html` | Browsers block ES module imports over `file://`. Always use the launcher — it serves over HTTP. |
| Browser didn't open | Open the URL printed in the terminal manually, or pass `--no-browser` and click yourself. |
| Permission denied on `./run.sh` | `chmod +x run.sh` (already executable in the repo; this re-arms it). |

---

## REST API

The same server exposes a REST API at `http://localhost:8080/api/`. CORS is open.

```
GET   /api/categories                          — list all categories & types
GET   /api/types                                — flat list of all type IDs
GET   /api/generate?type={id}&count={n}&...    — generate via query string
POST  /api/generate  {type, count, options}    — generate via JSON body
```

Interactive docs: **http://localhost:8080/api-docs.html**

#### Generate UUIDs
```bash
curl "http://localhost:8000/api/generate?type=uuid&count=5"
```

#### Generate Strong Passwords
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"password","count":3,"options":{"length":32,"special":true}}'

# IPv6
curl "http://localhost:8080/api/generate?type=ip&count=3&version=ipv6"

# Japanese addresses
curl -X POST http://localhost:8080/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"address","count":5,"options":{"country":"JP"}}'
```

> **Note:** `json_schema` is browser-only — the schema walker lives entirely in JS so it can use the same generators the UI uses. It does not appear in `/api/types`.

---

## All 29 Types

| Category | Types |
|---|---|
| 🔑 Identifiers & Security | `uuid` `hash` `password` `username` |
| 👤 Contact & Identity | `name` `email` `phone` `address` `country` `city` `zipcode` `coordinates` |
| 💳 Financial & Sensitive | `credit_card` `ssn` `barcode` `isbn` |
| 🌐 Network & Web | `ip` `url` `mac_address` `imei` |
| 🕐 Time & Text | `date` `datetime` `sentence` `paragraph` |
| 🎨 Colors | `hex_color` `rgb_color` |
| 🏢 Work & Organization | `company` `job` |
| 📋 Schema | `json_schema` (browser-only) |

---

## JSON Schema → Payload

Paste a JSON Schema (draft-07) **or** any JSON example. The walker auto-detects which mode it's in.

```json
{
  "type": "object",
  "properties": {
    "id":           { "type": "string", "format": "uuid" },
    "accessToken":  { "type": "string" },
    "email":        { "type": "string", "format": "email" },
    "price":        { "type": "number" },
    "rating":       { "type": "number" },
    "expiresIn":    { "type": "integer" },
    "tokenType":    { "type": "string", "enum": ["Bearer"] }
  },
  "required": ["id", "accessToken", "email"]
}
```

Produces credible output:

```json
{
  "id": "b0bbc742-5ea4-4f72-9051-ef455a6af0a3",
  "accessToken": "60fd2207cd45d8d00e12e326015d0941638dc7a539476576e3dbf6386881b840",
  "email": "casey465@example.com",
  "price": 1826.36,
  "rating": 4.2,
  "expiresIn": 25000,
  "tokenType": "Bearer"
}
```

Supported schema keywords: `type`, `enum`, `const`, `oneOf`, `anyOf`, `allOf`, `$ref` (internal pointers), `properties`, `required`, `items` (incl. tuple), `minItems` / `maxItems`, `uniqueItems`, `minLength` / `maxLength`, `pattern` (alphanumeric placeholder), `minimum` / `maximum` / `exclusive*`, `multipleOf`, `additionalProperties`, `example`, `examples`, `default`.

Supported string `format`s: `uuid`, `email` (incl. `idn-email`), `uri` / `url` / `uri-reference`, `date`, `date-time`, `time`, `ipv4`, `ipv6`, `hostname` (incl. `idn-hostname`), `password`, `binary` / `byte`.

A lenient pre-parser recovers from common JSON mistakes (single quotes, trailing commas, unquoted keys, `//` and `/* */` comments) before it errors.

---

## Themes

Click the theme button (top-right) to cycle:

| Theme | Mood |
|-------|------|
| 🌙 Dark | Classic deep navy (default) |
| ☀️ Light | Clean white with subtle shadows |
| 🔮 Purple | Rich purple-violet gradients |
| 🌌 Midnight | Deep blue with cyan accents |

Theme preference is saved in `localStorage` and persists across browser reloads.

---

## Requirements

- **Python 3.7+** — stdlib only, nothing to install
- A modern browser — Chrome 90+, Firefox 90+, Safari 15.4+, Edge 90+

---

## Project Layout

```
.
├── run.sh                  Launcher (macOS / Linux)
├── run.bat                 Launcher (Windows)
├── README.md
├── LICENSE
│
├── app/                    Development copy (run from here)
│   ├── index.html
│   ├── api-docs.html
│   ├── server.py           HTTP + API dev server (stdlib only)
│   ├── api.py              Python re-implementation of the 28 generators
│   ├── start.bat           Legacy Windows launcher (use ../run.bat instead)
│   └── js/
│       ├── app.js, store.js, utils.js
│       ├── data/           categories.js, datasets.js
│       ├── generators/     identifiers, contact, financial, network,
│       │                   time_text, colors, work, extras, schema, index
│       └── ui/             tabs, subtypes, config, results, toast, theme
│
└── docs/                   GitHub Pages mirror of app/ (byte-identical)
```

> `docs/` is a mirror of `app/`. Anything you change in `app/` should be copied to `docs/` so the Pages site stays in sync.

---

## Deploying to GitHub Pages

The app is fully client-side and can be hosted on GitHub Pages without a backend.

1. Make sure your changes are mirrored into `docs/` (the `docs/` folder is what Pages serves).
2. **Repository Settings → Pages**
3. Source: **Deploy from a branch**, branch `main`, folder `/docs`. Save.

The site goes live at `https://<your-user>.github.io/<repo>/`. The `json_schema` type and all 28 client-side types work; the Python REST API is local-only.

---

## License

[MIT](./LICENSE)
