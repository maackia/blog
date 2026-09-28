import { describe, expect, it } from "vitest";
import { assertSafeMdx } from "./safe-mdx";

describe("safe MDX", () => {
  it("allows markdown and static Callout", () => {
    expect(assertSafeMdx('# 제목\n\n<Callout title="팁">안녕</Callout>')).toContain("Callout");
  });
  it.each([
    "{process.env.SECRET}", "import foo from 'foo'", "export const x = 1",
    "<script>alert(1)</script>", "<Callout title={process.env.SECRET}>hey</Callout>",
    "<Callout onClick=\"bad\">hey</Callout>", "[bad](javascript:alert(1))",
    "![bad](data:text/html,foo)", "<Callout>{2 + 2}</Callout>",
  ])("rejects unsafe content: %s", (content) => {
    expect(() => assertSafeMdx(content)).toThrow();
  });
});
