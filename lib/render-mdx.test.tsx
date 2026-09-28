import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RestrictedMdx } from "./render-mdx";

describe("restricted renderer", () => {
  it("renders markdown and a Callout without evaluating code", () => {
    const html = renderToStaticMarkup(<RestrictedMdx source={'# Hello\n\n<Callout title="팁">안녕</Callout>'} />);
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<aside");
    expect(html).toContain("팁");
  });
  it("rejects expressions and raw HTML on render", () => {
    expect(() => renderToStaticMarkup(<RestrictedMdx source="{process.env.SECRET}" />)).toThrow();
    expect(() => renderToStaticMarkup(<RestrictedMdx source="<iframe src='evil'/>" />)).toThrow();
  });
});
