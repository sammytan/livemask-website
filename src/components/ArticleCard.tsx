import { Link } from "react-router-dom";
import { Calendar, Clock, User } from "lucide-react";
import type { ArticleSummary } from "@/lib/blog-types";

interface ArticleCardProps {
  article: ArticleSummary;
  featured?: boolean;
}

export function ArticleCard({ article, featured }: ArticleCardProps) {
  const date = new Date(article.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (featured) {
    return (
      <Link
        to={`/blog/${article.slug}`}
        className="group block rounded-xl border border-border/50 bg-card overflow-hidden hover:border-teal-500/30 transition-all"
      >
        <div className="grid md:grid-cols-2 gap-0">
          {article.cover_image_url && (
            <div className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden">
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
            </div>
          )}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                {article.category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Featured
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-teal-400 transition-colors mb-3 leading-snug">
              {article.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
              {article.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {article.author_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.reading_time_minutes} min read
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group block rounded-xl border border-border/50 bg-card overflow-hidden hover:border-teal-500/30 transition-all flex flex-col"
    >
      {article.cover_image_url && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
            {article.category}
          </span>
        </div>
        <h3 className="text-base font-semibold text-foreground group-hover:text-teal-400 transition-colors mb-2 leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2 flex-1">
          {article.excerpt}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-2 border-t border-border/30">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.reading_time_minutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}
