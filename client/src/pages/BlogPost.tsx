import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2,
  Bookmark, 
  ThumbsUp, 
  MessageSquare, 
  Loader2, 
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogPostWithAuthor } from "@shared/schema";
import { SEO } from "@/components/SEO";

// Enhanced Markdown parser for finance content
const parseMarkdown = (markdown: string) => {
  // Convert headings
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-8">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3 mt-8">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2 mt-6">$1</h3>')
    // Convert paragraphs
    .replace(/^(?!<h[1-6]|<ul|<ol|<li|<blockquote|<pre|<p)(.+$)/gm, '<p class="mb-4">$1</p>')
    // Convert code blocks
    .replace(/```(.+?)```/gs, '<pre class="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto my-6 dark:bg-gray-900">$1</pre>')
    // Convert inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">$1</code>')
    // Convert lists
    .replace(/^\- (.+$)/gm, '<li class="ml-6 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+$)/gm, '<li class="ml-6 list-decimal">$2</li>')
    // Highlight finance-specific keywords
    .replace(/\b(Bitcoin|Ethereum|Forex|Stock|Crypto|Blockchain|DeFi|NFT|Dollar|Euro|Yen|USD|EUR|JPY)\b/g, 
      '<span class="font-semibold text-primary">$1</span>')
    // Format market data and percentages  
    .replace(/\b(\+\d+\.?\d*%|\-\d+\.?\d*%)\b/g, (match) => {
      const isPositive = match.startsWith('+');
      return `<span class="${isPositive ? 'text-green-600' : 'text-red-600'} font-medium">${match}</span>`;
    })
    // Add price formatting
    .replace(/\$\d+\.?\d*/g, '<span class="font-mono">$&</span>')
    // Group lists
    .replace(/(<li[^>]*>.*<\/li>)(\s*)(<li[^>]*>)/gs, '$1$2$3');

  // Group list items
  let inList = false;
  const lines = html.split("\n");
  const processedLines = [];

  for (const line of lines) {
    if (line.startsWith("<li") && !inList) {
      inList = true;
      processedLines.push("<ul class='my-4'>");
      processedLines.push(line);
    } else if (inList && !line.startsWith("<li")) {
      inList = false;
      processedLines.push("</ul>");
      processedLines.push(line);
    } else {
      processedLines.push(line);
    }
  }

  if (inList) {
    processedLines.push("</ul>");
  }

  return processedLines.join("\n");
};

// Get the badge variant based on the tag for finance/crypto
const getBadgeVariant = (tag: string) => {
  const tagMap: Record<string, string> = {
    // Finance/Crypto Tags
    "Bitcoin": "destructive",
    "Ethereum": "indigo",
    "Cryptocurrency": "destructive",
    "Blockchain": "secondary",
    "Crypto": "destructive",
    "Trading": "yellow",
    "DeFi": "violet",
    "NFT": "blue",
    "Market Analysis": "secondary",
    "Investing": "green",
    "Forex": "blue",
    "Stocks": "green",
    "Finance": "yellow",
    "Economics": "orange",
    "Personal Finance": "green",
    "Technical Analysis": "secondary",
    "Proof of Stake": "violet",
    
    // Tech Tags
    "TypeScript": "blue",
    "Next.js": "gray",
    "TailwindCSS": "green",
    "CSS": "purple",
    "JavaScript": "yellow",
    "React": "red",
    "Express": "indigo",
    "Node.js": "gray",
  };
  
  return tagMap[tag] || "default";
};

const BlogPost = () => {
  const [match, params] = useRoute<{ slug: string }>("/posts/:slug");
  
  const { data: post, isLoading, error } = useQuery<BlogPostWithAuthor>({
    queryKey: [`/api/posts/${params?.slug}`],
    enabled: !!params?.slug
  });

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Error loading blog post</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">The post you're looking for might not exist or there was an error loading it.</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  // Format the date
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Check if post is crypto or finance related
  const isFinancialPost = post.tags.some(tag => 
    ['Bitcoin', 'Ethereum', 'Cryptocurrency', 'Forex', 'Stocks', 'Trading', 'Finance', 'DeFi', 'Blockchain']
    .includes(tag)
  );

  // Show disclaimer for finance posts
  const showFinanceDisclaimer = isFinancialPost;

  return (
    <div className="py-10">
      {/* SEO tags for the blog post */}
      <SEO 
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
        article={{
          publishedTime: new Date(post.publishedAt).toISOString(),
          author: post.author.name,
          section: post.category?.name,
          tags: post.tags
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <nav className="flex items-center text-sm font-medium">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-primary">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            {post.category && (
              <>
                <Link 
                  href={`/category/${post.category.slug}`} 
                  className="text-gray-500 dark:text-gray-400 hover:text-primary"
                >
                  {post.category.name}
                </Link>
                <span className="mx-2 text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
              {post.title}
            </span>
          </nav>
        </div>
        
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Cover image */}
          <div className="relative">
            <img
              className="w-full h-[300px] lg:h-[400px] object-cover"
              src={post.coverImage}
              alt={`Featured image for ${post.title}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 md:p-8 w-full">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant={getBadgeVariant(tag) as any} className="text-xs font-medium">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
                  {post.title}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            {/* Author info */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <img
                  className="h-12 w-12 rounded-full border-2 border-primary"
                  src={post.author.picture}
                  alt={post.author.name}
                />
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {post.author.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {post.author.title}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <time dateTime={post.publishedAt.toString()}>{formattedDate}</time>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </div>
            
            {/* Financial warning/disclaimer */}
            {showFinanceDisclaimer && (
              <div className="my-6 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Disclaimer:</strong> The information provided in this article is for general informational purposes only. 
                    It should not be considered financial advice. Always conduct your own research and consult with a 
                    professional financial advisor before making any investment decisions.
                  </p>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div
              className="mt-6 prose prose-blue prose-lg dark:prose-invert text-gray-700 dark:text-gray-300 max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
            />
            
            {/* Related assets section - for crypto/finance posts */}
            {isFinancialPost && post.relatedAssets && post.relatedAssets.length > 0 && (
              <div className="mt-8 p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Related Assets
                </h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {post.relatedAssets.map((asset) => (
                    <Badge key={asset} variant="outline" className="px-3 py-1">
                      {asset}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Engagement section */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex space-x-3">
                <Button variant="ghost" size="sm" className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  <span>Like</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Comment</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <Bookmark className="h-4 w-4 mr-2" />
                  <span>Save</span>
                </Button>
              </div>
              <Button variant="outline" size="sm" className="flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                <span>Share</span>
              </Button>
            </div>
            
            {/* Author bio */}
            <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                About the author
              </h3>
              <div className="mt-3 flex items-start">
                <img 
                  src={post.author.picture} 
                  alt={post.author.name}
                  className="h-16 w-16 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{post.author.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{post.author.title}</p>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{post.author.bio}</p>
                  <div className="mt-3 flex space-x-4">
                    {post.author.twitterHandle && (
                      <a 
                        href={`https://twitter.com/${post.author.twitterHandle.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        Follow on Twitter
                      </a>
                    )}
                    {post.author.linkedinProfile && (
                      <a 
                        href={`https://${post.author.linkedinProfile}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Related articles section - with generic placeholders */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                You might also like
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <Link href="/" className="block group">
                  <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                    <img 
                      src="https://images.unsplash.com/photo-1631897642056-97a7abff3d17?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80" 
                      alt="Cryptocurrency article"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 w-full">
                        <Badge variant="destructive" className="text-xs font-medium">
                          Cryptocurrency
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    Understanding Decentralized Exchanges: The Future of Crypto Trading
                  </h4>
                </Link>
                <Link href="/" className="block group">
                  <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                    <img 
                      src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80" 
                      alt="Stock market article"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 w-full">
                        <Badge variant="green" className="text-xs font-medium">
                          Stocks
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    5 Tech Stocks to Watch in the Next Quarter
                  </h4>
                </Link>
              </div>
            </div>
          </div>
        </article>
        
        {/* Back to articles */}
        <div className="mt-8 flex justify-center">
          <Link href="/" className="text-primary hover:text-primary/80 inline-flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
