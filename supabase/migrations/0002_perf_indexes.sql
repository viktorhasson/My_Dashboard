-- Performance indexes for common query patterns

-- Kanban board and dashboard filter tasks by project_id + status together,
-- and kanban orders by project_id + position; single-column indexes on
-- project_id/status alone don't serve these composite filters well.
create index if not exists tasks_project_id_status_idx on tasks(project_id, status);
create index if not exists tasks_project_id_position_idx on tasks(project_id, position);

-- Dashboard filters time_entries by logged_at (gte weekAgo); reports also
-- reads time_entries in bulk. No index existed on logged_at at all.
create index if not exists time_entries_logged_at_idx on time_entries(logged_at desc);

-- Task detail page always orders comments by created_at within a task_id.
create index if not exists comments_task_id_created_at_idx on comments(task_id, created_at);
