import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";

const safeUrl = (value: string) => {
  if (/^(?:https?:\/\/|\/[^/]|#|\.\/|\.\.\/)/i.test(value)) return true;
  return !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("//");
};

// Validate the complete AST before saving AND before rendering. Never execute
// MDX source: Callout is transformed into safe markdown and React elements.
export function assertSafeMdx(source: string) {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  visit(tree, (node) => {
    if (node.type === "mdxjsEsm" || node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
      throw new Error("JavaScript expressions, imports and exports are not allowed in posts.");
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      if (node.name !== "Callout" || node.children.some((child) => child.type !== "text")) {
        throw new Error("Only plain-text <Callout> is allowed in MDX.");
      }
      for (const attr of node.attributes) {
        if (attr.type !== "mdxJsxAttribute" || attr.name !== "title" || typeof attr.value !== "string") {
          throw new Error("Only a static title attribute is allowed on <Callout>.");
        }
      }
      // In the first version, the Callout parser accepts only a simple string body.
      const from = node.position?.start.offset;
      const to = node.position?.end.offset;
      if (from === undefined || to === undefined ||
          !/^<Callout(?:\s+title="[^"]*")?\s*>[^<>]*<\/Callout>$/.test(source.slice(from, to))) {
        throw new Error("Invalid Callout syntax.");
      }
    }
    if (node.type === "html") throw new Error("Raw HTML is not allowed.");
    if (node.type === "link" || node.type === "image" || node.type === "definition") {
      if (!safeUrl(node.url)) throw new Error("Unsafe link or image URL.");
    }
  });
  return source;
}
