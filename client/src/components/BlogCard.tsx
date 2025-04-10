import { Link } from "wouter";
import { Badge } from "./ui/badge";
import { BlogPostWithAuthor } from "@shared/schema";

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

  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
      <div className="flex-shrink-0">
        <img 
          className="h-48 w-full object-cover" 
          src={post.coverImage} 
          alt={`Cover image for ${post.title}`} 
        />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <div className="block mt-2">
            <p className="text-sm font-medium text-primary">
              {post.tags.map((tag) => (
                <Badge key={tag} variant={getBadgeVariant(tag) as any} className="mr-2">
                  {tag}
                </Badge>
              ))}
            </p>
            <Link href={`/posts/${post.slug}`} className="block">
              <h3 className="mt-2 text-xl font-semibold text-gray-900 hover:text-primary">{post.title}</h3>
              <p className="mt-3 text-base text-gray-500">{post.excerpt}</p>
            </Link>
          </div>
        </div>
        <div className="mt-6 flex items-center">
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
