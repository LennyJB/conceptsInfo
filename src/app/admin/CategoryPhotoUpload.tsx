"use client";

import { useActionState } from "react";
import { uploadCategoryPhoto, type UploadCategoryPhotoState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/Button";

const initialState: UploadCategoryPhotoState = {};

export function CategoryPhotoUpload({ categoryId }: { categoryId: string }) {
  const [state, formAction, pending] = useActionState(
    uploadCategoryPhoto.bind(null, categoryId),
    initialState
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        type="file"
        name="photo"
        accept="image/jpeg,image/png,image/webp"
        required
        className="max-w-[160px] text-xs"
      />
      <Button type="submit" size="sm" disabled={pending} className="shrink-0">
        {pending ? "..." : "Envoyer"}
      </Button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
