-- Project Manager schema
create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text not null default '#6366f1',
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assignee text,
  due_date date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_project_id_idx on tasks(project_id);
create index if not exists tasks_status_idx on tasks(status);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_task_id_idx on comments(task_id);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  action_type text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_log_task_id_idx on activity_log(task_id);
create index if not exists activity_log_project_id_idx on activity_log(project_id);
create index if not exists activity_log_created_at_idx on activity_log(created_at desc);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  size bigint not null default 0,
  uploaded_at timestamptz not null default now()
);
create index if not exists attachments_task_id_idx on attachments(task_id);

create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes > 0),
  note text,
  logged_at timestamptz not null default now()
);
create index if not exists time_entries_task_id_idx on time_entries(task_id);

-- Single-user app: no auth, RLS left disabled. All access happens
-- through server-side code using the service role key.
