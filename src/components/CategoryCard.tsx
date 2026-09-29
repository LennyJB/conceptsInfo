import Image from "next/image";
import Link from "next/link";
import type { Category } from "@prisma/client";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group overflow-hidden rounded-2xl border border-black/[.08] bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md dark:border-white/[.145] dark:shadow-none dark:hover:border-brand/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {category.photoUrl ? (
          <Image
            src={category.photoUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${category.color}`}>
            {category.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- tiny static icon, next/image adds no value here
              <img src={category.iconUrl} alt="" aria-hidden className="h-24 w-24" />
            ) : (
              <span aria-hidden className="text-6xl font-semibold text-white">
                {category.label.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-5">
        <span className="text-lg font-semibold">{category.label}</span>
        <span
          aria-hidden
          className="text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-brand dark:text-zinc-600"
        >
          →
        </span>
      </div>
    </Link>
  );
}
