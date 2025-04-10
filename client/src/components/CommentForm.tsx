import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define validation schema for comment form
const commentSchema = z.object({
  authorName: z.string().min(2, "Name must be at least 2 characters"),
  authorEmail: z.string().email("Please enter a valid email address"),
  content: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment cannot exceed 1000 characters"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

type CommentFormProps = {
  postSlug: string;
  parentId?: number | null;
  onSuccess?: () => void;
};

export function CommentForm({ postSlug, parentId = null, onSuccess }: CommentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      authorName: "",
      authorEmail: "",
      content: "",
    },
  });
  
  // Create mutation for submitting a comment
  const commentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      const response = await apiRequest(
        "POST", 
        `/api/posts/${postSlug}/comments`, 
        { ...data, parentId }
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the post query to refetch with the new comment
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postSlug}`] });
      
      // Show success toast
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted for moderation.",
      });
      
      // Reset form
      reset();
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = async (data: CommentFormValues) => {
    setIsSubmitting(true);
    try {
      await commentMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Leave a Comment</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">Name</Label>
              <Input
                id="authorName"
                placeholder="Your name"
                {...register("authorName")}
              />
              {errors.authorName && (
                <p className="text-sm text-red-500">{errors.authorName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorEmail">Email</Label>
              <Input
                id="authorEmail"
                type="email"
                placeholder="Your email"
                {...register("authorEmail")}
              />
              {errors.authorEmail && (
                <p className="text-sm text-red-500">{errors.authorEmail.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Comment</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              className="min-h-[120px]"
              {...register("content")}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {parentId ? "Reply" : "Submit Comment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}