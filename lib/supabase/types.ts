export type ProjectStatus = "active" | "archived";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  created_at: string;
}

export type ProjectInsert = {
  id?: string;
  name: string;
  description?: string | null;
  color?: string;
  status?: ProjectStatus;
  created_at?: string;
}

export type ProjectUpdate = {
  id?: string;
  name?: string;
  description?: string | null;
  color?: string;
  status?: ProjectStatus;
  created_at?: string;
}

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export type TaskInsert = {
  id?: string;
  project_id: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string | null;
  due_date?: string | null;
  position?: number;
  created_at?: string;
  updated_at?: string;
}

export type TaskUpdate = {
  id?: string;
  project_id?: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string | null;
  due_date?: string | null;
  position?: number;
  created_at?: string;
  updated_at?: string;
}

export type Comment = {
  id: string;
  task_id: string;
  body: string;
  created_at: string;
}

export type CommentInsert = {
  id?: string;
  task_id: string;
  body: string;
  created_at?: string;
}

export type CommentUpdate = {
  id?: string;
  task_id?: string;
  body?: string;
  created_at?: string;
}

export type ActivityLogEntry = {
  id: string;
  task_id: string | null;
  project_id: string | null;
  action_type: string;
  detail: Record<string, unknown>;
  created_at: string;
}

export type ActivityLogInsert = {
  id?: string;
  task_id?: string | null;
  project_id?: string | null;
  action_type: string;
  detail?: Record<string, unknown>;
  created_at?: string;
}

export type ActivityLogUpdate = {
  id?: string;
  task_id?: string | null;
  project_id?: string | null;
  action_type?: string;
  detail?: Record<string, unknown>;
  created_at?: string;
}

export type Attachment = {
  id: string;
  task_id: string;
  file_name: string;
  storage_path: string;
  size: number;
  uploaded_at: string;
}

export type AttachmentInsert = {
  id?: string;
  task_id: string;
  file_name: string;
  storage_path: string;
  size?: number;
  uploaded_at?: string;
}

export type AttachmentUpdate = {
  id?: string;
  task_id?: string;
  file_name?: string;
  storage_path?: string;
  size?: number;
  uploaded_at?: string;
}

export type TimeEntry = {
  id: string;
  task_id: string;
  duration_minutes: number;
  note: string | null;
  logged_at: string;
}

export type TimeEntryInsert = {
  id?: string;
  task_id: string;
  duration_minutes: number;
  note?: string | null;
  logged_at?: string;
}

export type TimeEntryUpdate = {
  id?: string;
  task_id?: string;
  duration_minutes?: number;
  note?: string | null;
  logged_at?: string;
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
        Relationships: [];
      };
      activity_log: {
        Row: ActivityLogEntry;
        Insert: ActivityLogInsert;
        Update: ActivityLogUpdate;
        Relationships: [];
      };
      attachments: {
        Row: Attachment;
        Insert: AttachmentInsert;
        Update: AttachmentUpdate;
        Relationships: [];
      };
      time_entries: {
        Row: TimeEntry;
        Insert: TimeEntryInsert;
        Update: TimeEntryUpdate;
        Relationships: [];
      };
    };
    // Must stay a plain empty-object shape (not Record<string, never>):
    // postgrest-js intersects Schema['Tables'] & Schema['Views'], and a
    // blanket index signature here would turn every table type into `never`.
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
