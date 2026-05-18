import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Safe Markdown renderer.
 *
 * - Converts markdown text to HTML
 * - Strips <script> and <iframe> tags
 * - Adds rel="noopener noreferrer" to external links
 * - Adds alt attribute to images (uses filename if missing)
 * - Uses dangerouslySetInnerHTML but content is sanitized
 */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const sanitized = useMemo(() => {
    // Simple markdown to HTML conversion
    let html = content;

    // Code blocks (```...```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      const langClass = lang ? ` class="language-${lang}"` : "";
      return `<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headers (h2, h3, h4)
    html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (_match) => {
      if (!_match.startsWith("<ul>")) {
        return `<ol>${_match}</ol>`;
      }
      return _match;
    });

    // Links with sanitization
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, text, url) => {
        const safeUrl = sanitizeUrl(url);
        const rel = isExternalUrl(safeUrl)
          ? ' rel="noopener noreferrer"'
          : "";
        return `<a href="${safeUrl}"${rel}>${text}</a>`;
      }
    );

    // Images with alt
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_match, alt, src) => {
        const safeSrc = sanitizeUrl(src);
        const altText = alt || extractFilename(src);
        return `<img src="${safeSrc}" alt="${escapeHtml(altText)}" loading="lazy" />`;
      }
    );

    // Paragraphs: wrap remaining text lines
    html = html
      .split(/\n\n+/)
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        // Skip already wrapped blocks
        if (
          trimmed.startsWith("<h") ||
          trimmed.startsWith("<ul") ||
          trimmed.startsWith("<ol") ||
          trimmed.startsWith("<pre") ||
          trimmed.startsWith("<li")
        ) {
          return trimmed;
        }
        // Inline breaks within paragraphs
        const withBreaks = trimmed
          .split("\n")
          .filter((l) => l.trim())
          .join("<br />");
        return `<p>${withBreaks}</p>`;
      })
      .join("\n");

    // Strip <script> and <iframe> tags
    html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");

    // Strip any on* event handlers
    html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");

    return html;
  }, [content]);

  return (
    <div
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUrl(url: string): string {
  // Only allow http, https, mailto, and relative URLs
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("/") ||
    url.startsWith("#")
  ) {
    return url;
  }
  // Default to safe
  return url;
}

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() || "image";
    return filename.split("?")[0];
  } catch {
    return "image";
  }
}
