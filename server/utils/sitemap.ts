import { IPostDocument } from '../models/post.model';
import { ICategoryDocument } from '../models/category.model';

type SitemapUrlConfig = {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

/**
 * Generate sitemap XML string
 */
export function generateSitemap(
  posts: IPostDocument[],
  categories: ICategoryDocument[],
  baseUrl: string = 'https://finance-crypto-blog.com' // Replace with actual domain in production
): string {
  const urls: SitemapUrlConfig[] = [];
  
  // Add homepage
  urls.push({
    loc: baseUrl,
    changefreq: 'daily',
    priority: 1.0
  });
  
  // Add blog index
  urls.push({
    loc: `${baseUrl}/blog`,
    changefreq: 'daily',
    priority: 0.9
  });
  
  // Add categories
  categories.forEach(category => {
    urls.push({
      loc: `${baseUrl}/category/${category.slug}`,
      changefreq: 'weekly',
      priority: 0.8
    });
  });
  
  // Add posts
  posts.forEach(post => {
    urls.push({
      loc: `${baseUrl}/post/${post.slug}`,
      lastmod: post.updatedAt.toISOString(),
      changefreq: 'monthly',
      priority: 0.7
    });
  });
  
  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return sitemap;
}