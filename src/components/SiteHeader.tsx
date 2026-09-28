import Link from "next/link";
import { getCurrentCoach } from "@/lib/coach-auth";
import { getCurrentStudent } from "@/lib/student-auth";
import { ButtonLink } from "@/components/ui/Button";

export async function SiteHeader() {
  const [coach, student] = await Promise.all([getCurrentCoach(), getCurrentStudent()]);
  const loggedIn = Boolean(coach || student);

  return (
    <header className="border-b border-black/[.08] bg-surface dark:border-white/[.145]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand" aria-hidden />
          Coachs Sportifs
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {loggedIn ? (
            <Link
              href="/compte"
              className="text-zinc-600 transition-colors hover:text-brand dark:text-zinc-400 dark:hover:text-brand-hover"
            >
              Mon compte
            </Link>
          ) : (
            <>
              <Link
                href="/compte/login"
                className="text-zinc-600 transition-colors hover:text-brand dark:text-zinc-400 dark:hover:text-brand-hover"
              >
                Se connecter
              </Link>
              <ButtonLink href="/compte/inscription" size="sm">
                Créer un compte
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
