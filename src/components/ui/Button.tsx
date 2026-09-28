import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants, type ButtonSize, type ButtonVariant } from "@/lib/ui-styles";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props} />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonVariants({ variant, size, className })} {...props} />;
}
