type CategoryLike = {
  label: string;
  color: string;
  iconUrl: string | null;
};

export function CategoryIcon({ category, size = 28 }: { category: CategoryLike; size?: number }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${category.color}`}
      style={{ width: size, height: size }}
    >
      {category.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny static icon, next/image adds no value here
        <img
          src={category.iconUrl}
          alt=""
          aria-hidden
          style={{ width: size * 0.58, height: size * 0.58 }}
        />
      ) : (
        <span
          aria-hidden
          className="font-semibold text-white"
          style={{ fontSize: size * 0.45 }}
        >
          {category.label.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
