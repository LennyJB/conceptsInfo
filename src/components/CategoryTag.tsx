import { CategoryIcon } from "./CategoryIcon";

type CategoryLike = {
  label: string;
  color: string;
  iconUrl: string | null;
};

export function CategoryTag({ category }: { category: CategoryLike }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[.06] py-1 pr-2.5 pl-1 text-xs dark:bg-white/[.08]">
      <CategoryIcon category={category} size={18} />
      {category.label}
    </span>
  );
}
