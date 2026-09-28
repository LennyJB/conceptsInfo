import { beforeEach, describe, expect, it, vi } from "vitest";

const existingFiles = vi.hoisted(() => new Set<string>());

vi.mock("node:fs", () => ({
  default: {
    existsSync: (filePath: string) => existingFiles.has(filePath.replace(/\\/g, "/")),
  },
}));

const { sportPhotoSlug, getSportPhotoUrl } = await import("./sport-photos");

beforeEach(() => {
  existingFiles.clear();
});

describe("sportPhotoSlug", () => {
  it("derives the slug from the sport's icon filename", () => {
    expect(sportPhotoSlug("MUSCULATION")).toBe("musculation");
    expect(sportPhotoSlug("COURSE_A_PIED")).toBe("course-a-pied");
    expect(sportPhotoSlug("ARTS_MARTIAUX")).toBe("arts-martiaux");
  });
});

describe("getSportPhotoUrl", () => {
  it("returns null when no admin photo has been uploaded", () => {
    expect(getSportPhotoUrl("MUSCULATION")).toBeNull();
  });

  it("returns the public URL when a photo exists for a known extension", () => {
    existingFiles.add(
      process.cwd().replace(/\\/g, "/") + "/public/uploads/categories/musculation.jpg"
    );
    expect(getSportPhotoUrl("MUSCULATION")).toBe("/uploads/categories/musculation.jpg");
  });

  it("only matches the requested sport's slug", () => {
    existingFiles.add(
      process.cwd().replace(/\\/g, "/") + "/public/uploads/categories/yoga.png"
    );
    expect(getSportPhotoUrl("MUSCULATION")).toBeNull();
    expect(getSportPhotoUrl("YOGA")).toBe("/uploads/categories/yoga.png");
  });
});
