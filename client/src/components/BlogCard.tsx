import { Link } from "wouter";
import { Badge } from "./ui/badge";
import { BlogPostWithAuthor } from "@shared/schema";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogCardProps {
  post: BlogPostWithAuthor;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  // Format the date
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

  // Get the primary tag (first in the array)
  const primaryTag = post.tags[0];

  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          className="h-48 w-full object-cover" 
          src={post.coverImage} 
          alt={`Cover image for ${post.title}`} 
        />
        {primaryTag && (
          <div className="absolute top-4 left-4">
            <Badge 
              variant={getBadgeVariant(primaryTag) as any} 
              className="px-3 py-1 text-sm font-semibold shadow-md"
            >
              {primaryTag}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <Link href={`/posts/${post.slug}`} className="block">
            <h3 className="text-xl font-semibold text-gray-900 hover:text-primary transition-colors duration-200">
              {post.title}
            </h3>
          </Link>
          <p className="mt-3 text-base text-gray-500 line-clamp-3">{post.excerpt}</p>
          
          {/* Tags other than the primary tag */}
          {post.tags.length > 1 && (
            <div className="flex flex-wrap mt-4 gap-2">
              {post.tags.slice(1).map((tag) => (
                <Badge key={tag} variant={getBadgeVariant(tag) as any} className="mr-1">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Read more link */}
          <div className="mt-4">
            <Link href={`/posts/${post.slug}`} className="text-primary font-medium inline-flex items-center hover:underline">
              Read more
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center">
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
      </div>
    </div>
  );
};

export default BlogCard;
