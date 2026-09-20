# Team & Student Performance Analytics Dashboard

An analytics workspace for tracking student performance, comparing team patterns, and generating actionable reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — managed Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (the managed workspace database is used for durable records)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/team-student-analytics/src/` — React dashboard pages, shell, charts, and theme
- `artifacts/api-server/src/routes/` — student CRUD, analytics aggregates, and report endpoints
- `lib/db/src/schema/students.ts` — source of truth for performance records
- `lib/api-spec/openapi.yaml` — source of truth for API contracts and generated hooks

## Architecture decisions

- The dashboard uses the shared managed Postgres database through Drizzle for durable CRUD data.
- API contracts are defined in OpenAPI and generated into React Query hooks and Zod schemas.
- Analytics are derived from student records at request time so edits immediately affect overview and team views.
- AI report endpoints return structured, score-aware recommendations; the current workspace uses a deterministic report fallback when AI credits are unavailable.

## Product

- Overview: score cards, switchable bar/area/pie scoreboard, subject radar, subject pulse, and individual report actions.
- Manage records: searchable create/edit/delete student performance records with strict 0–10 validation.
- Team view: group averages, contributor momentum, subject pulse, coverage heatmap, and team report generation.

## User preferences

- Keep the product professional, responsive, and easy to navigate.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- Restart the managed API and web workflows after backend or build configuration changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
