import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Reply } from "lucide-react";
import { CommentWithReplies } from "@shared/schema";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommentListProps {
  comments: CommentWithReplies[];
  postSlug: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function CommentList({ comments, postSlug }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} postSlug={postSlug} />
      ))}
    </div>
  );
}

interface CommentProps {
  comment: CommentWithReplies;
  postSlug: string;
  isReply?: boolean;
}

function Comment({ comment, postSlug, isReply = false }: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  return (
    <div className={`${isReply ? "ml-8 mt-4" : ""}`}>
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(comment.authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {comment.authorName}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formattedDate}
              </span>
            </div>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {comment.content}
            </p>
          </div>
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 dark:text-gray-400"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="h-3 w-3 mr-1" />
              {showReplyForm ? "Cancel" : "Reply"}
            </Button>
          </div>
          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                postSlug={postSlug}
                parentId={comment.id}
                onSuccess={() => setShowReplyForm(false)}
              />
            </div>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  postSlug={postSlug}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}