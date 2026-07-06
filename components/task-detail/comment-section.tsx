"use client";

import { useRef, useTransition } from "react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addComment } from "@/app/projects/[id]/tasks/[taskId]/actions";
import type { Comment } from "@/lib/supabase/types";

export function CommentSection({
  taskId,
  projectId,
  comments,
}: {
  taskId: string;
  projectId: string;
  comments: Comment[];
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addComment(taskId, projectId, formData);
      formRef.current?.reset();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Comments</h3>
      <div className="flex flex-col gap-2">
        {comments.length === 0 && <p className="text-xs text-neutral-500">No comments yet.</p>}
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-md bg-neutral-100 p-2 text-sm dark:bg-neutral-800">
            <p>{comment.body}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2">
        <Textarea name="body" placeholder="Add a comment..." rows={2} required />
        <Button type="submit" size="sm" disabled={pending} className="self-start">
          {pending ? "Posting..." : "Post comment"}
        </Button>
      </form>
    </div>
  );
}
