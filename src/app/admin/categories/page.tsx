import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { approveCategory, deleteCategory } from "@/lib/admin-actions";
import { prisma } from "@/lib/prisma";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { cardClass } from "@/lib/ui-styles";
import { AdminNav } from "../AdminNav";
import { CreateCategoryForm } from "./CreateCategoryForm";
import { EditCategoryForm } from "./EditCategoryForm";
import { CategoryPhotoUpload } from "../CategoryPhotoUpload";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect("/admin");

  const categories = await prisma.category.findMany({
    orderBy: [{ status: "asc" }, { label: "asc" }],
    include: { _count: { select: { coaches: true } } },
  });
  const pending = categories.filter((c) => c.status === "PENDING");
  const approved = categories.filter((c) => c.status === "APPROVED");

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <AdminNav active="/admin/categories" />

      <h1 className="text-2xl font-semibold tracking-tight">Catégories</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Créez, renommez ou supprimez des catégories, et gérez celles proposées par les coachs.
      </p>

      <div className={`mt-6 p-4 ${cardClass}`}>
        <CreateCategoryForm />
      </div>

      {pending.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-medium">
            En attente de validation ({pending.length})
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {pending.map((category) => (
              <li
                key={category.id}
                className={`flex flex-wrap items-center gap-3 p-4 ${cardClass}`}
              >
                <CategoryIcon category={category} size={36} />
                <span className="text-xs text-zinc-500">
                  {category._count.coaches} coach{category._count.coaches > 1 ? "s" : ""} en
                  attente
                </span>
                <div className="basis-full" />
                <EditCategoryForm category={category} />
                <form action={approveCategory.bind(null, category.id)}>
                  <Button type="submit" size="sm">
                    Approuver
                  </Button>
                </form>
                <form action={deleteCategory.bind(null, category.id)}>
                  <Button type="submit" variant="secondary" size="sm">
                    Rejeter
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-10 text-lg font-medium">Publiées ({approved.length})</h2>
      <ul className="mt-4 flex flex-col divide-y divide-black/[.08] dark:divide-white/[.08]">
        {approved.map((category) => (
          <li key={category.id} className="flex flex-wrap items-center gap-3 py-4">
            {category.photoUrl ? (
              <Image
                src={category.photoUrl}
                alt={category.label}
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <CategoryIcon category={category} size={40} />
            )}
            <EditCategoryForm category={category} />
            <CategoryPhotoUpload categoryId={category.id} />
            <span className="text-xs text-zinc-500">
              {category._count.coaches} coach{category._count.coaches > 1 ? "s" : ""}
            </span>
            <form action={deleteCategory.bind(null, category.id)} className="ml-auto">
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
