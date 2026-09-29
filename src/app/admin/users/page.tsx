import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteCoach, deleteStudent } from "@/lib/admin-actions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { cardClass } from "@/lib/ui-styles";
import { AdminNav } from "../AdminNav";
import { EditStudentForm } from "./EditStudentForm";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "text-emerald-600 dark:text-emerald-400",
  PENDING: "text-amber-600 dark:text-amber-400",
};

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Publié",
  PENDING: "En attente",
};

export default async function AdminUsersPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect("/admin");

  const [coaches, students] = await Promise.all([
    prisma.coach.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.student.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <AdminNav active="/admin/users" />

      <h1 className="text-2xl font-semibold tracking-tight">
        Coachs ({coaches.length})
      </h1>
      <ul className="mt-4 flex flex-col gap-3">
        {coaches.map((coach) => (
          <li key={coach.id} className={`flex items-center gap-4 p-4 ${cardClass}`}>
            {coach.photoUrl ? (
              <Image
                src={coach.photoUrl}
                alt={coach.name}
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 font-medium text-brand dark:bg-brand/20">
                {coach.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <Link href={`/admin/coachs/${coach.id}`} className="font-medium hover:underline">
                {coach.name}
              </Link>
              <p className="truncate text-sm text-zinc-500">{coach.email}</p>
            </div>
            <span className={`shrink-0 text-xs font-medium ${STATUS_STYLES[coach.status]}`}>
              {STATUS_LABELS[coach.status]}
            </span>
            <Link
              href={`/admin/coachs/${coach.id}`}
              className="shrink-0 text-xs font-medium text-brand hover:text-brand-hover"
            >
              Voir le détail
            </Link>
            <form action={deleteCoach.bind(null, coach.id)}>
              <Button type="submit" variant="secondary" size="sm">
                Supprimer
              </Button>
            </form>
          </li>
        ))}
      </ul>

      <h1 className="mt-12 text-2xl font-semibold tracking-tight">
        Élèves ({students.length})
      </h1>
      <ul className="mt-4 flex flex-col gap-3">
        {students.map((student) => (
          <li
            key={student.id}
            className={`flex flex-wrap items-center gap-3 p-4 ${cardClass}`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 font-medium text-brand dark:bg-brand/20">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <EditStudentForm student={student} />
            <form action={deleteStudent.bind(null, student.id)} className="ml-auto">
              <Button type="submit" variant="secondary" size="sm">
                Supprimer
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
