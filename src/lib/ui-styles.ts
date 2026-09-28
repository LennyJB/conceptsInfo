export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "md" | "sm";

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-foreground hover:bg-brand-hover",
  secondary:
    "border border-black/[.08] hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-white/[.05]",
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  sm: "px-4 py-1.5 text-sm",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return `${buttonBase} ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]} ${className}`.trim();
}

// Discreet inline text links ("← Retour", "Se déconnecter"...): no pill, just
// a muted label that picks up the brand color on hover/focus.
export const textLinkClass =
  "text-sm text-zinc-500 transition-colors hover:text-brand dark:text-zinc-400 dark:hover:text-brand-hover";

// Underlined links inside body copy ("Inscrivez-vous.", "Connectez-vous.").
export const inlineLinkClass =
  "font-medium text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:text-brand-hover dark:text-indigo-400 dark:decoration-indigo-400/30 dark:hover:text-indigo-300";

// Text/textarea inputs across every form in the app.
export const inputClass =
  "rounded-lg border border-black/[.08] bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand dark:border-white/[.145] dark:focus:border-brand";

// Elevated surface for cards/panels (list items, info boxes) so content
// visibly sits above the page background instead of blending into it.
export const cardClass =
  "rounded-xl border border-black/[.08] bg-surface shadow-sm dark:border-white/[.145] dark:shadow-none";

export const errorBoxClass =
  "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300";
