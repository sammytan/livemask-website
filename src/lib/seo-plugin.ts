/**
 * Vite plugin to generate sitemap.xml and rss.xml at build time.
 *
 * Reads mock data (or API data in production) and writes XML files to the output directory.
 */

import type { Plugin, ResolvedConfig } from "vite";
import fs from "fs";
import path from "path";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

interface RssItem {
  title: string;
  link: string;
  description: string;
  author: string;
  pub_date: string;
  guid: string;
}

const SITE_URL = "https://livemask.com";

// Mock article data for sitemap/RSS generation
// In production, this would fetch from the Backend API
function getMockArticles() {
  return [
    {
      slug: "what-is-vpn-and-why-you-need-it",
      title: "What Is a VPN and Why You Need One in 2026",
      excerpt:
        "A VPN encrypts your internet connection and hides your IP address. Learn why online privacy matters more than ever.",
      author_name: "Sarah Chen",
      published_at: "2026-04-15T10:00:00Z",
      updated_at: "2026-04-15T10:00:00Z",
    },
    {
      slug: "aes-256-encryption-explained",
      title: "AES-256 Encryption: How It Works and Why It Matters",
      excerpt:
        "AES-256 is the gold standard for data encryption. Discover how this military-grade algorithm safeguards your sensitive information.",
      author_name: "Marcus Johnson",
      published_at: "2026-04-10T08:00:00Z",
      updated_at: "2026-04-12T14:00:00Z",
    },
    {
      slug: "wireguard-vs-openvpn-comparison",
      title: "WireGuard vs OpenVPN: Which Protocol Is Right for You?",
      excerpt:
        "Both WireGuard and OpenVPN offer strong security, but they differ in speed, simplicity, and compatibility.",
      author_name: "Sarah Chen",
      published_at: "2026-03-28T09:00:00Z",
      updated_at: "2026-03-28T09:00:00Z",
    },
    {
      slug: "how-to-stay-safe-on-public-wifi",
      title: "How to Stay Safe on Public Wi-Fi Networks",
      excerpt:
        "Public Wi-Fi is convenient but risky. Follow these essential tips to protect your data.",
      author_name: "Emily Torres",
      published_at: "2026-03-20T11:00:00Z",
      updated_at: "2026-03-22T16:00:00Z",
    },
    {
      slug: "understanding-dns-leaks",
      title: "Understanding DNS Leaks and How to Prevent Them",
      excerpt:
        "A DNS leak can expose your browsing activity even when using a VPN. Learn what causes DNS leaks.",
      author_name: "Marcus Johnson",
      published_at: "2026-03-15T07:00:00Z",
      updated_at: "2026-03-15T07:00:00Z",
    },
    {
      slug: "vpn-for-streaming-geo-restrictions",
      title: "Using a VPN to Bypass Geo-Restrictions for Streaming",
      excerpt:
        "Access your favorite shows and movies from anywhere in the world.",
      author_name: "Sarah Chen",
      published_at: "2026-03-08T12:00:00Z",
      updated_at: "2026-03-10T09:00:00Z",
    },
    {
      slug: "online-privacy-tips-2026",
      title: "10 Essential Online Privacy Tips for 2026",
      excerpt:
        "From using a VPN to managing cookies, these ten privacy practices will help you reclaim control over your personal data.",
      author_name: "Emily Torres",
      published_at: "2026-02-25T10:00:00Z",
      updated_at: "2026-02-25T10:00:00Z",
    },
    {
      slug: "what-is-kill-switch-vpn",
      title: "What Is a VPN Kill Switch and How Does It Work?",
      excerpt:
        "A kill switch is a critical VPN feature that blocks all internet traffic if the VPN connection drops.",
      author_name: "Marcus Johnson",
      published_at: "2026-02-18T08:00:00Z",
      updated_at: "2026-02-18T08:00:00Z",
    },
    {
      slug: "history-of-vpn-technology",
      title: "A Brief History of VPN Technology",
      excerpt:
        "From early corporate networks to modern consumer VPNs, trace the evolution of virtual private network technology.",
      author_name: "Sarah Chen",
      published_at: "2026-02-10T09:00:00Z",
      updated_at: "2026-02-10T09:00:00Z",
    },
    {
      slug: "vpn-vs-proxy-which-is-better",
      title: "VPN vs Proxy: Which Is Better for Your Privacy?",
      excerpt:
        "Both VPNs and proxies can hide your IP address, but they work very differently.",
      author_name: "Emily Torres",
      published_at: "2026-02-01T10:00:00Z",
      updated_at: "2026-02-01T10:00:00Z",
    },
    {
      slug: "data-privacy-laws-worldwide-2026",
      title: "Data Privacy Laws Worldwide: A 2026 Guide",
      excerpt:
        "From GDPR to CPRA and beyond, understand the major data privacy regulations.",
      author_name: "Marcus Johnson",
      published_at: "2026-01-20T11:00:00Z",
      updated_at: "2026-01-20T11:00:00Z",
    },
    {
      slug: "how-to-choose-vpn-provider",
      title: "How to Choose a VPN Provider: 7 Factors to Consider",
      excerpt:
        "Not all VPNs are created equal. Learn the seven most important factors to evaluate.",
      author_name: "Sarah Chen",
      published_at: "2026-01-10T08:00:00Z",
      updated_at: "2026-01-10T08:00:00Z",
    },
  ];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemapXml(articles: SitemapUrl[]): string {
  const urls = articles
    .map(
      (a) => `  <url>
    <loc>${escapeXml(a.loc)}</loc>
    <lastmod>${a.lastmod}</lastmod>
    <changefreq>${a.changefreq}</changefreq>
    <priority>${a.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateRssXml(feed: {
  title: string;
  description: string;
  link: string;
  language: string;
  items: RssItem[];
}): string {
  const items = feed.items
    .map(
      (item) => `  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${escapeXml(item.link)}</link>
    <description>${escapeXml(item.description)}</description>
    <author>${escapeXml(item.author)}</author>
    <pubDate>${new Date(item.pub_date).toUTCString()}</pubDate>
    <guid>${escapeXml(item.guid)}</guid>
  </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${escapeXml(feed.link)}</link>
    <description>${escapeXml(feed.description)}</description>
    <language>${feed.language}</language>
    <atom:link href="${escapeXml(feed.link)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export function seoPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "livemask-seo-plugin",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      const outDir = config.build.outDir;
      const articles = getMockArticles();

      // Sitemap entries: static pages + blog articles
      const staticPages: SitemapUrl[] = [
        {
          loc: `${SITE_URL}/`,
          lastmod: "2026-01-01T00:00:00Z",
          changefreq: "monthly",
          priority: 1.0,
        },
        {
          loc: `${SITE_URL}/pricing`,
          lastmod: "2026-01-01T00:00:00Z",
          changefreq: "monthly",
          priority: 0.8,
        },
        {
          loc: `${SITE_URL}/download`,
          lastmod: "2026-01-01T00:00:00Z",
          changefreq: "monthly",
          priority: 0.7,
        },
        {
          loc: `${SITE_URL}/security`,
          lastmod: "2026-01-01T00:00:00Z",
          changefreq: "monthly",
          priority: 0.6,
        },
        {
          loc: `${SITE_URL}/faq`,
          lastmod: "2026-01-01T00:00:00Z",
          changefreq: "monthly",
          priority: 0.5,
        },
        {
          loc: `${SITE_URL}/blog`,
          lastmod: articles[0]?.updated_at || "2026-01-01T00:00:00Z",
          changefreq: "daily",
          priority: 0.9,
        },
      ];

      const blogUrls: SitemapUrl[] = articles.map((a) => ({
        loc: `${SITE_URL}/blog/${a.slug}`,
        lastmod: a.updated_at,
        changefreq: "weekly" as const,
        priority: 0.8,
      }));

      const sitemapUrls = [...staticPages, ...blogUrls];
      const sitemapXml = generateSitemapXml(sitemapUrls);

      const sitemapPath = path.resolve(outDir, "sitemap.xml");
      fs.mkdirSync(path.dirname(sitemapPath), { recursive: true });
      fs.writeFileSync(sitemapPath, sitemapXml, "utf-8");
      console.log(`✓ Generated sitemap.xml at ${sitemapPath}`);

      // RSS feed
      const rssItems: RssItem[] = articles.map((a) => ({
        title: a.title,
        link: `${SITE_URL}/blog/${a.slug}`,
        description: a.excerpt,
        author: a.author_name,
        pub_date: a.published_at,
        guid: `${SITE_URL}/blog/${a.slug}`,
      }));

      const rssXml = generateRssXml({
        title: "LiveMask Blog",
        description:
          "Latest articles about VPN technology, online privacy, and security tips from LiveMask.",
        link: `${SITE_URL}/rss.xml`,
        language: "en-us",
        items: rssItems,
      });

      const rssPath = path.resolve(outDir, "rss.xml");
      fs.writeFileSync(rssPath, rssXml, "utf-8");
      console.log(`✓ Generated rss.xml at ${rssPath}`);
    },
  };
}
