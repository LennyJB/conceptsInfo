"use client";

import { useActionState } from "react";
import type { Student } from "@prisma/client";
import { updateStudentAdmin, type UpdateStudentAdminState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/lib/ui-styles";

const initialState: UpdateStudentAdminState = {};

export function EditStudentForm({ student }: { student: Student }) {
  const [state, formAction, pending] = useActionState(
    updateStudentAdmin.bind(null, student.id),
    initialState
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input name="name" defaultValue={student.name} required className={`w-36 ${inputClass}`} />
      <input
        name="email"
        type="email"
        defaultValue={student.email}
        required
        className={`w-52 ${inputClass}`}
      />
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "..." : "Enregistrer"}
      </Button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
