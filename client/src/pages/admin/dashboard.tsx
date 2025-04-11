import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Post, Author, Category } from "@shared/schema";
import { Loader2, BarChart2 } from "lucide-react";
import { Link } from "wouter";
import { CreateTopicForm } from "@/components/admin/CreateTopicForm";
import { CommentsManager } from "@/components/admin/CommentsManager";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: authors, isLoading: authorsLoading } = useQuery<Author[]>({
    queryKey: ["/api/authors"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const isLoading = postsLoading || authorsLoading || categoriesLoading;

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username || 'Admin'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="create-topic" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="create-topic">Create New Topic</TabsTrigger>
            <TabsTrigger value="manage-posts">Manage Posts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create-topic" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <CreateTopicForm categories={categories || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manage-posts" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
                    {posts && posts.length > 0 ? (
                      <div className="grid gap-4">
                        {posts.slice(0, 5).map((post) => (
                          <div 
                            key={post.id} 
                            className="border rounded-lg p-4 flex justify-between items-center"
                          >
                            <div>
                              <h3 className="font-medium">{post.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Published: {new Date(post.publishedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="destructive" size="sm">Delete</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No posts found.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-4">
            <CommentsManager />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold mb-4">Content Analytics</h2>
                  <Link href="/admin/analytics">
                    <Button variant="outline">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      View Full Analytics
                    </Button>
                  </Link>
                </div>
                <p className="mb-4">
                  Track your blog's performance, user engagement, and content metrics from the full analytics dashboard.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">250+</div>
                    <div className="text-sm text-muted-foreground">Daily Views</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{posts?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Posts</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">48%</div>
                    <div className="text-sm text-muted-foreground">Engagement Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}