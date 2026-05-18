import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { BlogLayout } from "@/components/BlogLayout";
import { ArticleCard } from "@/components/ArticleCard";
import { SEO, createBreadcrumbJsonLd, SITE_URL } from "@/components/SEO";
import { blogClient } from "@/lib/blog-api";
import type { ArticleSummary } from "@/lib/blog-types";

const MOCK_MODE = blogClient.isMockMode();
const isDev = import.meta.env.DEV;

export function BlogTagPage() {
  const { tag } = useParams<{ tag: string }>();
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tag) return;
    setLoading(true);
    // Convert tag slug back to tag name for filtering
    const tagName = tag.replace(/-/g, " ");
    blogClient
      .getArticles({ tag: tagName, limit: 50 })
      .then((res) => setArticles(res.items))
      .catch((err) => console.error("Failed to fetch tag articles:", err))
      .finally(() => setLoading(false));
  }, [tag]);

  const tagName = tag ? tag.replace(/-/g, " ") : "Unknown";

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: `#${tagName}`, url: `${SITE_URL}/blog/tag/${tag}` },
  ]);

  return (
    <BlogLayout showBack>
      <SEO
        title={`#${tagName} Articles`}
        description={`Browse all articles tagged with ${tagName}. Find tips, guides, and insights about ${tagName}.`}
        canonical={`${SITE_URL}/blog/tag/${tag}`}
        robots="index,follow"
        jsonLd={breadcrumbJsonLd}
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Tag: <span className="text-teal-400">#{tagName}</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Browse all articles tagged with {tagName}.
          </p>
        </div>

        {MOCK_MODE && isDev && (
          <div className="text-center mb-6">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Mock Data Mode
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">
              No articles found with this tag.
            </p>
            <Link
              to="/blog"
              className="inline-block mt-4 text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              View all articles
            </Link>
          </div>
        )}
      </div>
    </BlogLayout>
  );
}
