import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";

const allowedComponents = new Set(["Callout"]);
const safeUrl = (value: string) => {
  if (/^(?:https?:\/\/|\/[^/]|#|\.\/|\.\.\/)/i.test(value)) return true;
  return !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("//");
};

// MDX is compiled into JavaScript by the renderer. Validate the complete AST before saving
// AND before rendering so a modified database can never execute arbitrary JSX/JS.
export function assertSafeMdx(source: string) {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  visit(tree, (node) => {
    if (node.type === "mdxjsEsm" || node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
      throw new Error("JavaScript expressions, imports and exports are not allowed in posts.");
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      if (!node.name || !allowedComponents.has(node.name)) throw new Error("Only <Callout> is allowed in MDX.");
      for (const attr of node.attributes) {
        if (attr.type !== "mdxJsxAttribute" || attr.name !== "title" ||
            (attr.value !== null && typeof attr.value !== "string")) {
          throw new Error("Only a static title attribute is allowed on <Callout>.");
        }
      }
    }
    if (node.type === "link" || node.type === "image" || node.type === "definition") {
      if (!safeUrl(node.url)) throw new Error("Unsafe link or image URL.");
    }
  });
  return source;
}
