import { Helmet } from "react-helmet-async";

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    type?: string;
    image?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

export function SEO({
  title = "Finance Blog",
  description = "Latest finance and cryptocurrency news, analysis and insights",
  canonical,
  openGraph,
  twitter,
}: SEOProps) {
  // Default title format for all pages
  const formattedTitle = title
    ? `${title} | Finance Blog`
    : "Finance Blog | Finance and Cryptocurrency News";

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* OpenGraph tags */}
      <meta property="og:title" content={openGraph?.title || formattedTitle} />
      <meta
        property="og:description"
        content={openGraph?.description || description}
      />
      {openGraph?.url && <meta property="og:url" content={openGraph.url} />}
      <meta property="og:type" content={openGraph?.type || "website"} />
      {openGraph?.image && <meta property="og:image" content={openGraph.image} />}
      
      {/* Twitter tags */}
      <meta name="twitter:card" content={twitter?.card || "summary_large_image"} />
      <meta name="twitter:title" content={twitter?.title || formattedTitle} />
      <meta
        name="twitter:description"
        content={twitter?.description || description}
      />
      {twitter?.image && <meta name="twitter:image" content={twitter.image} />}
    </Helmet>
  );
}