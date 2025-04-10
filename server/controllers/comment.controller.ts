import { Request, Response } from 'express';
import { Comment } from '../models/comment.model';
import { Post } from '../models/post.model';
import mongoose from 'mongoose';

// @desc    Create a new comment
// @route   POST /api/posts/:postId/comments
// @access  Public
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { content, authorName, authorEmail, parentId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    // If parentId is provided, check if it exists
    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ error: 'Invalid parent comment ID' });
      return;
    }
    
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        res.status(404).json({ error: 'Parent comment not found' });
        return;
      }
      
      // Ensure the parent comment belongs to the same post
      if (!parentComment.postId.equals(post._id)) {
        res.status(400).json({ error: 'Parent comment does not belong to this post' });
        return;
      }
    }
    
    // Create the comment
    // If user is authenticated, associate comment with user
    const comment = await Comment.create({
      content,
      postId,
      authorName,
      authorEmail,
      // If user is logged in and is admin, auto-approve the comment
      isApproved: req.user?.isAdmin === true,
      // If parentId is provided, set it
      parentId: parentId || null,
      // If user is logged in, associate the comment with the user
      userId: req.user?._id || null
    });
    
    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    // Get all approved comments for this post
    const comments = await Comment.find({ 
      postId,
      isApproved: true,
      parentId: null
    }).sort({ createdAt: -1 });
    
    // Get all replies for these comments
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          postId,
          parentId: comment._id,
          isApproved: true
        }).sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          replies
        };
      })
    );
    
    res.json(commentsWithReplies);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Get pending comments (admin only)
// @route   GET /api/comments/pending
// @access  Private/Admin
export const getPendingComments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    
    // Get all unapproved comments
    const comments = await Comment.find({ isApproved: false })
      .populate('postId', 'title slug')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Approve a comment
// @route   PATCH /api/comments/:id/approve
// @access  Private/Admin
export const approveComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    
    comment.isApproved = true;
    const updatedComment = await comment.save();
    
    res.json(updatedComment);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    
    // Delete the comment
    await comment.deleteOne();
    
    // If this is a parent comment, delete all replies as well
    if (!comment.parentId) {
      await Comment.deleteMany({ parentId: comment._id });
    }
    
    res.json({ message: 'Comment removed' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};