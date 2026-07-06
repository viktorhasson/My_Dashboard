# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A personal, single-user project & task manager: projects with kanban boards, task comments, file attachments, time tracking, and a reports dashboard. Next.js 16 (App Router, TypeScript, Server Actions) + Supabase (Postgres + Storage). There is deliberately **no authentication and no RLS** — all database access happens server-side with the service role key, and the app is expected to be protected by whatever access control it's deployed behind.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm run lint       # eslint (flat config, eslint-config-next)
```

There is no test suite or test runner configured.

Running against a real database requires `.env.local` (copy from `.env.local.example`) with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. `npm run build` succeeds without these env vars — the Supabase client is lazily initialized (see below) — but any page render that queries the database will throw.

## Architecture

### Data access is server-only

- `lib/supabase/server.ts` exports `supabaseServer`, a lazily-initialized singleton Supabase client using the **service role key**. The module imports `server-only`, so importing it from client code is a build error. The lazy `Proxy` wrapper exists so importing the module during build-time page data collection doesn't require env vars — don't replace it with an eager `createClient` call.
- There is **no browser Supabase client** and no `NEXT_PUBLIC` anon key. Client components never talk to Supabase directly; they call Server Actions.
- There are no API routes — all reads happen in Server Components, all writes in Server Actions.

### Mutation pattern (follow it for new writes)

Server Actions live in `actions.ts` files colocated with the route that uses them (`app/projects/actions.ts`, `app/projects/[id]/tasks/actions.ts`, `app/projects/[id]/tasks/[taskId]/actions.ts`). Every action follows the same shape:

1. Extract and validate fields from `FormData` (throw `Error` on invalid input).
2. Write via `supabaseServer`, throwing `error.message` on failure.
3. Call `logActivity(...)` from `lib/activity.ts` — **every write is recorded in the `activity_log` table**; the dashboard's activity feed and per-task history depend on this.
4. `revalidatePath(...)` for each page whose data changed (kanban/task changes usually also revalidate `/` and sometimes `/reports`).

### Rendering pattern

Pages are Server Components that fetch with `supabaseServer` and pass data down to `"use client"` components (e.g. `KanbanBoard`, dialogs, `reports-charts`), which mutate via Server Actions inside `useTransition`. Data-driven pages export `const dynamic = "force-dynamic"`. Route `params` is a `Promise` and must be awaited.

Routes: `/` (dashboard), `/projects`, `/projects/[id]` (kanban board), `/projects/[id]/tasks/[taskId]` (task detail), `/reports`.

### Database schema and types

- Schema lives in `supabase/migrations/0001_init.sql` (tables: `projects`, `tasks`, `comments`, `activity_log`, `attachments`, `time_entries`). Migrations are applied manually (Supabase SQL editor or `supabase db push`) — there is no migration runner in the app.
- `lib/supabase/types.ts` is **hand-maintained**, not generated. Any schema change requires updating both the migration SQL and the `Row`/`Insert`/`Update` types plus the `Database` type there. Keep the `Views`/`Functions`/etc. shapes as `Record<never, never>` — the comment in that file explains why a broader index signature breaks postgrest-js inference.
- Status/priority values are `text` columns with `check` constraints, mirrored as string-literal unions (`TaskStatus`, `TaskPriority`, `ProjectStatus`) in the types file.

### File attachments

Uploads go to the Supabase Storage bucket named `attachments` (path `{taskId}/{timestamp}-{filename}`), with a row in the `attachments` table. Downloads are served through short-lived signed URLs (`getAttachmentUrl`, 10-minute expiry), so the bucket doesn't need to be public.

### UI conventions

- `components/ui/` contains shadcn-style primitives (Button, Card, Dialog, Badge, Input) built with `class-variance-authority` and Radix; compose classes with `cn()` from `lib/utils.ts`.
- Feature components live directly in `components/` (`kanban-board`, `task-card`, dialogs) and `components/task-detail/`, `components/reports/`.
- Kanban drag-and-drop uses `@dnd-kit`; charts use `recharts`; icons use `lucide-react`. Styling is Tailwind CSS v4 (via `@tailwindcss/postcss`, no `tailwind.config` file) with `dark:` variants throughout.
- Path alias: `@/*` maps to the repo root.
