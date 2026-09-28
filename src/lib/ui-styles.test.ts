import { describe, expect, it } from "vitest";
import {
  buttonVariants,
  cardClass,
  errorBoxClass,
  inlineLinkClass,
  inputClass,
  textLinkClass,
} from "./ui-styles";

describe("buttonVariants", () => {
  it("defaults to a primary, medium button", () => {
    const classes = buttonVariants();
    expect(classes).toContain("bg-brand");
    expect(classes).toContain("text-brand-foreground");
    expect(classes).toContain("px-5 py-2.5 text-sm");
  });

  it("applies the secondary variant", () => {
    const classes = buttonVariants({ variant: "secondary" });
    expect(classes).toContain("border border-black/[.08]");
    expect(classes).not.toContain("bg-brand");
  });

  it("applies the small size", () => {
    const classes = buttonVariants({ size: "sm" });
    expect(classes).toContain("px-4 py-1.5 text-sm");
  });

  it("appends a custom className without dropping the base styles", () => {
    const classes = buttonVariants({ className: "shrink-0" });
    expect(classes).toContain("shrink-0");
    expect(classes).toContain("bg-brand");
  });

  it("includes a focus-visible ring for keyboard accessibility", () => {
    expect(buttonVariants()).toContain("focus-visible:ring-brand");
  });
});

describe("shared style constants", () => {
  it("are all non-empty class strings", () => {
    for (const value of [textLinkClass, inlineLinkClass, inputClass, cardClass, errorBoxClass]) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("cardClass gives cards a distinct surface from the page background", () => {
    expect(cardClass).toContain("bg-surface");
  });

  it("inputClass ties focus state to the brand color", () => {
    expect(inputClass).toContain("focus:border-brand");
  });
});
