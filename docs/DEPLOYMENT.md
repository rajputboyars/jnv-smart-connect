# Deployment Guide

This app ships in three ready-to-use forms: local dev, Docker Compose
(recommended for a single-JNV production deployment), and a managed
platform (Vercel + MongoDB Atlas). All three run the exact same code —
nothing is behind a build flag.

## 1. Environment variables

Copy `.env.example` to `.env.local` (dev) or provide the same keys as real
environment variables in your hosting platform. Required vs. optional:

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | **Yes** | Connection string, e.g. MongoDB Atlas SRV URI in production |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | **Yes** | 32+ byte random strings, must differ. Generate with `openssl rand -base64 48` |
| `APP_URL` | **Yes** | Your real deployed origin — used for reset-password links and the CSRF origin check |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | No | Default `15m` / `7d` |
| `PASSWORD_RESET_TOKEN_EXPIRES_MIN` | No | Default `30` |
| `SMTP_HOST`/`SMTP_PORT`/`SMTP_SECURE`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM` | No | If `SMTP_HOST` is unset, emails are skipped and logged to the console instead of failing the request |
| `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` | No | Enables signed photo uploads (Students/Teachers); the upload UI hides itself if unset |
| `ANTHROPIC_API_KEY` | No | Enables the AI features module; every AI endpoint 501s with a clear message if unset |
| `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD` | No | Only read by `npm run seed` |

Never commit `.env.local` or real secrets — `.gitignore` already excludes
`.env*` except `.env.example`.

## 2. Docker Compose (recommended)

The repo ships a multi-stage `Dockerfile` (deps → build → minimal runtime
image using Next.js `output: "standalone"`, so the final image doesn't carry
`node_modules` or the toolchain) and a `docker-compose.yml` with a MongoDB
service alongside the app.

```bash
# 1. Provide secrets docker-compose needs (it reads these from your shell env
#    or a .env file in the same directory — compose auto-loads .env).
cat > .env <<'EOF'
JWT_ACCESS_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
APP_URL=https://your-domain.example
EOF

# 2. Build and start.
docker compose up -d --build

# 3. Seed the first Super Admin (one-off, inside the running app container).
docker compose exec app node -e "require('tsx/cjs'); require('./scripts/seed.ts')" 2>/dev/null \
  || docker compose run --rm app npm run seed
```

The app listens on `:3000` inside the container, published as `3000:3000` —
put a reverse proxy (nginx, Caddy, Traefik) in front for TLS termination;
Next.js's own self-hosting guidance recommends this rather than exposing the
Node process directly to the internet.

MongoDB data persists in the `mongo_data` named volume across container
restarts/rebuilds.

### Updating

```bash
git pull
docker compose up -d --build
```

Compose recreates only the `app` service (image changed); `mongo`'s data
volume is untouched.

## 3. Managed platforms (Vercel + MongoDB Atlas)

1. Create a free/paid MongoDB Atlas cluster, allow-list the deployment
   platform's IPs (or `0.0.0.0/0` behind Atlas's own auth if using serverless
   compute with unpredictable egress IPs), and copy the SRV connection
   string into `MONGODB_URI`.
2. Import the repo into Vercel, set every variable from the table above in
   **Project Settings → Environment Variables** (mark secrets as such).
3. Vercel builds with `next build` automatically; no extra build command is
   needed. `output: "standalone"` is ignored on Vercel (it uses its own
   bundling) and is only relevant to the Docker path above.
4. Because `proxy.ts` runs in the **Node.js runtime** (Next.js 16 default),
   it deploys as a Vercel Function, not an Edge Function — the in-memory
   rate limiter works per-instance the same way it does in Docker, with the
   same single-instance caveat (see below).

## 4. Single-instance limitation (read this before scaling out)

`src/lib/security/rate-limit.ts` holds its sliding-window counters in a
plain in-memory `Map`. That is correct and sufficient for the initial
single-JNV, single-process deployment this app targets. If you later run
more than one instance behind a load balancer (either for a bigger school or
for [multi-tenant SaaS](./ROADMAP.md#multi-tenant-saas)), each instance gets
its own counters, silently raising the effective global rate limit. Swap the
`Map` for a shared store (Redis, `INCR`+`EXPIRE`) behind the same
`checkRateLimit()` function signature — no caller changes needed.

## 5. Health checks / process management

- `docker-compose.yml`'s `mongo` service has a `healthcheck`; `app` waits for
  it via `depends_on: condition: service_healthy`.
- For a bare Node deployment (no Docker), run behind a process manager
  (systemd, pm2) that restarts on crash, and send `SIGTERM` for graceful
  shutdown — Next.js finishes in-flight requests before exiting.
- There's no dedicated `/api/health` liveness endpoint yet (see
  [Roadmap](./ROADMAP.md)); until then, any authenticated `GET` (e.g.
  `/api/dashboard`) doubles as a readiness probe.

## 6. Logging & monitoring

Server-side errors are logged via `console.error` in
`src/middlewares/error-handler.ts` (tagged `[api-error]`) and security events
(failed logins, CSRF/rate-limit rejections) go to both `console.warn`/`error`
and the `ActivityLog` collection where relevant. In Docker/Vercel, container
stdout/stderr is already captured by the platform's own log aggregation —
wiring that into a dedicated APM/log shipper (Datadog, Better Stack, etc.) is
a deployment-specific choice left to the operator, not something this
codebase should hardcode a vendor for.
