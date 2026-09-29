import Link from "next/link";
import { adminLogout } from "@/lib/admin-actions";
import { textLinkClass } from "@/lib/ui-styles";

const TABS = [
  { href: "/admin", label: "Profils en attente" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/users", label: "Utilisateurs" },
] as const;

export function AdminNav({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4 border-b border-black/[.08] pb-4 dark:border-white/[.145]">
      <nav className="flex gap-1">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === tab.href
                ? "bg-brand text-brand-foreground"
                : "text-zinc-600 hover:bg-black/[.03] dark:text-zinc-400 dark:hover:bg-white/[.05]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <form action={adminLogout}>
        <button type="submit" className={textLinkClass}>
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
