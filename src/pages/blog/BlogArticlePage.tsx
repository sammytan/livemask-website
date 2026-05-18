import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, User, Tag, FolderOpen, Loader2 } from "lucide-react";
import { BlogLayout } from "@/components/BlogLayout";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  SEO,
  createBlogPostingJsonLd,
  createBreadcrumbJsonLd,
  SITE_URL,
} from "@/components/SEO";
import { blogClient } from "@/lib/blog-api";
import type { ArticleDetail } from "@/lib/blog-types";

const MOCK_MODE = blogClient.isMockMode();
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    blogClient
      .getArticle(slug)
      .then((res) => {
        if (!res.article) {
          setNotFound(true);
          return;
        }
        setArticle(res.article);
      })
      .catch((err) => {
        console.error("Failed to fetch article:", err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <BlogLayout showBack>
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BlogLayout>
    );
  }

  if (notFound || !article) {
    return (
      <BlogLayout showBack>
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Article not found. It may have been removed or the link is incorrect.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </BlogLayout>
    );
  }

  const seoTitle = article.seo_title || article.title;
  const seoDesc = article.seo_description || article.excerpt;
  const ogTitle = article.og_title || seoTitle;
  const ogDesc = article.og_description || seoDesc;
  const ogImage = article.og_image_url || article.cover_image_url;
  const canonical = article.canonical_url || `${SITE_URL}/blog/${article.slug}`;
  const robots = article.robots || "index,follow";

  const isNoIndex = robots.includes("noindex");

  const blogPostingJsonLd = createBlogPostingJsonLd({
    title: article.title,
    description: seoDesc,
    cover_image_url: article.cover_image_url,
    author_name: article.author_name,
    published_at: article.published_at,
    updated_at: article.updated_at,
    canonical_url: canonical,
  });

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: article.title, url: canonical },
  ]);

  const publishedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = new Date(article.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <BlogLayout showBack>
      {/* noindex meta handled by SEO component */}
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={canonical}
        ogTitle={ogTitle}
        ogDescription={ogDesc}
        ogImage={ogImage}
        ogType="article"
        robots={robots}
        publishedTime={article.published_at}
        modifiedTime={article.updated_at}
        author={article.author_name}
        jsonLd={[blogPostingJsonLd, breadcrumbJsonLd]}
      />

      <article className="max-w-4xl mx-auto px-4 py-10">
        {/* Mock badge */}
        {MOCK_MODE && isDev && (
          <div className="mb-6">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Mock Data Mode
            </span>
          </div>
        )}

        {/* Cover Image */}
        {article.cover_image_url && (
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden mb-8">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Link
            to={`/blog/category/${article.category}`}
            className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider hover:bg-teal-500/20 transition-colors"
          >
            <FolderOpen className="inline h-3 w-3 mr-1" />
            {article.category}
          </Link>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <User className="h-3 w-3" />
            {article.author_name}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {publishedDate}
          </span>
          {article.reading_time_minutes > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {article.reading_time_minutes} min read
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-base text-muted-foreground leading-relaxed mb-8 border-l-2 border-teal-500/30 pl-4 italic">
            {article.excerpt}
          </p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-card border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          {article.content_html ? (
            <div
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content_html) }}
              className="blog-content"
            />
          ) : article.content_markdown ? (
            <MarkdownRenderer content={article.content_markdown} />
          ) : (
            <p className="text-muted-foreground">No content available.</p>
          )}
        </div>

        {/* Updated notice */}
        {article.published_at !== article.updated_at && (
          <div className="mt-8 pt-4 border-t border-border/30 text-[11px] text-muted-foreground">
            Last updated: {updatedDate}
          </div>
        )}

        {/* Category and Tags internal links for SEO */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Category:</span>
            <Link
              to={`/blog/category/${article.category}`}
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Link>
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
              <span className="font-medium text-foreground">Tags:</span>
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Related articles placeholder - would be populated by related_article_ids from API */}
        {article.related_article_ids && article.related_article_ids.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Related Articles
            </h3>
            <p className="text-xs text-muted-foreground">
              Related articles will appear here when configured.
            </p>
          </div>
        )}
      </article>

      {/* Blog content styles */}
      <style>{`
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .blog-content p {
          font-size: 1rem;
          line-height: 1.8;
          color: hsl(var(--muted-foreground));
          margin-bottom: 1rem;
        }
        .blog-content ul, .blog-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          font-size: 0.95rem;
          line-height: 1.7;
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.25rem;
        }
        .blog-content ul li {
          list-style-type: disc;
        }
        .blog-content ol li {
          list-style-type: decimal;
        }
        .blog-content strong {
          color: hsl(var(--foreground));
          font-weight: 600;
        }
        .blog-content a {
          color: hsl(173, 80%, 40%);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .blog-content a:hover {
          color: hsl(173, 80%, 50%);
        }
        .blog-content img {
          border-radius: 0.75rem;
          margin: 1.5rem 0;
          max-width: 100%;
          height: auto;
        }
        .blog-content code {
          background: hsl(var(--card));
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, monospace;
        }
        .blog-content pre {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 0.75rem;
          padding: 1rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .blog-content pre code {
          background: none;
          padding: 0;
          font-size: 0.85rem;
        }
        .blog-content blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        @media (max-width: 640px) {
          .blog-content h2 { font-size: 1.25rem; }
          .blog-content h3 { font-size: 1.1rem; }
          .blog-content p { font-size: 0.9rem; }
          .blog-content li { font-size: 0.85rem; }
        }
      `}</style>
    </BlogLayout>
  );
}

/**
 * Basic HTML sanitization for content_html from API.
 * Strips <script>, <iframe>, and on* event handlers.
 * Adds rel="noopener noreferrer" to external links.
 */
function sanitizeHtml(html: string): string {
  let safe = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<a\s([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi, (_match, before, url, after) => {
      if (before.includes("rel=") || after.includes("rel=")) {
        return `<a ${before}href="${url}"${after}>`;
      }
      return `<a ${before}href="${url}" rel="noopener noreferrer"${after}>`;
    });
  return safe;
}
