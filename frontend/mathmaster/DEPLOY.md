# MathMaster Web

React 19 + Vite + TypeScript SPA. Talks to the Django backend at `VITE_API_URL`.

## Local development

```bash
npm install
cp .env.example .env          # set VITE_API_URL if backend isn't on :8000
npm run dev                   # http://localhost:5173
```

`VITE_USE_MOCKS=true` runs the whole app on canned data — useful for UI work without a backend.

## Production build

```bash
npm run typecheck
npm run build                 # outputs dist/
```

**Important:** `VITE_*` variables are baked into the bundle at build time.
Set them in the environment (or `.env`) **before** building:

```bash
VITE_API_URL=https://api.mathmaster.app VITE_USE_MOCKS=false npm run build
```

## Deploy options

### Option A — nginx container (recommended, same-origin)

Serves `dist/` and proxies `/api/*` to the backend container — no CORS
needed, and SSE streaming works (buffering off for `/api/`):

```bash
npm run build
docker compose -f docker-compose.web.yml up -d --build web
# App on http://localhost:8080, API proxied to the backend on the same network
```

`docker-compose.web.yml` expects to join the backend's compose network.
If the backend runs in another project, add:

```yaml
networks:
  default:
    name: mathmaster_default
    external: true
```

Or run it alongside `docker-compose.prod.yml` — the nginx config proxies
to `http://api:8000` by service name.

### Option B — any static host (Vercel / Netlify / Cloudflare Pages)

1. Build with the production `VITE_API_URL`.
2. Upload `dist/`.
3. **Add an SPA rewrite rule** — all routes must serve `index.html`
   (Vercel: `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`).
4. Add the deployed origin to the backend's `CORS_ALLOWED_ORIGINS`.

### Option C — serve from Django (Whitenoise)

The backend already has Whitenoise configured. Copy `dist/*` into the
path Django serves as static files and run `collectstatic` — simplest
single-origin deployment.

## Deployment checklist

- [ ] `npm run typecheck` clean
- [ ] `npm run build` succeeds
- [ ] `VITE_API_URL` points at the **public** API URL (not 127.0.0.1)
- [ ] Backend `CORS_ALLOWED_ORIGINS` includes the deployed origin (skip if same-origin via proxy)
- [ ] Backend `ALLOWED_HOSTS` includes the API host
- [ ] Backend served over HTTPS (clients send Bearer tokens)
- [ ] SPA fallback configured (Option B) or nginx `try_files` (Option A)
- [ ] `VITE_USE_MOCKS=false` — mock mode must never reach production
