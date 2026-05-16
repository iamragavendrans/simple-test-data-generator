# app/ — Development source

This folder holds the development copy of the app. To run it:

```bash
# from the repo root
./run.sh                 # macOS / Linux
run.bat                  # Windows

# or directly from here, if you prefer
python3 server.py
python3 server.py --port 9000      # custom port
python3 server.py --no-browser     # don't open browser
```

See the [top-level README](../README.md) for the full guide, troubleshooting tips, and the REST API reference.

`docs/` is a byte-identical mirror of this folder, served by GitHub Pages — keep them in sync when editing.
