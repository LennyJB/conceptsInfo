import { beforeEach, describe, expect, it, vi } from "vitest";
import { slugify } from "./categories";

describe("slugify", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugify("Course à pied")).toBe("course-a-pied");
  });

  it("strips accents", () => {
    expect(slugify("Éscrime")).toBe("escrime");
  });

  it("collapses non-alphanumeric runs into a single dash", () => {
    expect(slugify("Arts   martiaux!!")).toBe("arts-martiaux");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugify("  Zumba  ")).toBe("zumba");
  });

  it("produces the same slug regardless of case", () => {
    expect(slugify("ESCRIME")).toBe(slugify("escrime"));
  });
});

const { categoryStore, FakeKnownRequestError } = vi.hoisted(() => {
  class FakeKnownRequestError extends Error {
    code: string;
    constructor(message: string, code = "P2002") {
      super(message);
      this.code = code;
    }
  }
  return {
    categoryStore: new Map<string, { id: string; slug: string; label: string }>(),
    FakeKnownRequestError,
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      findUnique: async ({ where: { slug } }: { where: { slug: string } }) =>
        categoryStore.get(slug) ?? null,
      create: async ({ data }: { data: { slug: string; label: string } }) => {
        if (categoryStore.has(data.slug)) {
          throw new FakeKnownRequestError("Unique constraint failed");
        }
        const created = { id: `id-${data.slug}`, slug: data.slug, label: data.label };
        categoryStore.set(data.slug, created);
        return created;
      },
    },
  },
}));

vi.mock("@prisma/client", () => ({
  Prisma: { PrismaClientKnownRequestError: FakeKnownRequestError },
}));

const { findOrCreateCategoryByLabel } = await import("./categories");

beforeEach(() => {
  categoryStore.clear();
});

describe("findOrCreateCategoryByLabel", () => {
  it("creates a new pending category when none matches", async () => {
    const category = await findOrCreateCategoryByLabel("Escrime");
    expect(category).toMatchObject({ slug: "escrime", label: "Escrime" });
  });

  it("returns the existing category instead of creating a duplicate", async () => {
    const first = await findOrCreateCategoryByLabel("Escrime");
    const second = await findOrCreateCategoryByLabel("escrime");
    expect(second?.id).toBe(first?.id);
    expect(categoryStore.size).toBe(1);
  });

  it("returns null for an empty or whitespace-only label", async () => {
    await expect(findOrCreateCategoryByLabel("   ")).resolves.toBeNull();
  });
});
