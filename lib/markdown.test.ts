import { describe, expect, it } from "vitest";
import { calloutRanges, imageInsertion, markdownImage, safeAlt } from "./markdown";

describe("markdown insertion helpers", () => {
  it("neutralises characters the MDX validator rejects in alt text", () => {
    expect(safeAlt("IMG_{2024}.jpg")).toBe("IMG_ 2024 .jpg");
    expect(safeAlt("<photo>.png")).toBe("photo .png");
    expect(safeAlt("a]b.jpg")).toBe("a b.jpg");
    expect(safeAlt("")).toBe("사진");
    expect(safeAlt("normal-name.webp")).toBe("normal-name.webp");
  });
  it("builds image markdown that survives validation", () => {
    expect(markdownImage("IMG_{2024}.jpg", "/media/00000000-0000-0000-0000-000000000000.webp")).toBe(
      "![IMG_ 2024 .jpg](/media/00000000-0000-0000-0000-000000000000.webp)");
  });
  it("finds Callout blocks so images are never inserted inside them", () => {
    const text = 'intro\n\n<Callout title="팁">plain text</Callout>\n\nend';
    const ranges = calloutRanges(text);
    expect(ranges).toHaveLength(1);
    const caret = text.indexOf("plain text");
    const insertion = imageInsertion(text, caret);
    expect(insertion.movedOutOfCallout).toBe(true);
    expect(insertion.position).toBe(ranges[0][1]);
  });
  it("keeps block images at block boundaries and inline images inside a paragraph", () => {
    expect(imageInsertion("# 제목\n\n", 6).block).toBe(true);
    expect(imageInsertion("본문 일부", 3).block).toBe(false);
    expect(imageInsertion("", 0).block).toBe(true);
  });
});
