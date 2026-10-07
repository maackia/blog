// Markdown helpers without Node APIs so client components can import them.
// The MDX validator rejects raw HTML and JSX expressions, and unbalanced brackets
// silently break image syntax, so file names must be neutralised before insertion.
const ALT_DANGEROUS = /[\[\]()<>{}!]/g;

export function safeAlt(name: string): string {
  return name.replace(ALT_DANGEROUS, " ").replace(/\s+/g, " ").trim() || "사진";
}

export function markdownImage(alt: string, url: string): string {
  return `![${safeAlt(alt)}](${url})`;
}

// Callout bodies accept plain text only, so an image must never be inserted inside one.
export function calloutRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const match of text.matchAll(/<Callout(?:\s+title="[^"]*")?\s*>[\s\S]*?<\/Callout>/g)) {
    ranges.push([match.index, match.index + match[0].length]);
  }
  return ranges;
}

// Insertion position for a block-level image: keep it out of Callouts and, when the
// caret is inside a paragraph, insert inline instead of splitting the paragraph.
export function imageInsertion(text: string, caret: number): { position: number; block: boolean; movedOutOfCallout: boolean } {
  let position = Math.min(Math.max(caret, 0), text.length);
  let movedOutOfCallout = false;
  for (const [start, end] of calloutRanges(text)) {
    if (position > start && position < end) { position = end; movedOutOfCallout = true; break; }
  }
  const before = text.slice(0, position);
  const after = text.slice(position);
  const block = (!before || before.endsWith("\n")) && (!after || after.startsWith("\n"));
  return { position, block, movedOutOfCallout };
}
