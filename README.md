![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
[![Python Version](https://img.shields.io/badge/Python-3.7%2B-blue)](https://www.python.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-green)](https://github.com/iamragavendran/simple-test-data-generator)

# Test Data Generator · QA Tools v3

A powerful, pure-frontend test data generator with a full REST API backend. Generate realistic fake data for testing, development, and QA purposes.

**28 data types · 7 categories · 4 themes · Zero external dependencies**

---

## Table of Contents

- [Features](#features)
- [Use Cases](#use-cases)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [All 28 Data Types](#all-28-data-types)
- [Themes](#themes)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Features

- 🌐 **Web Interface** - Beautiful, intuitive UI for generating test data
- 🔌 **REST API** - Programmatic access for automation and integration
- 🎨 **4 Themes** - Dark, Light, Purple, and Midnight themes
- 📦 **Zero Dependencies** - Uses only Python standard library
- 🚀 **Fast & Lightweight** - Pure vanilla JavaScript frontend
- 🔒 **Privacy-Focused** - All data generated locally, no external calls

---

## Use Cases

### 1. Software Development & Testing
- Generate fake user data for testing registration forms
- Create test datasets for database seeding
- Produce sample data for unit and integration tests
- Mock API responses during development

### 2. QA & Quality Assurance
- Generate test data for QA automation scripts
- Create diverse test scenarios with various data types
- Populate staging environments with realistic data
- Test input validation and error handling

### 3. Database Seeding
- Seed development databases with realistic data
- Create sample records for demonstrations
- Generate bulk data for performance testing

### 4. Content Generation
- Generate placeholder content for mockups
- Create sample emails, addresses, and phone numbers
- Produce Lorem Ipsum alternatives (sentences, paragraphs)

### 5. Security Testing
- Test password strength validation
- Validate credit card number processing
- Generate hash values for encryption testing
- Test input sanitization and XSS prevention

### 6. CI/CD Pipelines
- Integrate with automated testing pipelines
- Generate fresh data for each test run
- Support containerized test environments

### 7. Education & Learning
- Teach database concepts with realistic examples
- Demonstrate data modeling with various data types
- Practice API integration with REST endpoints

---

## Quick Start

### Windows

```bash
# Option 1: Using batch file
start.bat

# Option 2: Direct Python
cd app
python server.py
```

### macOS / Linux

```bash
cd app
python3 server.py
```

The browser will automatically open at **http://localhost:8000**

---

## Installation

### Prerequisites

- Python 3.7 or higher
- Modern browser (Chrome 90+, Firefox 90+, Safari 15.4+, Edge 90+)

### Steps

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/iamragavendran/simple-test-data-generator.git
   cd simple-test-data-generator
   ```

2. **Run the application**
   ```bash
   # Windows
   start.bat
   
   # macOS / Linux
   cd app
   python3 server.py
   ```

3. **Open in browser**
   Navigate to: http://localhost:8000

### Alternative: Using a Different Port

If port 8000 is already in use, you can change the port in `app/server.py`:

```python
# Edit line 19 in app/server.py
PORT = 9000  # or any available port
```

---

## API Documentation

The server exposes a REST API at **http://localhost:8000/api/**

### Base URL

```
http://localhost:8000/api/
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories and their types |
| GET | `/api/types` | Get a flat list of all 28 type IDs |
| GET | `/api/generate` | Generate data via query parameters |
| POST | `/api/generate` | Generate data via JSON body |

### Interactive Documentation

Visit **http://localhost:8000/api-docs.html** for the interactive API documentation.

---

### Examples

#### Generate UUIDs
```bash
curl "http://localhost:8000/api/generate?type=uuid&count=5"
```

#### Generate Strong Passwords
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"password","count":3,"options":{"length":32,"special":true}}'
```

#### Generate MAC Address with Custom Separator
```bash
curl "http://localhost:8000/api/generate?type=mac_address&count=5&separator=-"
```

#### Generate IPv6 Addresses
```bash
curl "http://localhost:8000/api/generate?type=ip&count=3&version=ipv6"
```

#### Generate EU-Format Dates (1990-2024)
```bash
curl "http://localhost:8000/api/generate?type=date&count=5&format=eu&from_year=1990&to_year=2024"
```

#### Generate Japanese Addresses
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"address","count":5,"options":{"country":"JP"}}'
```

---

## All 28 Data Types

| Category | Types |
|----------|-------|
| 🔑 Identifiers & Security | `uuid`, `hash`, `password`, `username` |
| 👤 Contact & Identity | `name`, `email`, `phone`, `address`, `country`, `city`, `zipcode`, `coordinates` |
| 💳 Financial & Sensitive | `credit_card`, `ssn`, `barcode`, `isbn` |
| 🌐 Network & Web | `ip`, `url`, `mac_address`, `imei` |
| 🕐 Time & Text | `date`, `datetime`, `sentence`, `paragraph` |
| 🎨 Colors | `hex_color`, `rgb_color` |
| 🏢 Work & Organization | `company`, `job` |

---

## Themes

Click the theme button (top-right of the app) to switch between:

| Theme | Mood |
|-------|------|
| 🌙 Dark | Classic deep navy (default) |
| ☀️ Light | Clean white with subtle shadows |
| 🔮 Purple | Rich purple-violet gradients |
| 🌌 Midnight | Deep blue with cyan accents |

Theme preference is saved in `localStorage` and persists across browser reloads.

---

## Project Structure

```
simple-test-data-generator/
├── README.md                 # This file
├── LICENSE                   # MIT License
├── requirements.txt          # Dependencies (none required)
└── app/
    ├── server.py            # HTTP server (static files + API routing)
    ├── api.py               # All 28 Python generators + REST handler
    ├── index.html           # Web UI with 4 theme CSS blocks
    ├── api-docs.html        # Interactive API documentation
    ├── start.bat            # Windows launcher
    └── js/
        ├── app.js           # Application entry point
        ├── store.js         # Reactive state management
        ├── utils.js         # Utility functions
        ├── data/
        │   ├── categories.js # Taxonomy (7 categories, 28 types)
        │   └── datasets.js  # Static data arrays
        ├── generators/
        │   ├── index.js     # Dispatcher
        │   ├── identifiers.js
        │   ├── contact.js
        │   ├── financial.js
        │   ├── network.js
        │   ├── time_text.js
        │   ├── colors.js
        │   ├── work.js
        │   └── extras.js
        └── ui/
            ├── tabs.js
            ├── subtypes.js
            ├── config.js
            ├── results.js
            ├── toast.js
            └── theme.js
```

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new data types
- 📖 Improve documentation
- 🎨 Add new themes
- 🔧 Submit pull requests

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 iamragavendran

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Support

If you find this project useful, please consider:

- ⭐ Starring the repository
- 🐦 Sharing it with others
- 💖 Sponsoring the developer

---

**Built with ❤️ for developers and QA engineers**

*Generate test data quickly, test thoroughly, ship confidently!*
