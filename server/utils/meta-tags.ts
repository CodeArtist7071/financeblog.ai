/**
 * Interface for meta tag configuration
 */
interface MetaTagConfig {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  type: 'website' | 'article';
  publishedAt?: string;
  authorName?: string;
  category?: string;
}

/**
 * Interface for meta tags result
 */
interface MetaTags {
  title: string;
  meta: {
    name?: string;
    property?: string;
    content: string;
  }[];
  link: {
    rel: string;
    href: string;
  }[];
}

/**
 * Generate meta tags for SEO and social media sharing
 */
export function generateMetaTags(config: MetaTagConfig): MetaTags {
  const { 
    title, 
    description, 
    url, 
    imageUrl, 
    type,
    publishedAt,
    authorName,
    category
  } = config;
  
  const meta = [
    // Primary Meta Tags
    { name: 'description', content: description },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    
    // Open Graph / Facebook
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: imageUrl },
    
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: url },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ];
  
  // Add article-specific meta tags
  if (type === 'article') {
    if (publishedAt) {
      meta.push({ property: 'article:published_time', content: publishedAt });
    }
    
    if (category) {
      meta.push({ property: 'article:section', content: category });
    }
    
    if (authorName) {
      meta.push({ property: 'article:author', content: authorName });
    }
  }
  
  const link = [
    { rel: 'canonical', href: url }
  ];
  
  return {
    title,
    meta,
    link
  };
}