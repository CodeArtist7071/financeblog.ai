import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { CheckSquare, XSquare, ExternalLink, Loader2, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { Comment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type for pending comments fetched from the API
interface PendingComment extends Comment {
  postTitle: string;
  postSlug: string;
}

export function CommentsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  
  // Fetch pending comments
  const {
    data: pendingComments,
    isLoading,
    error,
  } = useQuery<PendingComment[]>({
    queryKey: ["/api/comments/pending"],
  });
  
  // Mutation for approving comments
  const approveMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiRequest("PATCH", `/api/comments/${commentId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Comment approved",
        description: "The comment has been published on the blog.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to approve comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for deleting comments
  const deleteMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiRequest("DELETE", `/api/comments/${commentId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Comment deleted",
        description: "The comment has been removed permanently.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle expanding/collapsing comment text
  const toggleComment = (commentId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };
  
  // Handle approving a comment
  const handleApprove = (commentId: number) => {
    approveMutation.mutate(commentId);
  };
  
  // Handle deleting a comment
  const handleDelete = (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      deleteMutation.mutate(commentId);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-red-800 dark:text-red-300 font-medium">Error loading comments</h3>
        <p className="text-red-700 dark:text-red-400 text-sm mt-1">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Comments Management
        </CardTitle>
        <CardDescription>
          Approve or delete comments submitted by visitors to your blog posts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending Comments
              {pendingComments && pendingComments.length > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {pendingComments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved Comments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {!pendingComments || pendingComments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No pending comments to review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingComments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {comment.authorName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {comment.authorEmail} · Posted {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/posts/${comment.postSlug}`}
                          className="text-primary hover:text-primary/90 text-sm flex items-center"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Post
                        </Link>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mb-3">
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                        {expandedComments.has(comment.id) 
                          ? comment.content 
                          : comment.content.length > 100 
                            ? `${comment.content.slice(0, 100)}...` 
                            : comment.content
                        }
                      </p>
                      {comment.content.length > 100 && (
                        <button
                          onClick={() => toggleComment(comment.id)}
                          className="text-xs text-primary hover:text-primary/90 mt-1"
                        >
                          {expandedComments.has(comment.id) ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge variant="outline" className="text-xs">
                          On: {comment.postTitle}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending && deleteMutation.variables === comment.id && (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          <XSquare className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                          onClick={() => handleApprove(comment.id)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending && approveMutation.variables === comment.id && (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved">
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                This tab would display approved comments for reference.
                <br />
                Full implementation would fetch approved comments from each post.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}