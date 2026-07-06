# My Dashboard — Project Manager

A personal, single-user project & task manager: projects with kanban boards, comments, file attachments, time tracking, and a reporting dashboard. Built with Next.js (App Router) and Supabase.

## Stack

- Next.js 16 (App Router, TypeScript, Server Actions)
- Supabase (Postgres + Storage), accessed server-side only via the service role key — no auth, single implicit user
- Tailwind CSS, Radix UI primitives
- `@dnd-kit` for the kanban drag-and-drop
- `recharts` for the reports charts

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the migration in `supabase/migrations/0001_init.sql` against your project (via the SQL editor, or the Supabase CLI: `supabase db push`). It creates the `projects`, `tasks`, `comments`, `activity_log`, `attachments`, and `time_entries` tables.
3. In Supabase Storage, create a **public or private bucket named `attachments`** (task file uploads go here; downloads are served through short-lived signed URLs, so the bucket does not need to be public).
4. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — the service role key (Project Settings → API). This key is only used server-side (Server Actions / Server Components) and must never be exposed to the browser.
5. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Dashboard** (`/`) — active project count, open tasks, hours logged this week, recent activity feed.
- **Projects** (`/projects`) — create/archive projects.
- **Kanban board** (`/projects/[id]`) — drag tasks between To Do / In Progress / Done columns.
- **Task detail** (`/projects/[id]/tasks/[taskId]`) — edit task fields, comments, time logging, file attachments, and a per-task activity log.
- **Reports** (`/reports`) — time tracked per project, tasks completed per week, open workload by assignee.

Since this is single-user, there's no authentication — all writes happen through Server Actions using the Supabase service role key, so keep the app itself behind whatever access control you deploy it with.
