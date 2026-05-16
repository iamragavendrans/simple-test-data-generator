"""
server.py — local dev server for Test Data Generator.
  • Serves static files (the app)
  • Routes /api/* to api.py handlers
  • Auto-opens browser (disable with --no-browser)
  • Picks the next free port if the requested one is busy
  • Uses only Python stdlib
"""

import argparse
import http.server
import os
import socket
import sys
import threading
import webbrowser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from api import handle_api

DEFAULT_HOST = "localhost"
DEFAULT_PORT = 8080


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


def find_free_port(host, start, attempts=20):
    """Probe `attempts` ports starting at `start`; return the first free one."""
    for p in range(start, start + attempts):
        try:
            s = socket.socket()
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind((host, p))
            s.close()
            return p
        except OSError:
            continue
    return None


def main():
    ap = argparse.ArgumentParser(
        description="Test Data Generator local dev server.",
        epilog="Examples:\n"
               "  python3 server.py                 # default port 8080\n"
               "  python3 server.py --port 9000     # custom port\n"
               "  python3 server.py --no-browser    # don't open browser\n"
               "  PORT=9000 python3 server.py       # via env var\n",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("--port", "-p", type=int,
                    default=int(os.environ.get("PORT", DEFAULT_PORT)),
                    help=f"port to listen on (default: {DEFAULT_PORT})")
    ap.add_argument("--host", default=os.environ.get("HOST", DEFAULT_HOST),
                    help=f"host to bind (default: {DEFAULT_HOST})")
    ap.add_argument("--no-browser", action="store_true",
                    help="don't auto-open the browser")
    args = ap.parse_args()

    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    port = args.port
    try:
        server = http.server.HTTPServer((args.host, port), AppHandler)
    except OSError:
        free = find_free_port(args.host, port + 1)
        if free is None:
            print(f"\n  Port {port} is in use and no free port was found in the next 20.")
            print(f"  Try a specific port:  python3 server.py --port 9000\n")
            sys.exit(1)
        print(f"\n  Port {port} is in use — using port {free} instead.")
        port = free
        server = http.server.HTTPServer((args.host, port), AppHandler)

    url = f"http://{args.host}:{port}"
    if not args.no_browser:
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()

    print()
    print("  ╔═══════════════════════════════════════════════╗")
    print("  ║         Test Data Generator · QA Tools        ║")
    print("  ╚═══════════════════════════════════════════════╝")
    print()
    print(f"  App         →  {url}")
    print(f"  REST API    →  {url}/api/")
    print(f"  API docs    →  {url}/api-docs.html")
    print()
    print("     Press Ctrl+C to stop.")
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped. Goodbye!\n")
        server.server_close()


if __name__ == "__main__":
    main()
