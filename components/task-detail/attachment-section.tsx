"use client";

import { useRef, useTransition } from "react";
import { Paperclip, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAttachment, getAttachmentUrl } from "@/app/projects/[id]/tasks/[taskId]/actions";
import type { Attachment } from "@/lib/supabase/types";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentSection({
  taskId,
  projectId,
  attachments,
}: {
  taskId: string;
  projectId: string;
  attachments: Attachment[];
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await uploadAttachment(taskId, projectId, formData);
      formRef.current?.reset();
    });
  }

  async function handleDownload(storagePath: string) {
    const url = await getAttachmentUrl(storagePath);
    window.open(url, "_blank");
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Attachments</h3>
      <div className="flex flex-col gap-2">
        {attachments.length === 0 && <p className="text-xs text-neutral-500">No files attached.</p>}
        {attachments.map((attachment) => (
          <div key={attachment.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-2 text-sm dark:border-neutral-800">
            <span className="flex items-center gap-2">
              <Paperclip className="h-3.5 w-3.5" />
              {attachment.file_name}
              <span className="text-xs text-neutral-500">({formatSize(attachment.size)})</span>
            </span>
            <Button variant="ghost" size="icon" onClick={() => handleDownload(attachment.storage_path)}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <form ref={formRef} action={handleSubmit} className="flex items-center gap-2">
        <input
          name="file"
          type="file"
          required
          className="text-xs text-neutral-500 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-2 file:py-1 file:text-xs dark:file:bg-neutral-800"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
}
