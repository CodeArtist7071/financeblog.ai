import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogPostWithAuthor } from "@shared/schema";

// Simple Markdown parser
const parseMarkdown = (markdown: string) => {
  // Convert headings
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-8">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3 mt-8">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2 mt-6">$1</h3>')
    // Convert paragraphs
    .replace(/^(?!<h[1-6]|<ul|<ol|<li|<blockquote|<pre|<p)(.+$)/gm, '<p class="mb-4">$1</p>')
    // Convert code blocks
    .replace(/```(.+?)```/gs, '<pre class="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto my-6">$1</pre>')
    // Convert inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded">$1</code>')
    // Convert lists
    .replace(/^\- (.+$)/gm, '<li class="ml-6 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+$)/gm, '<li class="ml-6 list-decimal">$2</li>')
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

const BlogPost = () => {
  const [match, params] = useRoute<{ slug: string }>("/posts/:slug");
  
  const { data: post, isLoading, error } = useQuery<BlogPostWithAuthor>({
    queryKey: [`/api/posts/${params?.slug}`],
    enabled: !!params?.slug
  });

  // Get the badge variant based on the tag
  const getBadgeVariant = (tag: string) => {
    const tagMap: Record<string, string> = {
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
        <p className="mt-2 text-gray-600">The post you're looking for might not exist or there was an error loading it.</p>
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

  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:text-blue-700 inline-flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Articles
          </Link>
        </div>
        
        <article>
          <header>
            <div className="flex space-x-3 mb-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant={getBadgeVariant(tag) as any}>
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={post.author.picture}
                  alt={post.author.name}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {post.author.name}
                </p>
                <div className="flex space-x-1 text-sm text-gray-500">
                  <time dateTime={post.publishedAt.toString()}>{formattedDate}</time>
                  <span aria-hidden="true">&middot;</span>
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </div>
          </header>
          
          <div className="mt-8">
            <img
              className="w-full h-64 object-cover rounded-lg"
              src={post.coverImage}
              alt={`Featured image for ${post.title}`}
            />
          </div>
          
          <div
            className="mt-8 prose prose-blue prose-lg text-gray-500 mx-auto"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
          />
          
          {/* Share section */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">Share this article</h3>
            <div className="flex space-x-6 mt-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Related articles */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">Related articles</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <a href="#" className="block">
                <h4 className="text-base font-medium text-gray-900 hover:text-primary">Getting Started with Server-Side Rendering in Next.js</h4>
                <p className="mt-1 text-sm text-gray-500">Learn the basics of SSR and how Next.js makes it simple</p>
              </a>
              <a href="#" className="block">
                <h4 className="text-base font-medium text-gray-900 hover:text-primary">Advanced TypeScript Patterns for React Developers</h4>
                <p className="mt-1 text-sm text-gray-500">Take your TypeScript skills to the next level with these patterns</p>
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
