# AGENTS.md

## Architecture
- `public/index.html` is the whole UI: a single static page with inline CSS/JS, styled with the Tailwind Play CDN. Keep it build-free.
- `netlify/functions/scan.mts` (v2 function, path `/api/scan`): POST `{ image: base64, mimeType }` returns `{ query, labelPl, alternatives[] }`. It uses `@google/genai` with a zero-config constructor; Netlify AI Gateway injects credentials.
- `netlify.toml` publishes `public/`.

## Conventions
- UI copy is in Polish. AI search queries are in English, because the model platforms index English titles.
- Any user or AI text placed in `innerHTML` must go through `escapeHtml`. Result buttons use `data-platform` / `data-query` with one delegated click handler. Don't use inline `onclick` with interpolated strings.
- Photos are downscaled to 1024px JPEG in the browser before upload, which keeps requests under function body limits.
- There is no persistence. The only thing stored is the theme choice, in `localStorage` (`pf-theme`).
