import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCoach } from "@/lib/coach-auth";
import { getCurrentStudent } from "@/lib/student-auth";
import { getBrowsableCategories } from "@/lib/categories";
import { inlineLinkClass, textLinkClass } from "@/lib/ui-styles";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

export default async function SignupPage(props: PageProps<"/compte/inscription">) {
  const searchParams = await props.searchParams;
  const redirectTo =
    typeof searchParams.redirect === "string" && searchParams.redirect.startsWith("/")
      ? searchParams.redirect
      : "/compte";
  const defaultRole = searchParams.role === "coach" ? "coach" : "student";
  const suffix = `?redirect=${encodeURIComponent(redirectTo)}`;

  const [coach, student, categories] = await Promise.all([
    getCurrentCoach(),
    getCurrentStudent(),
    getBrowsableCategories(),
  ]);
  if (coach || student) redirect(redirectTo);

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link href="/" className={textLinkClass}>
        ← Retour
      </Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Créer un compte
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Que vous soyez coach ou élève, ça se passe ici.
      </p>

      <SignupForm defaultRole={defaultRole} redirectTo={redirectTo} categories={categories} />

      <p className="mt-4 text-sm text-zinc-500">
        Déjà un compte ?{" "}
        <Link href={`/compte/login${suffix}`} className={inlineLinkClass}>
          Connectez-vous
        </Link>
        .
      </p>
    </main>
  );
}
