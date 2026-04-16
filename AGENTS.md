# AGENTS.md

## Cursor Cloud specific instructions

This is a **zero-dependency static web application** (Year Progress Calendar) built with p5.js and Tweakpane, both loaded from CDN. There is no build step, no package manager, and no backend.

### Running the app

Serve the project root with any static HTTP server. For example:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in a browser. Do **not** open `index.html` via `file://` — p5.js `loadImage()` requires HTTP.

### Key notes

- The app loads **p5.js** from `cdnjs.cloudflare.com` and **Tweakpane** from `cdn.jsdelivr.net` at runtime, so internet access is required.
- A vendored copy of `p5.js` exists at the repo root but is **not** referenced by `index.html`.
- There is no linter, test framework, or build system configured in this repo.
- The canvas is fixed at 600×600 pixels. URL parameters (`?color=blue`, `?showUI=false`, `?showWeeks=true`, `?showDays=true`) control appearance — see `README.md` for full details.
