# R:R Journal

A dark-themed trading journal for forex/futures traders to log trades, write reflections, and track performance metrics like win rate, expectancy, and equity curve.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/trading-journal run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — secret for express-session cookie signing

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + express-session + connect-pg-simple + bcryptjs
- DB: PostgreSQL + Drizzle ORM
- Frontend: React + Vite (single TradingJournal.tsx component)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/trading-journal/src/TradingJournal.tsx` — entire frontend UI (1100+ lines)
- `artifacts/api-server/src/routes/` — auth, trades, journals, no-trade-days routes
- `lib/db/src/schema/index.ts` — Drizzle schema (users, trades, journals, no_trade_days)

## Architecture decisions

- All UI lives in a single `TradingJournal.tsx` component — this was the design from the original file, preserved as-is
- Session auth (not JWT) — sessions stored in `session` table via connect-pg-simple
- Frontend uses raw `fetch` to `/api/...` — no codegen hooks, by design of the original component
- All tables scoped by `user_id` — multi-user safe

## Product

- Traders register/login, then log trades with pair, direction, session, setup, R:R, and outcome
- Dashboard shows equity curve, win rate, expectancy, profit factor, max drawdown
- Calendar view shows daily/weekly P&L
- Journal entries capture mood, mental/discipline scores, and lessons learned
- Reports break down performance by daily/weekly/monthly period
- No-trade days can be logged with a reason
- CSV export of all trades

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/db run push` after schema changes before restarting the API server
- SESSION_SECRET must be set — falls back to a dev placeholder but this is insecure in production
- The trading journal frontend does NOT use React Query hooks — it uses raw fetch directly

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
