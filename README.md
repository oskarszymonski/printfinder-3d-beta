# PrintFinder 3D

A Polish-language search hub for 3D-printable models. Type a model name to get direct search links on MakerWorld, Printables, Thingiverse, Cults3D, Thangs and Yeggi. You can also drop in a photo of an object: AI identifies it and builds matching search links for every platform.

## Tech

- Plain static HTML in `public/index.html` (Tailwind CDN, Lucide icons, Google Fonts). There is no frontend build step.
- `netlify/functions/scan.mts` is a Netlify Function at `/api/scan`. It sends the uploaded photo to Gemini (`gemini-3-flash-preview`) through Netlify AI Gateway and returns a search query. No API key is needed.

## Run locally

```bash
npm install
netlify dev
```
