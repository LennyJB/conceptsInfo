import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCoach } from "@/lib/coach-auth";
import { getCurrentStudent } from "@/lib/student-auth";
import { inlineLinkClass, textLinkClass } from "@/lib/ui-styles";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage(props: PageProps<"/compte/login">) {
  const searchParams = await props.searchParams;
  const redirectTo =
    typeof searchParams.redirect === "string" && searchParams.redirect.startsWith("/")
      ? searchParams.redirect
      : "/compte";

  const [coach, student] = await Promise.all([getCurrentCoach(), getCurrentStudent()]);
  if (coach || student) redirect(redirectTo);

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Link href="/" className={textLinkClass}>
        ← Retour
      </Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Mon compte
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Connectez-vous, que vous soyez coach ou élève.
      </p>
      <LoginForm redirectTo={redirectTo} />
      <p className="mt-4 text-sm text-zinc-500">
        Pas encore de compte ?{" "}
        <Link
          href={`/compte/inscription?redirect=${encodeURIComponent(redirectTo)}`}
          className={inlineLinkClass}
        >
          Inscrivez-vous
        </Link>
        .
      </p>
    </main>
  );
}
