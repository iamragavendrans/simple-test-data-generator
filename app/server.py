"""
server.py — local dev server for Test Data Generator v3.
  • Serves static files (the app)
  • Routes /api/* to api.py handlers (all 28 generators)
  • Suppresses HTTP logs
  • Auto-opens browser
  • Uses only Python stdlib
"""

import http.server
import webbrowser
import threading
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from api import handle_api

PORT = 8080
HOST = "localhost"


class AppHandler(http.server.SimpleHTTPRequestHandler):

    def do_OPTIONS(self):
        if self.path.startswith("/api/"):
            handle_api(self, "OPTIONS", self.path, b"")
        else:
            super().do_OPTIONS()

    def do_GET(self):
        if self.path.startswith("/api/"):
            handle_api(self, "GET", self.path, b"")
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            length = int(self.headers.get("Content-Length", 0))
            body   = self.rfile.read(length) if length else b""
            handle_api(self, "POST", self.path, body)
        else:
            self.send_error(405, "Method Not Allowed")

    def log_message(self, format, *args): pass
    def log_error(self,   format, *args): pass


def open_browser():
    webbrowser.open(f"http://{HOST}:{PORT}")


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    try:
        server = http.server.HTTPServer((HOST, PORT), AppHandler)
    except OSError:
        print(f"\n  ✗ Port {PORT} is already in use.\n    Edit PORT in server.py to change it.\n")
        sys.exit(1)

    threading.Timer(0.4, open_browser).start()

    print()
    print("  ╔═══════════════════════════════════════════════╗")
    print("  ║     Test Data Generator · QA Tools  v3        ║")
    print("  ╚═══════════════════════════════════════════════╝")
    print()
    print(f"  ✓  App   →  http://{HOST}:{PORT}")
    print(f"  ✓  API   →  http://{HOST}:{PORT}/api/")
    print()
    print("     Endpoints:")
    print("       GET  /api/categories")
    print("       GET  /api/types")
    print("       GET  /api/generate?type=uuid&count=10")
    print("       POST /api/generate  {type, count, options}")
    print()
    print("     Press Ctrl+C to stop.")
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped. Goodbye!\n")
        server.server_close()
