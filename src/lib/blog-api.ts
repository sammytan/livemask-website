import type {
  ArticleSummary,
  ArticleDetail,
  ArticleListResponse,
  CategoriesResponse,
  TagsResponse,
  BlogQueryParams,
} from "./blog-types";
import { publicFetch } from "./http-client";

const MOCK_MODE =
  import.meta.env.VITE_API_MOCK_MODE !== "false" && import.meta.env.VITE_API_MOCK_MODE !== "0";

const isDev = import.meta.env.DEV;

class BlogApiClient {
  private mockMode = MOCK_MODE;

  isMockMode(): boolean {
    return this.mockMode;
  }

  private async request<T>(path: string): Promise<T> {
    if (this.mockMode) {
      return this.mockRequest<T>(path);
    }
    return publicFetch<T>(path, {
      headers: { Accept: "application/json" },
    });
  }

  async getArticles(params: BlogQueryParams = {}): Promise<ArticleListResponse> {
    const qs = new URLSearchParams();
    if (params.locale) qs.set("locale", params.locale);
    if (params.category) qs.set("category", params.category);
    if (params.tag) qs.set("tag", params.tag);
    if (params.q) qs.set("q", params.q);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.featured !== undefined) qs.set("featured", String(params.featured));
    const query = qs.toString();
    return this.request<ArticleListResponse>(`/api/v1/content/blog${query ? `?${query}` : ""}`);
  }

  async getArticle(slug: string, locale?: string): Promise<{ article: ArticleDetail }> {
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    return this.request<{ article: ArticleDetail }>(
      `/api/v1/content/blog/${encodeURIComponent(slug)}${qs}`
    );
  }

  async getCategories(): Promise<CategoriesResponse> {
    return this.request<CategoriesResponse>("/api/v1/content/blog/categories");
  }

  async getTags(): Promise<TagsResponse> {
    return this.request<TagsResponse>("/api/v1/content/blog/tags");
  }

  // ── Mock Data ────────────────────────────────────────────────────────

  private async mockRequest<T>(path: string): Promise<T> {
    await new Promise((r) => setTimeout(r, 400));

    // Article list
    if (path.startsWith("/api/v1/content/blog") && !path.includes("/categories") && !path.includes("/tags")) {
      const url = new URL(path, "http://mock");
      const params = url.searchParams;
      const category = params.get("category");
      const tag = params.get("tag");
      const q = params.get("q");
      const page = parseInt(params.get("page") || "1", 10);
      const limit = parseInt(params.get("limit") || "20", 10);
      const featured = params.get("featured");

      let items = this.mockArticles();

      if (category) items = items.filter((a) => a.category === category);
      if (tag) {
        const lcTag = tag.toLowerCase();
        items = items.filter((a) => a.tags.some((t) => t.toLowerCase() === lcTag));
      }
      if (q) {
        const lq = q.toLowerCase();
        items = items.filter(
          (a) =>
            a.title.toLowerCase().includes(lq) || a.excerpt.toLowerCase().includes(lq)
        );
      }
      if (featured === "true") items = items.filter((a) => a.featured);

      const total = items.length;
      const start = (page - 1) * limit;
      const paged = items.slice(start, start + limit);

      return { items: paged, total, page, limit } as T;
    }

    // Article detail
    if (path.startsWith("/api/v1/content/blog/")) {
      const slug = path.replace("/api/v1/content/blog/", "").split("?")[0];
      const article = this.mockArticleDetail(slug);
      if (!article) {
        throw { status: 404, message: "Not found" };
      }
      return { article } as T;
    }

    // Categories
    if (path === "/api/v1/content/blog/categories") {
      return {
        categories: [
          { name: "Privacy", slug: "privacy", article_count: 4 },
          { name: "Security", slug: "security", article_count: 3 },
          { name: "Technology", slug: "technology", article_count: 3 },
          { name: "Guides", slug: "guides", article_count: 2 },
        ],
      } as T;
    }

    // Tags
    if (path === "/api/v1/content/blog/tags") {
      return {
        tags: [
          { name: "Encryption", slug: "Encryption", article_count: 3 },
          { name: "VPN", slug: "VPN", article_count: 5 },
          { name: "Privacy", slug: "Privacy", article_count: 4 },
          { name: "Security", slug: "Security", article_count: 4 },
          { name: "Streaming", slug: "Streaming", article_count: 2 },
          { name: "Tutorial", slug: "Tutorial", article_count: 3 },
          { name: "WireGuard", slug: "WireGuard", article_count: 1 },
          { name: "OpenVPN", slug: "OpenVPN", article_count: 1 },
        ],
      } as T;
    }

    throw { status: 404, message: "Endpoint not found in mock" };
  }

  private mockArticles(): ArticleSummary[] {
    const base: ArticleSummary[] = [
      {
        id: "art_001",
        slug: "what-is-vpn-and-why-you-need-it",
        locale: "en-US",
        content_type: "blog_article",
        title: "What Is a VPN and Why You Need One in 2026",
        excerpt:
          "A VPN encrypts your internet connection and hides your IP address. Learn why online privacy matters more than ever and how a VPN protects you from tracking, censorship, and cyber threats.",
        cover_image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
        author_name: "Sarah Chen",
        category: "privacy",
        tags: ["VPN", "Privacy", "Encryption"],
        published_at: "2026-04-15T10:00:00Z",
        updated_at: "2026-04-15T10:00:00Z",
        reading_time_minutes: 6,
        featured: true,
      },
      {
        id: "art_002",
        slug: "aes-256-encryption-explained",
        locale: "en-US",
        content_type: "blog_article",
        title: "AES-256 Encryption: How It Works and Why It Matters",
        excerpt:
          "AES-256 is the gold standard for data encryption. Discover how this military-grade algorithm safeguards your sensitive information and why it's trusted by governments worldwide.",
        cover_image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
        author_name: "Marcus Johnson",
        category: "security",
        tags: ["Encryption", "Security"],
        published_at: "2026-04-10T08:00:00Z",
        updated_at: "2026-04-12T14:00:00Z",
        reading_time_minutes: 8,
        featured: true,
      },
      {
        id: "art_003",
        slug: "wireguard-vs-openvpn-comparison",
        locale: "en-US",
        content_type: "blog_article",
        title: "WireGuard vs OpenVPN: Which Protocol Is Right for You?",
        excerpt:
          "Both WireGuard and OpenVPN offer strong security, but they differ in speed, simplicity, and compatibility. We compare both protocols to help you make an informed choice.",
        cover_image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        author_name: "Sarah Chen",
        category: "technology",
        tags: ["WireGuard", "OpenVPN", "VPN"],
        published_at: "2026-03-28T09:00:00Z",
        updated_at: "2026-03-28T09:00:00Z",
        reading_time_minutes: 5,
        featured: false,
      },
      {
        id: "art_004",
        slug: "how-to-stay-safe-on-public-wifi",
        locale: "en-US",
        content_type: "blog_article",
        title: "How to Stay Safe on Public Wi-Fi Networks",
        excerpt:
          "Public Wi-Fi is convenient but risky. Follow these essential tips to protect your data when using coffee shop, airport, or hotel networks.",
        cover_image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
        author_name: "Emily Torres",
        category: "guides",
        tags: ["Security", "VPN", "Tutorial"],
        published_at: "2026-03-20T11:00:00Z",
        updated_at: "2026-03-22T16:00:00Z",
        reading_time_minutes: 4,
        featured: false,
      },
      {
        id: "art_005",
        slug: "understanding-dns-leaks",
        locale: "en-US",
        content_type: "blog_article",
        title: "Understanding DNS Leaks and How to Prevent Them",
        excerpt:
          "A DNS leak can expose your browsing activity even when using a VPN. Learn what causes DNS leaks and how to ensure your connection stays private.",
        cover_image_url: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80",
        author_name: "Marcus Johnson",
        category: "security",
        tags: ["Security", "Privacy", "VPN"],
        published_at: "2026-03-15T07:00:00Z",
        updated_at: "2026-03-15T07:00:00Z",
        reading_time_minutes: 5,
        featured: false,
      },
      {
        id: "art_006",
        slug: "vpn-for-streaming-geo-restrictions",
        locale: "en-US",
        content_type: "blog_article",
        title: "Using a VPN to Bypass Geo-Restrictions for Streaming",
        excerpt:
          "Access your favorite shows and movies from anywhere in the world. A guide to using VPNs for streaming platforms like Netflix, Hulu, and BBC iPlayer.",
        cover_image_url: "https://images.unsplash.com/photo-1522869635100-9f4c5e2c38d1?w=800&q=80",
        author_name: "Sarah Chen",
        category: "guides",
        tags: ["Streaming", "VPN", "Tutorial"],
        published_at: "2026-03-08T12:00:00Z",
        updated_at: "2026-03-10T09:00:00Z",
        reading_time_minutes: 7,
        featured: false,
      },
      {
        id: "art_007",
        slug: "online-privacy-tips-2026",
        locale: "en-US",
        content_type: "blog_article",
        title: "10 Essential Online Privacy Tips for 2026",
        excerpt:
          "From using a VPN to managing cookies, these ten privacy practices will help you reclaim control over your personal data online.",
        cover_image_url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
        author_name: "Emily Torres",
        category: "privacy",
        tags: ["Privacy", "Security"],
        published_at: "2026-02-25T10:00:00Z",
        updated_at: "2026-02-25T10:00:00Z",
        reading_time_minutes: 6,
        featured: true,
      },
      {
        id: "art_008",
        slug: "what-is-kill-switch-vpn",
        locale: "en-US",
        content_type: "blog_article",
        title: "What Is a VPN Kill Switch and How Does It Work?",
        excerpt:
          "A kill switch is a critical VPN feature that blocks all internet traffic if the VPN connection drops. Learn why this matters for your privacy.",
        cover_image_url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
        author_name: "Marcus Johnson",
        category: "security",
        tags: ["Security", "VPN"],
        published_at: "2026-02-18T08:00:00Z",
        updated_at: "2026-02-18T08:00:00Z",
        reading_time_minutes: 4,
        featured: false,
      },
      {
        id: "art_009",
        slug: "history-of-vpn-technology",
        locale: "en-US",
        content_type: "blog_article",
        title: "A Brief History of VPN Technology",
        excerpt:
          "From early corporate networks to modern consumer VPNs, trace the evolution of virtual private network technology and its growing importance.",
        cover_image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        author_name: "Sarah Chen",
        category: "technology",
        tags: ["VPN", "Technology"],
        published_at: "2026-02-10T09:00:00Z",
        updated_at: "2026-02-10T09:00:00Z",
        reading_time_minutes: 7,
        featured: false,
      },
      {
        id: "art_010",
        slug: "vpn-vs-proxy-which-is-better",
        locale: "en-US",
        content_type: "blog_article",
        title: "VPN vs Proxy: Which Is Better for Your Privacy?",
        excerpt:
          "Both VPNs and proxies can hide your IP address, but they work very differently. Understand the key differences and choose the right tool.",
        cover_image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80",
        author_name: "Emily Torres",
        category: "technology",
        tags: ["VPN", "Privacy", "Tutorial"],
        published_at: "2026-02-01T10:00:00Z",
        updated_at: "2026-02-01T10:00:00Z",
        reading_time_minutes: 5,
        featured: false,
      },
      {
        id: "art_011",
        slug: "data-privacy-laws-worldwide-2026",
        locale: "en-US",
        content_type: "blog_article",
        title: "Data Privacy Laws Worldwide: A 2026 Guide",
        excerpt:
          "From GDPR to CPRA and beyond, understand the major data privacy regulations shaping how companies handle your personal information.",
        cover_image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
        author_name: "Marcus Johnson",
        category: "privacy",
        tags: ["Privacy", "Security"],
        published_at: "2026-01-20T11:00:00Z",
        updated_at: "2026-01-20T11:00:00Z",
        reading_time_minutes: 9,
        featured: false,
      },
      {
        id: "art_012",
        slug: "how-to-choose-vpn-provider",
        locale: "en-US",
        content_type: "blog_article",
        title: "How to Choose a VPN Provider: 7 Factors to Consider",
        excerpt:
          "Not all VPNs are created equal. Learn the seven most important factors to evaluate when selecting a VPN provider for your needs.",
        cover_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        author_name: "Sarah Chen",
        category: "privacy",
        tags: ["VPN", "Privacy", "Tutorial"],
        published_at: "2026-01-10T08:00:00Z",
        updated_at: "2026-01-10T08:00:00Z",
        reading_time_minutes: 6,
        featured: true,
      },
    ];
    return base;
  }

  private mockArticleDetail(slug: string): ArticleDetail | null {
    const summary = this.mockArticles().find((a) => a.slug === slug);
    if (!summary) return null;

    const contentMap: Record<string, { html: string; md: string }> = {
      "what-is-vpn-and-why-you-need-it": {
        md: `## What Is a VPN?

A **Virtual Private Network (VPN)** creates an encrypted tunnel between your device and a remote server operated by a VPN service. All your internet traffic is routed through this tunnel, protecting it from eavesdroppers, ISPs, hackers, and government surveillance.

## How a VPN Works

1. **Connection Initiation**: When you connect to a VPN, your device establishes a secure connection to a VPN server.
2. **Encryption**: All data traveling between your device and the VPN server is encrypted using strong cryptographic protocols.
3. **IP Masking**: The VPN server assigns you a new IP address, making it appear as though you're browsing from the server's location.
4. **Data Decryption**: The VPN server decrypts your traffic and forwards it to the intended destination on the internet.

## Why You Need a VPN in 2026

### 1. Privacy Protection

ISPs can see every website you visit, every app you use, and every service you connect to. A VPN prevents your ISP from monitoring your online activities. With data privacy laws evolving and ISP data collection becoming more sophisticated, a VPN is essential for maintaining your privacy.

### 2. Security on Public Wi-Fi

Public Wi-Fi networks in coffee shops, airports, and hotels are notoriously insecure. Attackers can easily intercept unencrypted traffic on these networks. A VPN encrypts all your data, making it unreadable to anyone monitoring the network.

### 3. Bypass Censorship and Geo-Restrictions

Many countries impose internet censorship, blocking access to certain websites and services. A VPN allows you to bypass these restrictions by connecting to servers in other countries. Similarly, you can access geo-restricted content from streaming platforms while traveling.

### 4. Stop Online Tracking

Advertisers, data brokers, and social media platforms track your online behavior across websites using your IP address and browser fingerprinting. A VPN masks your IP address, making it significantly harder to track you.

### 5. Safe Torrenting

If you download files via peer-to-peer networks, your IP address is visible to everyone in the swarm. A VPN hides your IP address, protecting your identity while torrenting.

## What a VPN Doesn't Do

- A VPN does **not** make you anonymous. While it hides your IP address, websites can still identify you through cookies, browser fingerprinting, and login credentials.
- A VPN does **not** protect against malware or phishing attacks. You still need antivirus software and caution online.
- A VPN does **not** mean you should ignore basic security practices. Use strong, unique passwords and enable two-factor authentication.

## Conclusion

A VPN is a fundamental tool for online privacy and security in 2026. Whether you're concerned about ISP tracking, public Wi-Fi risks, or censorship, a quality VPN provides essential protection for your digital life.`,
        html: `<h2>What Is a VPN?</h2>
<p>A <strong>Virtual Private Network (VPN)</strong> creates an encrypted tunnel between your device and a remote server operated by a VPN service. All your internet traffic is routed through this tunnel, protecting it from eavesdroppers, ISPs, hackers, and government surveillance.</p>
<h2>How a VPN Works</h2>
<ol>
<li><strong>Connection Initiation</strong>: When you connect to a VPN, your device establishes a secure connection to a VPN server.</li>
<li><strong>Encryption</strong>: All data traveling between your device and the VPN server is encrypted using strong cryptographic protocols.</li>
<li><strong>IP Masking</strong>: The VPN server assigns you a new IP address, making it appear as though you are browsing from the server location.</li>
<li><strong>Data Decryption</strong>: The VPN server decrypts your traffic and forwards it to the intended destination.</li>
</ol>
<h2>Why You Need a VPN in 2026</h2>
<h3>1. Privacy Protection</h3>
<p>ISPs can see every website you visit and every app you use. A VPN prevents your ISP from monitoring your online activities.</p>
<h3>2. Security on Public Wi-Fi</h3>
<p>Public Wi-Fi networks in coffee shops, airports, and hotels are notoriously insecure. A VPN encrypts all your data, making it unreadable to anyone monitoring the network.</p>
<h3>3. Bypass Censorship</h3>
<p>Many countries impose internet censorship. A VPN allows you to bypass these restrictions by connecting to servers in other countries.</p>
<h3>4. Stop Online Tracking</h3>
<p>A VPN masks your IP address, making it significantly harder for advertisers and data brokers to track you.</p>
<h3>5. Safe Torrenting</h3>
<p>A VPN hides your IP address while torrenting, protecting your identity in peer-to-peer networks.</p>
<h2>Conclusion</h2>
<p>A VPN is a fundamental tool for online privacy and security in 2026. Whether you are concerned about ISP tracking, public Wi-Fi risks, or censorship, a quality VPN provides essential protection for your digital life.</p>`,
      },
      "aes-256-encryption-explained": {
        md: `## What Is AES-256 Encryption?

**Advanced Encryption Standard (AES)** is a symmetric encryption algorithm established by the U.S. National Institute of Standards and Technology (NIST) in 2001. AES-256 refers to the variant that uses a 256-bit key, making it the strongest publicly available encryption standard.

## How AES-256 Works

AES operates on a structure known as a substitution-permutation network. It processes data in 128-bit blocks using cryptographic keys of 128, 192, or 256 bits. With AES-256:

1. **Key Expansion**: The 256-bit key is expanded into multiple round keys.
2. **Initial Round**: The data is XORed with the first round key.
3. **Main Rounds**: 14 rounds of substitution, shifting, mixing, and key addition operations.
4. **Final Round**: A slightly modified final round produces the encrypted ciphertext.

## Why AES-256 Is Trusted

### Military-Grade Security

AES-256 is classified as a **Suite B** encryption algorithm by the U.S. National Security Agency (NSA) for protecting classified information up to the TOP SECRET level.

### Resistance to Attacks

A brute-force attack on AES-256 would require 2^256 attempts. Even with the most powerful supercomputers available today, this would take billions of years.

### Industry Adoption

AES-256 is used worldwide by governments, financial institutions, healthcare organizations, and technology companies to protect sensitive data.

## AES-256 in VPNs

When you use a VPN that implements AES-256 encryption, every packet of data traveling between your device and the VPN server is encrypted using this standard. This means:

- **Your data is unreadable** to anyone intercepting your traffic
- **Your communications remain private** from ISPs and network administrators
- **Your sensitive information stays secure** on untrusted networks

## Conclusion

AES-256 encryption is the backbone of modern digital security. When combined with a secure VPN protocol like WireGuard or OpenVPN, it provides an exceptionally strong layer of protection for your online activities.`,
        html: `<h2>What Is AES-256 Encryption?</h2>
<p><strong>Advanced Encryption Standard (AES)</strong> is a symmetric encryption algorithm established by NIST in 2001. AES-256 uses a 256-bit key, making it the strongest publicly available encryption standard.</p>
<h2>How AES-256 Works</h2>
<p>AES processes data in 128-bit blocks using cryptographic keys. With AES-256, 14 rounds of substitution, shifting, mixing, and key addition operations produce encrypted ciphertext.</p>
<h2>Why AES-256 Is Trusted</h2>
<h3>Military-Grade Security</h3>
<p>AES-256 is classified as a Suite B encryption algorithm by the NSA for protecting classified information up to the TOP SECRET level.</p>
<h3>Resistance to Attacks</h3>
<p>A brute-force attack on AES-256 would require 2^256 attempts, taking billions of years even with the most powerful supercomputers.</p>
<h2>Conclusion</h2>
<p>AES-256 encryption is the backbone of modern digital security, providing exceptionally strong protection for your online activities.</p>`,
      },
    };

    // Default content for any article not specifically mapped
    const defaultMd = `## ${summary.title}

${summary.excerpt}

## Key Takeaways

- ${summary.tags.map((t) => `${t} is an important topic in the ${summary.category} space.`).join("\n- ")}

## Learn More

This article explores ${summary.title.toLowerCase()}. Use a reliable VPN service like LiveMask to protect your online privacy and security.

Stay tuned for more in-depth articles on ${summary.tags.slice(0, 3).join(", ")} and other topics.`;

    const defaultHtml = `<h2>${summary.title}</h2>
<p>${summary.excerpt}</p>
<h3>Key Takeaways</h3>
<ul>
${summary.tags.map((t) => `  <li>${t} is an important topic in the ${summary.category} space.</li>`).join("\n")}
</ul>
<p>Stay tuned for more in-depth articles on ${summary.tags.slice(0, 3).join(", ")} and other topics.</p>`;

    const content = contentMap[slug] || {
      md: defaultMd,
      html: defaultHtml,
    };

    return {
      ...summary,
      content_markdown: content.md,
      content_html: content.html,
      seo_title: "",
      seo_description: "",
      canonical_url: `https://livemask.com/blog/${summary.slug}`,
      og_title: "",
      og_description: "",
      og_image_url: summary.cover_image_url,
      robots: "index,follow",
      created_at: summary.published_at,
      word_count: content.md.split(/\s+/).length,
      related_article_ids: [],
      source_type: "original",
      source_url: "",
    };
  }
}

export const blogClient = new BlogApiClient();
