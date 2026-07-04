# Games

An online games platform, currently in **live development**. Deployed on Cloudflare Workers (static assets).

## Structure

```
public/
  index.html      Landing page ("Live Development")
  styles.css
  games/          Individual games live here (one folder each)
wrangler.jsonc    Cloudflare Workers config
```

## Develop locally

```bash
npm install
npm run dev        # serves public/ at http://localhost:8787
```

## Deploy

```bash
npm run deploy     # wrangler deploy → games.<subdomain>.workers.dev
```

## Adding a game

Drop a folder into `public/games/<game-name>/` with its own `index.html`.
It will be served at `/games/<game-name>/`. Then link it from the landing page.

## Changelog

### 2026-07-04 — Project bootstrap

- Created Games platform scaffold on Cloudflare Workers static assets
- Landing page with "Live Development" status banner and placeholder game slots
- Wired up GitHub repo and Cloudflare deployment
