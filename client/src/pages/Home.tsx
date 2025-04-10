import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCard from "../components/BlogCard";
import { BlogPostWithAuthor } from "@shared/schema";

const Home = () => {
  const { data: posts, isLoading, error } = useQuery<BlogPostWithAuthor[]>({
    queryKey: ["/api/posts"]
  });

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Error loading blog posts</h2>
        <p className="mt-2 text-gray-600">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Latest Articles
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Tutorials, insights and updates from the world of web development
          </p>
        </div>
        
        <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-none">
          {posts?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button>
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
