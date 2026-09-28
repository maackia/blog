import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { assertSafeMdx } from "./safe-mdx";

// Convert only the validated literal Callout component to markdown-safe tokens.
// No MDX JavaScript is evaluated, including on the public site.
export function RestrictedMdx({ source }: { source: string }) {
  assertSafeMdx(source);
  const callouts: string[] = [];
  const transformed = source.replace(/<Callout(?:\s+title="([^"]*)")?\s*>([\s\S]*?)<\/Callout>/g, (_all, title: string | undefined, body: string) => {
    const index = callouts.push(`${title ? `**${title}**\n\n` : ""}${body.trim()}`) - 1;
    return `\n\n:::blog-callout-${index}:::\n\n`;
  });
  // The validator rejects all HTML tags besides Callout. The custom directive is
  // replaced after Markdown parsing via text nodes instead of dangerous HTML.
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    p({ children }) {
      if (typeof children === "string") {
        const match = /^:::blog-callout-(\d+):::$/.exec(children.trim());
        if (match) return <aside className="border-orange/40 bg-surface my-6 rounded-2xl border p-5"><ReactMarkdown remarkPlugins={[remarkGfm]}>{callouts[Number(match[1])]}</ReactMarkdown></aside>;
      }
      return <p>{children}</p>;
    },
  }}>{transformed}</ReactMarkdown>;
}
