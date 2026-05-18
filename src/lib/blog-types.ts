// Blog article data models aligned with BLOG_SEO_CONTENT_CONTRACT.md

export interface ArticleSummary {
  id: string;
  slug: string;
  locale: string;
  content_type: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  author_name: string;
  category: string;
  tags: string[];
  published_at: string;
  updated_at: string;
  reading_time_minutes: number;
  featured: boolean;
}

export interface ArticleDetail {
  id: string;
  slug: string;
  locale: string;
  content_type: string;
  title: string;
  excerpt: string;
  content_html: string;
  content_markdown: string;
  author_name: string;
  category: string;
  tags: string[];
  cover_image_url: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  robots: string;
  published_at: string;
  updated_at: string;
  created_at: string;
  reading_time_minutes: number;
  word_count: number;
  featured: boolean;
  related_article_ids: string[];
  source_type: string;
  source_url: string;
}

export interface ArticleListResponse {
  items: ArticleSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface BlogCategory {
  name: string;
  slug: string;
  article_count: number;
}

export interface BlogTag {
  name: string;
  slug: string;
  article_count: number;
}

export interface CategoriesResponse {
  categories: BlogCategory[];
}

export interface TagsResponse {
  tags: BlogTag[];
}

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
  alternates?: { hreflang: string; href: string }[];
}

export interface SitemapResponse {
  urls: SitemapUrl[];
}

export interface RssItem {
  title: string;
  link: string;
  description: string;
  content_html: string;
  author: string;
  category: string[];
  pub_date: string;
  guid: string;
}

export interface RssResponse {
  feed: {
    title: string;
    description: string;
    link: string;
    language: string;
    items: RssItem[];
  };
}

export interface BlogQueryParams {
  locale?: string;
  category?: string;
  tag?: string;
  q?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export interface MockFlags {
  mockMode: boolean;
  stale: boolean;
}
