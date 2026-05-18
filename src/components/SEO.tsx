import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  robots?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = "LiveMask";
const SITE_URL = "https://livemask.com";
const DEFAULT_DESC = "LiveMask - Secure VPN for privacy and freedom";
const DEFAULT_OG_IMAGE = "https://livemask.com/og-image.jpg";

export function SEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  robots = "index,follow",
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const finalOgTitle = ogTitle || title;
  const finalOgDesc = ogDescription || description;
  const finalOgImage = ogImage || DEFAULT_OG_IMAGE;
  const finalCanonical = canonical || `${SITE_URL}${window.location.pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={finalCanonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDesc} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDesc} />
      <meta name="twitter:image" content={finalOgImage} />

      <meta name="robots" content={robots} />

      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && <meta name="author" content={author} />}

      {jsonLd && Array.isArray(jsonLd) ? (
        jsonLd.map((item, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(item, null, 2)}
          </script>
        ))
      ) : jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd, null, 2)}
        </script>
      ) : null}
    </Helmet>
  );
}

export function createBlogPostingJsonLd(article: {
  title: string;
  description: string;
  cover_image_url: string;
  author_name: string;
  published_at: string;
  updated_at: string;
  canonical_url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    image: article.cover_image_url,
    author: {
      "@type": "Person",
      name: article.author_name,
    },
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.canonical_url,
    },
  };
}

export function createBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export { SITE_NAME, SITE_URL };
