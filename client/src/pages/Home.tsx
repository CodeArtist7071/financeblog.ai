import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCard from "../components/BlogCard";
import { BlogPostWithAuthor } from "@shared/schema";
import { SEO } from "@/components/SEO";

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

  // Group posts by tag to create featured sections
  const featuredPost = posts?.[0];
  const remainingPosts = posts?.slice(1);

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* SEO tags for the homepage */}
      <SEO
        title="Finance & Crypto Blog - Latest Market Insights and Investment Strategies"
        description="Expert analysis on cryptocurrency, blockchain, stock markets, forex trading, and personal finance. Get the latest insights for smarter investing."
        image={featuredPost?.coverImage}
      />
      {/* Hero section */}
      <section className="relative py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">DevBlog</span>
              <span className="block mt-2 text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                Insights & Tutorials
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover the latest in web development, programming techniques, and technology trends
            </p>
          </div>
        </div>
      </section>

      {/* Featured post */}
      {featuredPost && (
        <section className="py-10 mb-10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Article
            </h2>
            <div className="relative rounded-lg overflow-hidden bg-white shadow-xl">
              <div className="lg:absolute lg:inset-0">
                <div className="lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2">
                  <img
                    className="h-56 w-full object-cover lg:absolute lg:h-full"
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                  />
                </div>
              </div>
              <div className="relative py-8 px-6 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:py-16 lg:px-8">
                <div className="lg:col-start-2">
                  <div className="flex space-x-2 mb-4">
                    {featuredPost.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-50 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {featuredPost.title}
                  </h3>
                  <p className="mt-3 text-lg text-gray-500">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-6">
                    <Button asChild className="flex items-center">
                      <a href={`/posts/${featuredPost.slug}`}>
                        Read more
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={featuredPost.author.picture}
                        alt={featuredPost.author.name}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {featuredPost.author.name}
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={featuredPost.publishedAt.toString()}>
                          {new Date(featuredPost.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                        <span aria-hidden="true">&middot;</span>
                        <span>{featuredPost.readingTime} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest articles */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Latest Articles
            </h2>
            <Button variant="outline">
              View all
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {remainingPosts?.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button>
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter section */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative py-10 px-6 bg-white rounded-lg shadow-xl overflow-hidden sm:px-12 lg:px-16">
            <div className="relative max-w-xl mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  Never miss a post!
                </h2>
                <p className="mt-3 text-lg leading-6 text-gray-500">
                  Subscribe to our newsletter for weekly updates on the latest articles, tutorials, and insights.
                </p>
              </div>
              <div className="mt-8">
                <form className="sm:flex">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-5 py-3 border border-gray-300 shadow-sm placeholder-gray-400 focus:ring-primary focus:border-primary rounded-md"
                    placeholder="Enter your email"
                  />
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <Button type="submit" className="w-full flex items-center justify-center">
                      Subscribe
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
