import { describe, expect, it } from "vitest";
import { isTheme, resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("uses an explicit saved preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("falls back to the system preference", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("ignores unknown stored values", () => {
    expect(resolveTheme("unknown", true)).toBe("dark");
  });

  it("recognizes only supported stored preferences", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("unknown")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});
